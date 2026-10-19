"use client";
import { useState, useEffect } from "react";
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
  DotsSixVertical, Palette, Sun, Moon
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideRenderer } from "@/components/presentation/slide-renderer";
import { SLIDE_META } from "@/components/presentation/registry";
import { AiDocsModal } from "@/components/presentation/ai-docs";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import type { Presentation, Slide, SlideTheme } from "@/utils/api/presentations";

export function PresentationBuilder({ initial, onSave }: { initial: Presentation | null, onSave: (data: any) => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [startsAt, setStartsAt] = useState<Date | undefined>(initial?.starts_at ? new Date(initial.starts_at) : undefined);
  const [endsAt, setEndsAt] = useState<Date | undefined>(initial?.ends_at ? new Date(initial.ends_at) : undefined);
  
  const [slides, setSlides] = useState<Slide[]>(initial?.slides || []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const activeSlide = slides[activeIdx];

  const addSlide = (type: string) => {
    const meta = SLIDE_META.find(t => t.type === type);
    if (!meta) return;
    const newSlide: Slide = {
      order: slides.length,
      type: meta.type,
      content: { title: "New Slide" },
      theme: { mode: "dark" }
    };
    setSlides([...slides, newSlide]);
    setActiveIdx(slides.length);
  };

  const updateSlide = (key: string, val: any) => {
    const next = [...slides];
    next[activeIdx] = { ...activeSlide, content: { ...activeSlide.content, [key]: val } };
    setSlides(next);
  };

  const updateTheme = (key: keyof SlideTheme, val: string) => {
    const next = [...slides];
    next[activeIdx] = { 
      ...activeSlide, 
      theme: { ...(activeSlide.theme || { mode: "dark" }), [key]: val } 
    };
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

  const handleDragEnd = () => setDraggedIdx(null);

  const handleSave = (publish: boolean) => {
    onSave({
      title, slug, description,
      starts_at: startsAt ? startsAt.toISOString() : null,
      ends_at: endsAt ? endsAt.toISOString() : null,
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
          <div className="h-6 w-px bg-(--outline) mx-2" />
          <Button variant="text" size="small" onClick={() => setSettingsOpen(true)}>
            <Gear className="size-4 mr-2" /> Настройки
          </Button>
          <AiDocsModal />
        </div>
        <div className="text-sm font-mono text-(--on-bg-low)">
           {activeSlide ? `${activeIdx + 1} / ${slides.length}` : '0 / 0'}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Slide List */}
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
                {SLIDE_META.map(t => (
                  <DropdownMenuItem key={t.type} onClick={() => addSlide(t.type)}>
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

        {/* Center - Canvas */}
        <div className="flex-1 bg-[#0a0a0a] relative flex flex-col items-center justify-center p-8 lg:p-12">
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
                  <SlideRenderer slide={activeSlide} isEditing={true} update={updateSlide} />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                <Palette className="size-16 mb-4" />
                <p className="font-mono uppercase tracking-widest">Выберите слайд</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Theme & Properties */}
        {activeSlide && (
          <div className="w-72 flex flex-col border-l border-(--outline) bg-(--card) shrink-0 z-10 p-4 space-y-6 overflow-y-auto scrollbar-admin">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-(--on-bg-medium) mb-4 flex items-center gap-2">
                <Palette className="size-4" /> Тема слайда
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-(--on-bg-medium)">Режим</label>
                  <div className="flex bg-(--bg) rounded-lg p-1 border border-(--outline)">
                    <button
                      onClick={() => updateTheme("mode", "light")}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${(activeSlide.theme?.mode || "dark") === "light" ? "bg-white text-black shadow-sm" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`}
                    >
                      <Sun className="size-3.5" /> Light
                    </button>
                    <button
                      onClick={() => updateTheme("mode", "dark")}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${(activeSlide.theme?.mode || "dark") === "dark" ? "bg-black text-white shadow-sm" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`}
                    >
                      <Moon className="size-3.5" /> Dark
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-(--on-bg-medium)">Фоновый цвет (Hex)</label>
                  <div className="flex gap-2">
                     <Input 
                       type="color" 
                       value={activeSlide.theme?.bg || (activeSlide.theme?.mode === 'light' ? '#ffffff' : '#000000')} 
                       onChange={(e) => updateTheme("bg", e.target.value)}
                       className="w-10 h-10 p-1 cursor-pointer"
                     />
                     <Input 
                       value={activeSlide.theme?.bg || ""} 
                       onChange={(e) => updateTheme("bg", e.target.value)}
                       placeholder="auto"
                       className="flex-1 font-mono text-xs h-10"
                     />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-(--on-bg-medium)">Бренд-цвет (Hex)</label>
                  <div className="flex gap-2">
                     <Input 
                       type="color" 
                       value={activeSlide.theme?.brand || '#CCFF00'} 
                       onChange={(e) => updateTheme("brand", e.target.value)}
                       className="w-10 h-10 p-1 cursor-pointer"
                     />
                     <Input 
                       value={activeSlide.theme?.brand || ""} 
                       onChange={(e) => updateTheme("brand", e.target.value)}
                       placeholder="site default"
                       className="flex-1 font-mono text-xs h-10"
                     />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-(--outline)">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-(--on-bg-medium) mb-3">
                Заметки спикера
              </h3>
              <Textarea 
                className="min-h-[120px] bg-(--bg) text-sm" 
                value={activeSlide.notes || ""} 
                onChange={e => {
                  const next = [...slides]; next[activeIdx].notes = e.target.value; setSlides(next);
                }} 
                placeholder="Видны только вам..."
              />
            </div>
            
            <div className="pt-4 border-t border-(--outline)">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-(--on-bg-medium) mb-3">
                Фоновое изображение
              </h3>
              <Input 
                value={activeSlide.content.image_url || ""} 
                onChange={(e) => updateSlide("image_url", e.target.value)} 
                placeholder="https://..." 
                className="text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Доступ с</label>
                <DateTimePicker date={startsAt} setDate={setStartsAt} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Доступ до</label>
                <DateTimePicker date={endsAt} setDate={setEndsAt} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
