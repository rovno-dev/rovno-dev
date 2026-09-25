"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CropIcon, PencilIcon, ArrowClockwiseIcon,
  TrashIcon, CheckIcon, CircleNotchIcon, EraserIcon, PaletteIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  ASPECT_PRESETS, fitRectForAspect, exportCroppedImage, loadImage,
  type AspectPresetId, type CropRect,
} from "./canvas-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Source URL or data URL to edit. */
  src: string | null;
  /** Suggested aspect ratio for the crop tab; null = free. */
  defaultAspect?: AspectPresetId | null;
  /** Called with the edited Blob and a suggested filename. */
  onApply: (blob: Blob, filename: string) => Promise<void> | void;
}

type Tab = "crop" | "draw";

const DRAW_COLORS = [
  "#0d0d11", // ink
  "#336dff", // brand blue
  "#ff3b30", // apple red
  "#ff9500", // apple orange
  "#34c759", // apple green
  "#ffffff", // white
];

export function ImageEditorDialog({
  open, onOpenChange, src, defaultAspect = null, onApply,
}: Props) {
  const [tab, setTab] = useState<Tab>("crop");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  // Crop state
  const [aspect, setAspect] = useState<AspectPresetId>(defaultAspect ?? "free");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });

  // Draw state
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [size, setSize] = useState(4);
  const [history, setHistory] = useState<string[]>([]); // data URLs for undo
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Load image on open
  useEffect(() => {
    if (!open || !src) return;
    setLoading(true);
    setImg(null);
    loadImage(src)
      .then((im) => {
        setImg(im);
        const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
        setCrop(fitRectForAspect(im.naturalWidth, im.naturalHeight, preset?.ratio ?? null));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [open, src]);

  // Recalculate crop when aspect changes
  useEffect(() => {
    if (!img) return;
    const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
    setCrop(fitRectForAspect(img.naturalWidth, img.naturalHeight, preset?.ratio ?? null));
  }, [aspect, img]);

  // Init draw canvas when tab first opens
  useEffect(() => {
    if (tab !== "draw" || !img || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const maxW = 800;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Seed history with the initial state.
    const initial = canvas.toDataURL("image/png");
    setHistory([initial]);
    setHistoryIdx(0);
  }, [tab, img]);

  // ---------- Crop interactions ----------
  // Pan the crop rect within the image by dragging the frame.
  const dragRef = useRef<{ startX: number; startY: number; startCrop: CropRect; mode: "pan" } | null>(null);

  const onCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
      mode: "pan",
    };
  };

  const onCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || !img) return;
    const container = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / container.width;
    const dy = (e.clientY - d.startY) / container.height;
    setCrop({
      x: Math.max(0, Math.min(1 - d.startCrop.width, d.startCrop.x + dx)),
      y: Math.max(0, Math.min(1 - d.startCrop.height, d.startCrop.y + dy)),
      width: d.startCrop.width,
      height: d.startCrop.height,
    });
  };

  const onCropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  // ---------- Draw interactions ----------
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const onDrawDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPos(e);
    setDrawing(true);
  };

  const onDrawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getPos(e);
    const last = lastPointRef.current;
    if (last) {
      // Quadratic smoothing between the previous midpoint and this point
      // — this is what gives the stroke its soft, natural feel rather
      // than a chain of hard line segments.
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = size * (canvas.width / canvas.clientWidth);
      const midX = (last.x + p.x) / 2;
      const midY = (last.y + p.y) / 2;
      ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();
    }
    lastPointRef.current = p;
  };

  const onDrawUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    setDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    // Snapshot for undo.
    const canvas = e.currentTarget;
    const next = canvas.toDataURL("image/png");
    setHistory((h) => {
      const trimmed = h.slice(0, historyIdx + 1);
      return [...trimmed, next];
    });
    setHistoryIdx((i) => i + 1);
  };

  const undo = () => {
    if (historyIdx <= 0 || !drawCanvasRef.current) return;
    const idx = historyIdx - 1;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const im = new Image();
    im.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(im, 0, 0);
    };
    im.src = history[idx];
    setHistoryIdx(idx);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1 || !drawCanvasRef.current) return;
    const idx = historyIdx + 1;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const im = new Image();
    im.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(im, 0, 0);
    };
    im.src = history[idx];
    setHistoryIdx(idx);
  };

  const clearDraw = () => {
    if (!img || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const next = canvas.toDataURL("image/png");
    setHistory((h) => [...h.slice(0, historyIdx + 1), next]);
    setHistoryIdx((i) => i + 1);
  };

  // ---------- Apply ----------
  const handleApply = async () => {
    if (!img) return;
    setApplying(true);
    try {
      let blob: Blob;
      let filename: string;
      if (tab === "crop") {
        blob = await exportCroppedImage(img, crop);
        filename = `crop-${Date.now()}.png`;
      } else {
        const canvas = drawCanvasRef.current;
        if (!canvas) throw new Error("Canvas missing");
        blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"),
        );
        filename = `draw-${Date.now()}.png`;
      }
      await onApply(blob, filename);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden p-0 gap-0 flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-(--outline) flex-row items-center justify-between space-y-0">
          <DialogTitle>Редактор изображения</DialogTitle>
          {/* Tab switcher */}
          <div className="inline-flex items-center gap-1 rounded-full bg-(--bg) p-1">
            <button
              type="button"
              onClick={() => setTab("crop")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                tab === "crop"
                  ? "bg-(--card) text-(--on-bg-high) shadow-sm"
                  : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              <Crop className="size-3.5" /> Обрезка
            </button>
            <button
              type="button"
              onClick={() => setTab("draw")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                tab === "draw"
                  ? "bg-(--card) text-(--on-bg-high) shadow-sm"
                  : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              <Pencil className="size-3.5" /> Рисование
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-(--bg)">
          {loading || !img ? (
            <div className="h-[400px] flex items-center justify-center text-(--on-bg-low)">
              <CircleNotchIcon className="size-5 animate-spin mr-2" />
              Загрузка…
            </div>
          ) : tab === "crop" ? (
            <CropTab
              img={img}
              crop={crop}
              aspect={aspect}
              setAspect={setAspect}
              onPointerDown={onCropPointerDown}
              onPointerMove={onCropPointerMove}
              onPointerUp={onCropPointerUp}
            />
          ) : (
            <DrawTab
              img={img}
              canvasRef={drawCanvasRef}
              color={color}
              size={size}
              setColor={setColor}
              setSize={setSize}
              canUndo={historyIdx > 0}
              canRedo={historyIdx < history.length - 1}
              onUndo={undo}
              onRedo={redo}
              onClear={clearDraw}
              onPointerDown={onDrawDown}
              onPointerMove={onDrawMove}
              onPointerUp={onDrawUp}
              drawing={drawing}
            />
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-(--outline) flex-row justify-between">
          <Button variant="text" onClick={() => onOpenChange(false)} disabled={applying}>
            Отмена
          </Button>
          <Button onClick={handleApply} disabled={!img || applying}>
            {applying ? <CircleNotchIcon className="size-4 animate-spin" /> : <Check className="size-4" />}
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

function CropTab({
  img, crop, aspect, setAspect,
  onPointerDown, onPointerMove, onPointerUp,
}: {
  img: HTMLImageElement;
  crop: CropRect;
  aspect: AspectPresetId;
  setAspect: (a: AspectPresetId) => void;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp: React.PointerEventHandler<HTMLDivElement>;
}) {
  // Compute display size — cap the long side so the container stays manageable.
  const maxSide = 620;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  return (
    <div className="p-5 space-y-4">
      {/* Aspect presets */}
      <div className="flex flex-wrap gap-2">
        {ASPECT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setAspect(p.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              aspect === p.id
                ? "bg-(--primary) text-white"
                : "bg-(--card) text-(--on-bg-medium) hover:text-(--on-bg-high) border border-(--outline)"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Viewport */}
      <div className="flex justify-center">
        <div
          className="relative select-none touch-none cursor-move"
          style={{ width: w, height: h }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img
            src={img.src}
            alt=""
            draggable={false}
            style={{ width: w, height: h }}
            className="block rounded-lg"
          />
          {/* Dark mask outside crop */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              viewBox={`0 0 ${w} ${h}`}
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                <mask id="crop-mask">
                  <rect width={w} height={h} fill="white" />
                  <rect
                    x={crop.x * w}
                    y={crop.y * h}
                    width={crop.width * w}
                    height={crop.height * h}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width={w}
                height={h}
                fill="rgba(0,0,0,0.55)"
                mask="url(#crop-mask)"
              />
            </svg>
          </div>
          {/* Crop border */}
          <div
            className="absolute border-2 border-white pointer-events-none rounded-sm"
            style={{
              left: crop.x * w,
              top: crop.y * h,
              width: crop.width * w,
              height: crop.height * h,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      </div>

      <p className="text-[11px] text-(--on-bg-low) text-center">
        Перетащите рамку, чтобы выбрать область · выберите формат сверху
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function DrawTab({
  img, canvasRef, color, size, setColor, setSize,
  canUndo, canRedo, onUndo, onRedo, onClear,
  onPointerDown, onPointerMove, onPointerUp, drawing,
}: {
  img: HTMLImageElement;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  color: string;
  size: number;
  setColor: (c: string) => void;
  setSize: (s: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onPointerDown: React.PointerEventHandler<HTMLCanvasElement>;
  onPointerMove: React.PointerEventHandler<HTMLCanvasElement>;
  onPointerUp: React.PointerEventHandler<HTMLCanvasElement>;
  drawing: boolean;
}) {
  const maxSide = 620;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const displayW = img.naturalWidth * scale;
  const displayH = img.naturalHeight * scale;

  return (
    <div className="p-5 space-y-4">
      {/* Canvas viewport */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ width: displayW, height: displayH, touchAction: "none" }}
          className={cn(
            "block rounded-lg select-none",
            drawing ? "cursor-crosshair" : "cursor-crosshair"
          )}
        />
      </div>

      {/* Apple-style floating toolbar */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-(--outline) bg-(--card)/95 backdrop-blur-md px-2 py-1.5 shadow-lg">
          {/* Color dots */}
          <div className="flex items-center gap-1 pr-1.5 border-r border-(--outline)">
            {DRAW_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "size-6 rounded-full transition-transform hover:scale-110",
                  color === c ? "ring-2 ring-offset-2 ring-offset-(--card)" : ""
                )}
                style={{
                  background: c,
                  boxShadow:
                    c === "#ffffff"
                      ? "inset 0 0 0 1px rgba(0,0,0,0.15)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.15)",
                  // ring-color matches the swatch for the selected one
                  ["--tw-ring-color" as any]: c,
                }}
                aria-label={`Цвет ${c}`}
              />
            ))}
          </div>

          {/* Size slider */}
          <div className="flex items-center gap-2 px-2 border-r border-(--outline)">
            <div
              className="rounded-full bg-(--on-bg-high)"
              style={{ width: 4, height: 4 }}
            />
            <input
              type="range"
              min={1}
              max={24}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-24 accent-(--primary)"
              aria-label="Размер кисти"
            />
            <div
              className="rounded-full bg-(--on-bg-high)"
              style={{ width: 4 + size * 0.4, height: 4 + size * 0.4 }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 pl-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors",
                canUndo
                  ? "text-(--on-bg-high) hover:bg-(--state-hover)"
                  : "text-(--on-bg-low) opacity-40 cursor-not-allowed"
              )}
              title="Отменить"
            >
              <ArrowCounterClockIconwise className="size-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors",
                canRedo
                  ? "text-(--on-bg-high) hover:bg-(--state-hover)"
                  : "text-(--on-bg-low) opacity-40 cursor-not-allowed"
              )}
              title="Повторить"
            >
              <ArrowClockwiseIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              className="size-8 rounded-full flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) transition-colors"
              title="Очистить"
            >
              <Trash className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-(--on-bg-low) text-center">
        Рисуйте мышью или пальцем · сглаживание включено
      </p>
    </div>
  );
}
