"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Trash, FloppyDisk, Rocket, Gear, DotsSixVertical, Palette, Sun, Moon, Code, Layout, Copy, Check,
  Sidebar, Columns, Square
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import Editor, { useMonaco } from "@monaco-editor/react";
import { SlideRenderer } from "@/components/presentation/slide-renderer";
import { tsxScope } from "@/components/presentation/tsx-scope";
import { SLIDE_META } from "@/components/presentation/registry";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import type { Presentation, Slide, SlideTheme } from "@/utils/api/presentations";

// The fixed test code (no trailing semicolon on the last line)
const DEFAULT_TSX = `function Presentation() {
  const [index, setIndex] = React.useState(0);
  
  const slides = [
    <TitleSlide key={0} content={{ title: "Hello AI", subtitle: "Generated Deck" }} theme={{ mode: "dark", brand: "#CCFF00" }} />,
    <SpeakerSlide key={1} content={{ title: "Niyaz Gimadiev", subtitle: "Founder of Unidoka", text: "Bio here..." }} theme={{ mode: "light", brand: "#336DFF" }} />,
    <QuoteSlide key={2} content={{ title: "This is a quote", subtitle: "Author Name" }} theme={{ mode: "dark", brand: "#FF3366" }} />,
  ];

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === " ") setIndex(i => Math.min(i + 1, slides.length - 1));
    if (e.key === "ArrowLeft") setIndex(i => Math.max(i - 1, 0));
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black outline-none cursor-pointer" 
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onClick={() => setIndex(i => (i + 1) % slides.length)}
    >
      <div className="absolute bottom-4 right-4 z-50 flex gap-1">
        {slides.map((_, i) => (
          <div key={i} className={\`size-2 rounded-full \${i === index ? "bg-white" : "bg-white/20"}\`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div 
          key={index} 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: -50 }} 
          className="absolute inset-0"
        >
          {slides[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}`;

const DANGEROUS_TOKENS = [
  "eval", "Function", "fetch", "XMLHttpRequest", "window", "document",
  "localStorage", "sessionStorage", "dangerouslySetInnerHTML", "<script",
  "navigator", "import(", "require(", "WebSocket", "process", "globalThis"
];

function isValidTsx(code: string): boolean {
  return !DANGEROUS_TOKENS.some(token => code.includes(token));
}

// Official One Dark Pro palette for Monaco Editor
const ONE_DARK_PRO_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "5c6370", fontStyle: "italic" },
    { token: "keyword", foreground: "c678dd" },
    { token: "string", foreground: "98c379" },
    { token: "number", foreground: "d19a66" },
    { token: "type", foreground: "61afef" },
    { token: "identifier", foreground: "e06c75" },
    { token: "delimiter", foreground: "abb2bf" },
    { token: "tag", foreground: "e06c75" },
    { token: "metatag", foreground: "e06c75" },
    { token: "attribute.name", foreground: "d19a66" },
    { token: "attribute.value", foreground: "98c379" },
    { token: "function", foreground: "61afef" },
    { token: "variable", foreground: "e06c75" },
  ],
  colors: {
    "editor.background": "#282c34",
    "editor.foreground": "#abb2bf",
    "editorLineNumber.foreground": "#495162",
    "editorLineNumber.activeForeground": "#abb2bf",
    "editorCursor.foreground": "#528bff",
    "editor.selectionBackground": "#3E4451",
    "editor.inactiveSelectionBackground": "#3E4451",
    "editor.lineHighlightBackground": "#2C313C",
    "editorIndentGuide.background": "#3B4048",
    "editorIndentGuide.activeBackground": "#C8C8C859",
    "editorBracketMatch.background": "#515A6B",
    "editorBracketMatch.border": "#515A6B",
    "editorError.foreground": "#c24038",
    "editorWarning.foreground": "#d19a66",
    "editorInfo.foreground": "#61afef",
  },
};

type CodeViewMode = "split" | "code" | "preview";

