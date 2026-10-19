"use client";
import { motion } from "motion/react";
import type { Slide } from "@/utils/api/presentations";

export function SlideRenderer({ slide }: { slide: Slide }) {
  const { type, content } = slide;
  const lime = "#CCFF00";

  // 1. Cover Slides (Glitch / Cinematic / Minimal)
  if (type === "cover") {
    if (content.layout === "glitch") {
      return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden p-8">
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white"
              style={{ textShadow: `2px 0 0 #FF3366, -2px 0 0 ${lime}` }}
              animate={{ x: [0, -2, 2, -1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.2, ease: "linear" }}
            >
              {content.title || "TITLE"}
            </motion.h1>
            <motion.p
              className="text-xl md:text-3xl mt-6 font-mono"
              style={{ color: lime }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {content.subtitle || "SUBTITLE"}
            </motion.p>
          </motion.div>
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
            background: "linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)",
            backgroundSize: "100% 4px"
          }} />
        </div>
      );
    }
    
    // Cinematic / Minimal Cover
    return (
      <div className="absolute inset-0 bg-neutral-900 flex flex-col justify-end p-8 md:p-16 overflow-hidden">
        {content.image_url && (
          <div className="absolute inset-0">
            <img src={content.image_url} alt="" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">{content.title || "TITLE"}</h1>
          <p className="text-2xl text-gray-300 font-mono">{content.subtitle}</p>
        </motion.div>
      </div>
    );
  }

  // 2. Speaker Profile
  if (type === "speaker") {
    return (
      <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center p-8 overflow-hidden">
        <motion.div
          className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-neutral-800 shrink-0 shadow-2xl">
            {content.image_url ? (
              <img src={content.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-4xl">?</div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{content.title || "Speaker Name"}</h2>
            <p className="text-xl md:text-2xl text-[#CCFF00] mb-6 font-mono">{content.subtitle || "Role / Company"}</p>
            <p className="text-gray-400 text-lg leading-relaxed">{content.text || "Short speaker bio goes here. Talking about their background and expertise."}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Split Screen (Text + Image)
  if (type === "split") {
    return (
      <div className="absolute inset-0 flex flex-col md:flex-row bg-black overflow-hidden">
        <motion.div
          className="flex-1 flex items-center justify-center p-8 md:p-16 z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">{content.title || "Title"}</h2>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed">{content.subtitle || "Text on the left side."}</p>
          </div>
        </motion.div>
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {content.image_url && (
            <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </motion.div>
      </div>
    );
  }

  // 4. Quote
  if (type === "quote") {
    return (
      <div className="absolute inset-0 bg-[#CCFF00] flex items-center justify-center p-8 md:p-20">
        <motion.div
          className="max-w-5xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-8xl text-black/20 font-serif leading-none mb-4">“</div>
          <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-8">
            {content.title || "The quote goes here."}
          </h2>
          <p className="text-2xl text-black/70 font-mono">— {content.subtitle || "Author"}</p>
        </motion.div>
      </div>
    );
  }

  // 5. Image only
  if (type === "image") {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center p-4 md:p-12">
        {content.image_url && (
          <motion.img
            src={content.image_url}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
        {content.caption && (
          <p className="absolute bottom-8 left-0 right-0 text-center text-gray-400 font-mono text-sm">{content.caption}</p>
        )}
      </div>
    );
  }

  // 6. Default Text
  return (
    <div className="absolute inset-0 bg-neutral-950 flex flex-col justify-center p-8 md:p-20 overflow-y-auto">
      <motion.h2
        className="text-4xl md:text-7xl font-bold text-white mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {content.title}
      </motion.h2>
      <motion.p
        className="text-2xl md:text-4xl text-gray-300 leading-relaxed whitespace-pre-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {content.subtitle}
      </motion.p>
    </div>
  );
}
