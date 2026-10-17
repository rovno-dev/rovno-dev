"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CropIcon, PencilIcon, ArrowClockwiseIcon,
  TrashIcon, CheckIcon, CircleNotchIcon, ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  ASPECT_PRESETS, fitRectForAspect, exportCroppedImage, loadImage,
  type AspectPresetId, type CropRect,
} from "./canvas-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  defaultAspect?: AspectPresetId | null;
  lockedAspect?: boolean;
  onApply: (blob: Blob, filename: string) => Promise<void> | void;
}

type Tab = "crop" | "draw";
const DRAW_COLORS = ["#0d0d11", "#336dff", "#ff3b30", "#ff9500", "#34c759", "#ffffff"];

export function ImageEditorDialog({
  open, onOpenChange, src, defaultAspect = null, lockedAspect = false, onApply,
}: Props) {
  const [tab, setTab] = useState<Tab>("crop");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  
  const [aspect, setAspect] = useState<AspectPresetId>(defaultAspect ?? "free");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [size, setSize] = useState(4);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  
  useEffect(() => {
    if (!open || !src) return;
    setLoading(true);
    setImg(null);
    loadImage(src)
      .then((im) => {
        setImg(im);
        const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
        setCrop(fitRectForAspect(im.naturalWidth, im.naturalHeight, preset?.ratio ?? null));
        setZoom(1);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [open, src]);
  
  useEffect(() => {
    if (!img) return;
    const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
    setCrop(fitRectForAspect(img.naturalWidth, img.naturalHeight, preset?.ratio ?? null));
    setZoom(1);
  }, [aspect, img]);
  
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
    const initial = canvas.toDataURL("image/png");
    setHistory([initial]);
    setHistoryIdx(0);
  }, [tab, img]);
  
  const handleZoom = (nextZoom: number) => {
    if (!img) return;
    const z = Math.max(1, Math.min(8, nextZoom));
    if (Math.abs(z - zoom) < 0.001) return;
    const ratio = zoom / z;
    const cx = crop.x + crop.width / 2;
    const cy = crop.y + crop.height / 2;
    let w = crop.width * ratio;
    let h = crop.height * ratio;
    if (w > 1) { h *= 1 / w; w = 1; }
    if (h > 1) { w *= 1 / h; h = 1; }
    const x = Math.max(0, Math.min(1 - w, cx - w / 2));
    const y = Math.max(0, Math.min(1 - h, cy - h / 2));
    setCrop({ x, y, width: w, height: h });
    setZoom(z);
  };
  
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
    const canvas = e.currentTarget;
    const next = canvas.toDataURL("image/png");
    setHistory((h) => [...h.slice(0, historyIdx + 1), next]);
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
          <div className="inline-flex items-center gap-1 rounded-full bg-(--bg) p-1">
            <button
              type="button"
              onClick={() => setTab("crop")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                tab === "crop" ? "bg-(--card) text-(--on-bg-high) shadow-sm" : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              <CropIcon className="size-3.5" /> Обрезка
            </button>
            <button
              type="button"
              onClick={() => setTab("draw")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                tab === "draw" ? "bg-(--card) text-(--on-bg-high) shadow-sm" : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              <PencilIcon className="size-3.5" /> Рисование
            </button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-(--bg)">
          {loading || !img ? (
            <div className="h-[400px] flex items-center justify-center text-(--on-bg-low)">
              <CircleNotchIcon className="size-5 animate-spin mr-2" /> Загрузка…
            </div>
          ) : tab === "crop" ? (
            <CropTab
              img={img}
              crop={crop}
              onCropChange={setCrop}
              aspect={aspect}
              setAspect={setAspect}
              zoom={zoom}
              onZoom={handleZoom}
              locked={lockedAspect}
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
          <Button variant="text" onClick={() => onOpenChange(false)} disabled={applying}>Отмена</Button>
          <Button onClick={handleApply} disabled={!img || applying}>
            {applying ? <CircleNotchIcon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CropTab({
  img, crop, onCropChange, aspect, setAspect, zoom, onZoom, locked,
}: {
  img: HTMLImageElement;
  crop: CropRect;
  onCropChange: (next: CropRect) => void;
  aspect: AspectPresetId;
  setAspect: (a: AspectPresetId) => void;
  zoom: number;
  onZoom: (nextZoom: number) => void;
  locked?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [offset, setOffset] = useState({x: 0, y: 0});

  const presetRatio = ASPECT_PRESETS.find((p) => p.id === aspect)?.ratio ?? null;
  // Fallback to the image's natural aspect ratio for "free" instead of
  // deriving it from `crop`, which would create a feedback loop.
  const frameAspect = presetRatio ?? (img.naturalWidth / img.naturalHeight);

  const maxFrameW = 560;
  const maxFrameH = 460;
  let fw = maxFrameW;
  let fh = fw / frameAspect;
  if (fh > maxFrameH) {
    fh = maxFrameH;
    fw = fh * frameAspect;
  }

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [aspect]);

  const baseScale = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
  const currentScale = baseScale * zoom;
  const imgWidth = img.naturalWidth * currentScale;
  const imgHeight = img.naturalHeight * currentScale;

  const maxOffsetX = Math.max(0, (imgWidth - fw) / 2);
  const maxOffsetY = Math.max(0, (imgHeight - fh) / 2);

  const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offset.x));
  const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offset.y));

  useEffect(() => {
    if (offset.x !== clampedX || offset.y !== clampedY) {
      setOffset({x: clampedX, y: clampedY});
    }
  }, [clampedX, clampedY, offset.x, offset.y]);

  useEffect(() => {
    const imgLeft = (fw - imgWidth) / 2 + clampedX;
    const imgTop = (fh - imgHeight) / 2 + clampedY;
    const cropX = Math.max(0, Math.min(1, (0 - imgLeft) / imgWidth));
    const cropY = Math.max(0, Math.min(1, (0 - imgTop) / imgHeight));
    const cropW = Math.min(1, fw / imgWidth);
    const cropH = Math.min(1, fh / imgHeight);
    
    if (
      Math.abs(crop.x - cropX) > 0.001 ||
      Math.abs(crop.y - cropY) > 0.001 ||
      Math.abs(crop.width - cropW) > 0.001 ||
      Math.abs(crop.height - cropH) > 0.001
    ) {
      onCropChange({x: cropX, y: cropY, width: cropW, height: cropH});
    }
  }, [clampedX, clampedY, imgWidth, imgHeight, fw, fh, crop, onCropChange]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = 1 + (-e.deltaY * 0.002);
      onZoom(zoom * factor);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [onZoom, zoom]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragStart(null);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!locked && ASPECT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setAspect(p.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              aspect === p.id
                ? "bg-(--on-bg-high) text-(--bg)"
                : "bg-(--card) text-(--on-bg-medium) hover:text-(--on-bg-high) border border-(--outline)"
            )}
          >
            {p.label}
          </button>
        ))}
        <div className="ml-auto inline-flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) px-1 py-0.5 h-8">
          <button
            type="button"
            onClick={() => onZoom(zoom / 1.25)}
            disabled={zoom <= 1.001}
            className="inline-flex items-center justify-center size-7 rounded-full text-(--on-bg-high) hover:bg-(--state-hover) disabled:opacity-40 disabled:cursor-not-allowed text-base leading-none"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => { onZoom(1); setOffset({x:0,y:0}); }}
            className="px-2 text-xs font-mono tabular-nums text-(--on-bg-medium) hover:text-(--on-bg-high) min-w-[3.5ch]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => onZoom(zoom * 1.25)}
            disabled={zoom >= 7.999}
            className="inline-flex items-center justify-center size-7 rounded-full text-(--on-bg-high) hover:bg-(--state-hover) disabled:opacity-40 disabled:cursor-not-allowed text-base leading-none"
          >
            +
          </button>
        </div>
      </div>
      <div ref={viewportRef} className="flex justify-center">
        <div
          className="relative overflow-hidden select-none touch-none cursor-move rounded-lg border-2 border-white"
          style={{
            width: fw,
            height: fh,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.25)",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            src={img.src}
            alt=""
            draggable={false}
            className="absolute pointer-events-none max-w-none"
            style={{
              width: imgWidth,
              height: imgHeight,
              left: (fw - imgWidth) / 2 + clampedX,
              top: (fh - imgHeight) / 2 + clampedY,
            }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
          </div>
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/90 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/90 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/90 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/90 pointer-events-none" />
        </div>
      </div>
      <p className="text-[11px] text-(--on-bg-low) text-center">
        Перетащите изображение - колёсико мыши или +/− для масштаба - выберите формат сверху
      </p>
    </div>
  );
}

