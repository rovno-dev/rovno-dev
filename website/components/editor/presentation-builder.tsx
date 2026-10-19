"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Trash, FloppyDisk, Rocket, Gear,
  DotsSixVertical, Code, Eye, Layout, PencilSimple
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideRenderer } from "@/components/presentation/slide-renderer";
import type { Presentation, Slide } from "@/utils/api/presentations";

const TEMPLATES = [
  { id: "cover-glitch", label: "Cover (Glitch)", type: "cover", layout: "glitch" },
  { id: "cover-cinematic", label: "Cover (Cinematic)", type: "cover", layout: "cinematic" },
  { id: "speaker", label: "Speaker Profile", type: "speaker" },
  { id: "split", label: "Split Screen", type: "split" },
  { id: "quote", label: "Quote", type: "quote" },
  { id: "image", label: "Image Only", type: "image" },
  { id: "text", label: "Text Block", type: "text" },
];

export function PresentationBuilder({ initial, onSave }: { initial: Presentation | null, onSave: (data: any) => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [startsAt, setStartsAt] = useState(initial?.starts_at?.slice(0, 16) || "");
  const [endsAt, setEndsAt] = useState(initial?.ends_at?.slice(0, 16) || "");
  const [slides, setSlides] = useState<Slide[]>(initial?.slides || []);
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  // New state for the Figma-style inspector
  const [editModalOpen, setEditModalOpen] = useState(false);

  const activeSlide = slides[activeIdx];

  const addSlide = (templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    const newSlide: Slide = {
      order: slides.length,
      type: tmpl.type as any,
      content: { title: "New Slide", layout: tmpl.layout },
    };
    setSlides([...slides, newSlide]);
    setActiveIdx(slides.length);
  };

  const updateSlide = (key: string, val: any) => {
    const next = [...slides];
    next[activeIdx] = { ...activeSlide, content: { ...activeSlide.content, [key]: val } };
    setSlides(next);
  };

  const removeSlide = (idx: number) => {
    const next = slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    setSlides(next);
    setActiveIdx(Math.max(0, idx - 1));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newSlides = [...slides];
    const [moved] = newSlides.splice(draggedIdx, 1);
    newSlides.splice(index, 0, moved);
    setSlides(newSlides.map((s, i) => ({ ...s, order: i })));
    setDraggedIdx(index);
    setActiveIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setSlides(parsed.map((s, i) => ({ ...s, order: i })));
        setJsonDialogOpen(false);
        toast.success("JSON успешно загружен");
      } else {
        toast.error("JSON должен быть массивом слайдов");
      }
    } catch {
      toast.error("Неверный формат JSON");
    }
  };

  const handleSave = (publish: boolean) => {
    onSave({
      title, slug, description,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_published: publish,
      slides: slides
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-(--bg) overflow-hidden rounded-xl border border-(--outline)">
      
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 border-b border-(--outline) bg-(--card) shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Button onClick={() => handleSave(false)} variant="outlined" size="small">
            <FloppyDisk className="size-4" /> Черновик
          </Button>
          <Button onClick={() => handleSave(true)} size="small">
            <Rocket className="size-4" /> Опубликовать
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="text" size="small" onClick={() => setSettingsOpen(true)}>
            <Gear className="size-4" /> Настройки
          </Button>
          <Button variant="text" size="small" onClick={() => {
            setJsonInput(JSON.stringify(slides, null, 2));
            setJsonDialogOpen(true);
          }}>
            <Code className="size-4" /> JSON
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Slide List (Figma Layers style) */}
        <div className="w-64 flex flex-col border-r border-(--outline) bg-(--card) shrink-0 z-10">
          <div className="p-3 border-b border-(--outline) flex items-center justify-between bg-(--bg)">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--on-bg-medium)">Слайды</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="tonal" size="icon-small" className="size-6 rounded-md">
                  <Plus className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {TEMPLATES.map(t => (
                  <DropdownMenuItem key={t.id} onClick={() => addSlide(t.id)}>
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-admin">
            {slides.length === 0 && (
              <p className="text-xs text-center text-(--on-bg-low) py-8">Нет слайдов</p>
            )}
            {slides.map((s, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveIdx(i)}
                onDoubleClick={() => { setActiveIdx(i); setEditModalOpen(true); }}
                className={`p-2 rounded-lg border text-sm cursor-pointer flex items-center gap-2 group transition-all select-none ${i === activeIdx ? 'border-(--primary) bg-(--primary-glass)' : 'border-transparent hover:bg-(--state-hover)'} ${draggedIdx === i ? 'opacity-50 ring-1 ring-(--primary)' : ''}`}
              >
                <DotsSixVertical className="text-(--on-bg-low) shrink-0 cursor-grab" />
                <div className="flex-1 truncate flex items-center gap-2">
                  <span className="text-[10px] text-(--on-bg-low) font-mono w-4 text-right">{i + 1}</span>
                  <span className="truncate">{s.content.title || s.type}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeSlide(i); }} 
                  className="opacity-0 group-hover:opacity-100 hover:text-(--error) transition-opacity"
                >
                  <Trash className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas - Live Preview */}
        <div className="flex-1 bg-[#0a0a0a] relative flex flex-col">
          {/* Canvas Top Bar */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
             <div className="bg-black/50 text-white/50 text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 font-mono">
               {activeSlide ? `${activeIdx + 1} / ${slides.length} • ${activeSlide.type.toUpperCase()}` : 'NO SLIDE'}
             </div>
          </div>

          {/* Floating Action Button to Edit */}
          {activeSlide && (
            <div className="absolute top-4 right-4 z-20">
              <Button size="small" variant="glass" onClick={() => setEditModalOpen(true)}>
                <PencilSimple className="size-4 mr-2" /> Редактировать слайд
              </Button>
            </div>
          )}

          {/* Render the active slide */}
          <div className="flex-1 relative flex items-center justify-center p-8 lg:p-16">
             <div className="w-full h-full max-w-[1400px] max-h-[800px] relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                {activeSlide ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIdx}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <SlideRenderer slide={activeSlide} />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                    <Layout className="size-24 mb-4" />
                    <p className="font-mono uppercase tracking-widest">Выберите слайд</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Slide Editor Modal (Figma Properties style) */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-admin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilSimple className="size-5" />
              Редактирование: {activeSlide?.type}
            </DialogTitle>
          </DialogHeader>
          {activeSlide && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Заголовок</label>
                <Input value={activeSlide.content.title || ""} onChange={e => updateSlide("title", e.target.value)} />
              </div>
              
              {(activeSlide.type === "text" || activeSlide.type === "split" || activeSlide.type === "quote" || activeSlide.type === "speaker" || activeSlide.type === "cover") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст / Подзаголовок</label>
                  <Textarea className="min-h-[100px]" value={activeSlide.content.subtitle || ""} onChange={e => updateSlide("subtitle", e.target.value)} />
                </div>
              )}

              {(activeSlide.type === "image" || activeSlide.type === "cover" || activeSlide.type === "split" || activeSlide.type === "speaker") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Картинки</label>
                  <Input value={activeSlide.content.image_url || ""} onChange={e => updateSlide("image_url", e.target.value)} placeholder="https://..." />
                </div>
              )}

              {activeSlide.type === "speaker" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Био спикера</label>
                  <Textarea className="min-h-[80px]" value={activeSlide.content.text || ""} onChange={e => updateSlide("text", e.target.value)} />
                </div>
              )}

              {activeSlide.type === "cover" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Анимация обложки</label>
                  <Select value={activeSlide.content.layout || "minimal"} onValueChange={v => updateSlide("layout", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="glitch">Glitch (Hacker)</SelectItem>
                      <SelectItem value="cinematic">Cinematic (Dark)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-(--outline)">
                <label className="text-sm font-medium text-(--on-bg-medium)">Заметки спикера (не видны зрителям)</label>
                <Textarea className="min-h-[80px] bg-(--bg)" value={activeSlide.notes || ""} onChange={e => {
                  const next = [...slides]; next[activeIdx].notes = e.target.value; setSlides(next);
                }} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditModalOpen(false)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Настройки презентации</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Доступ с</label>
                <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Доступ до</label>
                <Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* JSON Dialog */}
      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>JSON Импорт / Экспорт</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-(--on-bg-medium) mb-2">
              Вы можете использовать AI для генерации слайдов. Доступные типы: <code>cover, speaker, split, quote, image, text</code>.
            </p>
            <Textarea
              className="font-mono text-xs min-h-[400px]"
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
            />
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            <Button variant="outlined" onClick={() => setJsonInput(JSON.stringify(slides, null, 2))}>
              Экспорт текущих
            </Button>
            <div className="flex gap-2">
              <Button variant="outlined" onClick={() => setJsonDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleJsonImport}>Применить</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
