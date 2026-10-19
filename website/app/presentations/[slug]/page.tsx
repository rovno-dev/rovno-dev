"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Presentation, Slide } from "@/utils/api/presentations";
import { Lock, CaretRight, CaretLeft } from "@phosphor-icons/react";

export default function PresentationViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<Presentation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(\`\${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/presentations/\${slug}\`)
      .then(async res => {
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.detail || "Error");
        }
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setIdx(i => Math.min(i + 1, (data?.slides.length || 1) - 1));
      if (e.key === "ArrowLeft") setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [data]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#CCFF00] font-mono animate-pulse">Loading presentation...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <Lock className="size-16 text-[#CCFF00] mb-6" />
        <h1 className="text-3xl font-mono uppercase tracking-widest text-[#CCFF00] mb-2">Access Denied</h1>
        <p className="text-gray-400 font-mono text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (!data) return null;
  const slide = data.slides[idx];
  if (!slide) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Empty Presentation</div>;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col font-sans">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="flex-1 relative flex items-center justify-center p-8 md:p-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[1200px] relative z-10"
          >
            <SlideRenderer slide={slide} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-50">
        <button onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0} className="size-12 rounded-full border border-white/20 bg-black/50 backdrop-blur flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors">
          <CaretLeft className="size-6" />
        </button>
        <span className="font-mono text-sm text-gray-400">{idx + 1} / {data.slides.length}</span>
        <button onClick={() => setIdx(i => Math.min(i + 1, data.slides.length - 1))} disabled={idx === data.slides.length - 1} className="size-12 rounded-full border border-white/20 bg-black/50 backdrop-blur flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors">
          <CaretRight className="size-6" />
        </button>
      </div>
    </div>
  );
}

function SlideRenderer({ slide }: { slide: Slide }) {
  const { type, content } = slide;
  const lime = "#CCFF00";

  if (type === "cover") {
    return (
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-6xl md:text-8xl font-heading font-black uppercase tracking-tighter leading-none">
            {content.title || "TITLE"}
          </h1>
          <p className="text-2xl text-gray-400 font-mono">{content.subtitle}</p>
        </div>
        {content.image_url && (
          <div className="flex-1 relative aspect-[3/4] w-full max-w-md rounded-3xl overflow-hidden border border-white/10">
            <img src={content.image_url} className="object-cover w-full h-full" alt="" />
          </div>
        )}
      </div>
    );
  }

  if (type === "question") {
    return (
      <div className="bg-[#CCFF00] text-black p-12 md:p-20 rounded-3xl shadow-2xl">
        <p className="font-mono text-sm uppercase tracking-[0.3em] mb-4 opacity-60">Question</p>
        <h2 className="text-4xl md:text-6xl font-heading font-black leading-tight tracking-tight">
          {content.title}
        </h2>
        <p className="text-xl md:text-2xl mt-8 font-medium opacity-80">{content.subtitle}</p>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="w-full flex justify-center">
        <img src={content.image_url} className="max-h-[75vh] object-contain rounded-xl border border-white/10" alt="" />
      </div>
    );
  }

  if (type === "quote") {
    return (
      <div className="flex items-start gap-8">
        <span className="text-[10rem] text-[#CCFF00] leading-none font-serif opacity-50">&quot;</span>
        <div>
          <h2 className="text-4xl md:text-6xl font-medium leading-tight">{content.title}</h2>
          <p className="text-2xl text-gray-400 mt-6 font-mono">{content.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-5xl md:text-7xl font-heading font-bold">{content.title}</h2>
      <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed max-w-4xl whitespace-pre-wrap">{content.subtitle}</p>
    </div>
  );
}