function DrawTab({
  img, canvasRef, color, size, setColor, setSize,
  canUndo, canRedo, onUndo, onRedo, onClear,
  onPointerDown, onPointerMove, onPointerUp, drawing,
}: any) {
  const maxSide = 620;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const displayW = img.naturalWidth * scale;
  const displayH = img.naturalHeight * scale;
  return (
    <div className="p-5 space-y-4">
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ width: displayW, height: displayH, touchAction: "none" }}
          className={cn("block rounded-lg select-none cursor-crosshair")}
        />
      </div>
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-(--outline) bg-(--card)/95 backdrop-blur-md px-2 py-1.5 shadow-lg">
          <div className="flex items-center gap-1 pr-1.5 border-r border-(--outline)">
            {DRAW_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn("size-6 rounded-full transition-transform hover:scale-110", color === c ? "ring-2 ring-offset-2 ring-offset-(--card)" : "")}
                style={{ background: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.15)" : "inset 0 0 0 1px rgba(255,255,255,0.15)", ["--tw-ring-color" as any]: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 px-2 border-r border-(--outline)">
            <div className="rounded-full bg-(--on-bg-high)" style={{ width: 4, height: 4 }} />
            <input type="range" min={1} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-(--primary)" />
            <div className="rounded-full bg-(--on-bg-high)" style={{ width: 4 + size * 0.4, height: 4 + size * 0.4 }} />
          </div>
          <div className="flex items-center gap-0.5 pl-1">
            <button type="button" onClick={onUndo} disabled={!canUndo} className={cn("size-8 rounded-full flex items-center justify-center transition-colors", canUndo ? "text-(--on-bg-high) hover:bg-(--state-hover)" : "text-(--on-bg-low) opacity-40 cursor-not-allowed")}>
              <ArrowCounterClockwiseIcon className="size-4" />
            </button>
            <button type="button" onClick={onRedo} disabled={!canRedo} className={cn("size-8 rounded-full flex items-center justify-center transition-colors", canRedo ? "text-(--on-bg-high) hover:bg-(--state-hover)" : "text-(--on-bg-low) opacity-40 cursor-not-allowed")}>
              <ArrowClockwiseIcon className="size-4" />
            </button>
            <button type="button" onClick={onClear} className="size-8 rounded-full flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) transition-colors">
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
