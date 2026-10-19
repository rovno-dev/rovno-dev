"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, Trash, ArrowUp, ArrowDown, FloppyDisk, Rocket } from "@phosphor-icons/react";
import type { Presentation, Slide } from "@/utils/api/presentations";

const SLIDE_TYPES = ["cover", "text", "question", "image", "quote"];

export function PresentationBuilder({ initial, onSave }: { initial: Presentation | null, onSave: (data: any) => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [isPublished, setIsPublished] = useState(initial?.is_published || false);
  const [startsAt, setStartsAt] = useState(initial?.starts_at?.slice(0, 16) || "");
  const [endsAt, setEndsAt] = useState(initial?.ends_at?.slice(0, 16) || "");
  
  const [slides, setSlides] = useState<Slide[]>(initial?.slides || []);
  const [activeIdx, setActiveIdx] = useState(0);

  const activeSlide = slides[activeIdx];

  const addSlide = (type: string) => {
    setSlides([...slides, { order: slides.length, type: type as any, content: { title: "New Slide" } }]);
    setActiveIdx(slides.length);
  };

  const updateSlide = (key: string, val: any) => {
    const next = [...slides];
    next[activeIdx] = { ...activeSlide, content: { ...activeSlide.content, [key]: val } };
    setSlides(next);
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= slides.length) return;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[idx + dir];
    next[idx + dir] = temp;
    setSlides(next.map((s, i) => ({ ...s, order: i })));
    setActiveIdx(idx + dir);
  };

  const removeSlide = (idx: number) => {
    const next = slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    setSlides(next);
    setActiveIdx(Math.max(0, idx - 1));
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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      {/* Left: Slides List */}
      <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0">
        <div className="flex gap-2">
           <Button onClick={() => handleSave(false)} variant="outlined" className="flex-1"><FloppyDisk /> Черновик</Button>
           <Button onClick={() => handleSave(true)} className="flex-1"><Rocket /> Опубл.</Button>
        </div>
        <Card className="p-3 flex-1 overflow-y-auto space-y-2">
          {slides.map((s, i) => (
            <div
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`p-3 rounded-lg border text-sm cursor-pointer flex items-center justify-between group \${i === activeIdx ? 'border-(--primary) bg-(--primary-glass)' : 'border-(--outline) hover:bg-(--state-hover)'}`}
            >
              <span className="truncate">{i + 1}. {s.content.title || s.type}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, -1); }}><ArrowUp /></button>
                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 1); }}><ArrowDown /></button>
                <button onClick={(e) => { e.stopPropagation(); removeSlide(i); }}><Trash className="text-(--error)" /></button>
              </div>
            </div>
          ))}
        </Card>
        <div className="flex flex-wrap gap-2">
          {SLIDE_TYPES.map(t => (
            <Button key={t} size="small" variant="outlined" onClick={() => addSlide(t)}>
              <Plus /> {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Middle: Editor */}
      <Card className="flex-1 p-6 space-y-4">
        <h2 className="text-heading-3 mb-4">Настройки презентации</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label>Название</label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label>Slug</label><Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto" /></div>
          <div><label>Доступ с</label><Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></div>
          <div><label>Доступ до</label><Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></div>
        </div>

        {activeSlide && (
          <div className="mt-8 pt-8 border-t border-(--outline) space-y-4">
            <h3 className="text-heading-4">Редактирование слайда: {activeSlide.type}</h3>
            <div><label>Заголовок</label><Input value={activeSlide.content.title || ""} onChange={e => updateSlide("title", e.target.value)} /></div>
            <div><label>Подзаголовок / Текст</label><Textarea value={activeSlide.content.subtitle || ""} onChange={e => updateSlide("subtitle", e.target.value)} /></div>
            {(activeSlide.type === "image" || activeSlide.type === "cover") && (
              <div><label>URL картинки</label><Input value={activeSlide.content.image_url || ""} onChange={e => updateSlide("image_url", e.target.value)} /></div>
            )}
            <div><label>Заметки спикера</label><Textarea value={activeSlide.notes || ""} onChange={e => {
              const next = [...slides]; next[activeIdx].notes = e.target.value; setSlides(next);
            }} /></div>
          </div>
        )}
      </Card>
    </div>
  );
}
