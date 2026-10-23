"use client";
import { motion } from "motion/react";
import { Editable } from "../editable";
import { SlideProps } from "./types";

export function TitleSlide({ content, isEditing, update, theme }: SlideProps) {
  const brand = theme?.brand || "#CCFF00";
  const mode = theme?.mode || "dark";
  const isDark = mode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const subColor = isDark ? "text-white/60" : "text-black/60";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16 text-center overflow-hidden">
      {content.image_url && (
        <div className="absolute inset-0 z-0">
          <img src={content.image_url} alt="" className={`w-full h-full object-cover ${isDark ? 'opacity-40' : 'opacity-20'}`} />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black via-black/80 to-transparent' : 'from-white via-white/80 to-transparent'}`} />
        </div>
      )}
      <div className="relative z-10 w-full max-w-5xl space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-5xl md:text-8xl font-black uppercase tracking-tighter ${textColor} leading-[0.95]`}
        >
          <Editable value={content.title || ""} onChange={(v) => update("title", v)} isEditing={isEditing} placeholder="TITLE" />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={`text-xl md:text-3xl font-mono ${subColor}`}
          style={{ color: isEditing ? undefined : brand }}
        >
          <Editable value={content.subtitle || ""} onChange={(v) => update("subtitle", v)} isEditing={isEditing} placeholder="SUBTITLE" />
        </motion.p>
      </div>
    </div>
  );
}