export function PresentationBuilder({ initial, onSave }: { initial: Presentation | null, onSave: (data: any) => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [startsAt, setStartsAt] = useState<Date | undefined>(initial?.starts_at ? new Date(initial.starts_at) : undefined);
  const [endsAt, setEndsAt] = useState<Date | undefined>(initial?.ends_at ? new Date(initial.ends_at) : undefined);
  
  const [slides, setSlides] = useState<Slide[]>(initial?.slides || []);
  const [customTsx, setCustomTsx] = useState(initial?.custom_tsx || DEFAULT_TSX);
  const [activeIdx, setActiveIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [codeViewMode, setCodeViewMode] = useState<CodeViewMode>("split");
  const [copied, setCopied] = useState(false);

  const monaco = useMonaco();

  // Register One Dark Pro theme when Monaco loads
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("one-dark-pro", ONE_DARK_PRO_THEME as any);
      monaco.editor.setTheme("one-dark-pro");
    }
  }, [monaco]);

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

  const copyAiPrompt = () => {
    const prompt = `Write a complete React presentation in TSX.

CRITICAL RULES:
1. Do NOT use imports or require().
2. Do NOT use fetch, window, document, or eval.
3. Available scope: React, motion, AnimatePresence, TitleSlide, SpeakerSlide, QuoteSlide, SplitSlide, CodeSlide.
4. You must handle slide state and keyboard navigation yourself (use onKeyDown on the container, do NOT use window.addEventListener).
5. Return an arrow function component and render it at the bottom. Do NOT put a semicolon after the final JSX tag.

Example:
${DEFAULT_TSX}`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (publish: boolean) => {
    if (viewMode === "code" && customTsx) {
      if (!isValidTsx(customTsx)) {
        toast.error("Security Error: Code contains forbidden keywords.");
        return;
      }
    }

    onSave({
      title, slug, description,
      starts_at: startsAt ? startsAt.toISOString() : null,
      ends_at: endsAt ? endsAt.toISOString() : null,
      is_published: publish,
      slides: slides,
      custom_tsx: customTsx
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
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-(--bg) rounded-lg p-1 border border-(--outline)">
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "visual" ? "bg-(--card) text-(--on-bg-high) shadow-sm ring-1 ring-(--outline)" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`}
          >
            <Layout className="size-3.5" /> Visual
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "code" ? "bg-(--card) text-(--on-bg-high) shadow-sm ring-1 ring-(--outline)" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`}
          >
            <Code className="size-3.5" /> Code (TSX)
          </button>
        </div>
      </div>

      {viewMode === "code" ? (
        /* --- FULL DECK TSX MODE --- */
        <div className="flex-1 flex flex-col min-h-0 bg-(--card)">
          {/* Code Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-(--outline)">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code className="size-5 text-(--primary)" /> TSX Deck Editor
              </h2>
              <p className="text-xs text-(--on-bg-medium)">
                Write the entire presentation in TSX. Strictly sandboxed.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Code View Layout Toggle */}
              <div className="flex items-center gap-1 bg-(--bg) rounded-lg p-1 border border-(--outline)">
                <button onClick={() => setCodeViewMode("code")} className={`p-1.5 rounded-md transition-colors ${codeViewMode === "code" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`} title="Code Only">
                  <Sidebar className="size-4" />
                </button>
                <button onClick={() => setCodeViewMode("split")} className={`p-1.5 rounded-md transition-colors ${codeViewMode === "split" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`} title="Split View">
                  <Columns className="size-4" />
                </button>
                <button onClick={() => setCodeViewMode("preview")} className={`p-1.5 rounded-md transition-colors ${codeViewMode === "preview" ? "bg-(--card) shadow-sm text-(--primary)" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`} title="Preview Only">
                  <Square className="size-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-(--outline)" />

              <Button variant="outlined" size="small" onClick={copyAiPrompt}>
                {copied ? <Check className="size-3 mr-2 text-green-500" /> : <Copy className="size-3 mr-2" />}
                Prompt
              </Button>
              <Button size="small" onClick={() => { if(!isValidTsx(customTsx)) { toast.error("Security Error"); } else { toast.success("Code updated"); } }}>Update Preview</Button>
            </div>
          </div>

          {/* Dynamic Layout Area */}
          <div className="flex-1 flex min-h-0">
            {/* Editor Pane */}
            {(codeViewMode === "split" || codeViewMode === "code") && (
              <div className={`flex flex-col min-w-0 bg-[#282c34] ${codeViewMode === "split" ? "w-1/2 border-r border-(--outline)" : "w-full"}`}>
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  value={customTsx}
                  onChange={(value: string | undefined) => setCustomTsx(value || "")}
                  theme="one-dark-pro"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                />
              </div>
            )}

            {/* Preview Pane */}
            {(codeViewMode === "split" || codeViewMode === "preview") && (
              <div className={`relative bg-[#0a0a0a] min-w-0 flex items-center justify-center p-6 ${codeViewMode === "split" ? "w-1/2" : "w-full"}`}>
                <div className="w-full h-full max-w-[1200px] max-h-[800px] relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                  <LiveProvider code={customTsx || DEFAULT_TSX} scope={tsxScope} noInline={true}>
                    <div className="absolute inset-0">
                      <LivePreview />
                    </div>
                    <LiveError className="absolute bottom-4 left-4 z-50 bg-red-500/20 text-red-500 p-4 rounded text-xs font-mono max-w-lg backdrop-blur-md border border-red-500/50" />
                  </LiveProvider>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- VISUAL MODE --- */
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Slide List */}
          <div className="w-64 flex flex-col border-r border-(--outline) bg-(--card) shrink-0 z-10">
            <div className="p-3 border-b border-(--outline) flex items-center justify-between bg-(--bg)">
              <span className="text-xs font-semibold uppercase tracking-wider text-(--on-bg-medium)">Слайды</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="filled" size="icon-small" className="size-8 rounded-full shadow-md hover:scale-105 transition-transform">
                    <Plus className="size-5" weight="bold" />
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
                  <button onClick={(e) => { e.stopPropagation(); removeSlide(i); }} className="opacity-0 group-hover:opacity-100 hover:text-(--error) transition-opacity">
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
                  <motion.div key={activeIdx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }} className="absolute inset-0">
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
                      <button onClick={() => updateTheme("mode", "light")} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${(activeSlide.theme?.mode || "dark") === "light" ? "bg-white text-black shadow-sm" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`}>
                        <Sun className="size-3.5" /> Light
                      </button>
                      <button onClick={() => updateTheme("mode", "dark")} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${(activeSlide.theme?.mode || "dark") === "dark" ? "bg-black text-white shadow-sm" : "text-(--on-bg-low) hover:text-(--on-bg-high)"}`}>
                        <Moon className="size-3.5" /> Dark
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-(--on-bg-medium)">Фоновый цвет</label>
                    <div className="flex gap-2">
                       <Input type="color" value={activeSlide.theme?.bg || (activeSlide.theme?.mode === 'light' ? '#ffffff' : '#000000')} onChange={(e) => updateTheme("bg", e.target.value)} className="w-10 h-10 p-1 cursor-pointer" />
                       <Input value={activeSlide.theme?.bg || ""} onChange={(e) => updateTheme("bg", e.target.value)} placeholder="auto" className="flex-1 font-mono text-xs h-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-(--on-bg-medium)">Бренд-цвет</label>
                    <div className="flex gap-2">
                       <Input type="color" value={activeSlide.theme?.brand || '#CCFF00'} onChange={(e) => updateTheme("brand", e.target.value)} className="w-10 h-10 p-1 cursor-pointer" />
                       <Input value={activeSlide.theme?.brand || ""} onChange={(e) => updateTheme("brand", e.target.value)} placeholder="site default" className="flex-1 font-mono text-xs h-10" />
                    </div>
                  </div>
                </div>
              </div>

              {activeSlide.type !== "CustomTsx" && (
                <div className="pt-4 border-t border-(--outline)">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-(--on-bg-medium) mb-3">Фоновое изображение</h3>
                  <ImageUploadField 
                    value={activeSlide.content.image_url || ""} 
                    onChange={(url) => updateSlide("image_url", url)} 
                    defaultAspect="16:9"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-(--outline)">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-(--on-bg-medium) mb-3">Заметки спикера</h3>
                <Textarea className="min-h-[120px] bg-(--bg) text-sm" value={activeSlide.notes || ""} onChange={e => { const next = [...slides]; next[activeIdx].notes = e.target.value; setSlides(next); }} placeholder="Видны только вам..." />
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Настройки презентации</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Название</label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Slug</label><Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Доступ с</label><DateTimePicker date={startsAt} setDate={setStartsAt} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Доступ до</label><DateTimePicker date={endsAt} setDate={setEndsAt} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setSettingsOpen(false)}>Готово</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
