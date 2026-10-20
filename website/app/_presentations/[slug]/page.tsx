"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Presentation, Slide } from "@/utils/api/presentations";
import { Lock, CaretRight, CaretLeft } from "@phosphor-icons/react";
import { SlideRenderer } from "@/components/presentation/slide-renderer";
import { DeckRenderer } from "@/components/presentation/deck-renderer";

export default function PresentationViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<Presentation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/presentations/${slug}`)
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

  if (data.custom_tsx) {
    return <DeckRenderer code={data.custom_tsx} />;
  }
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

