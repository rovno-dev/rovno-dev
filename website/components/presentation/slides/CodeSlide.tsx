"use client";
import { motion } from "motion/react";
import { Editable } from "../editable";
import { SlideProps } from "./types";

export function CodeSlide({ content, isEditing, update, theme }: SlideProps) {
  const brand = theme?.brand || "#CCFF00";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16 bg-[#0a0a0a]">
      <motion.div
        className="w-full max-w-5xl rounded-xl overflow-hidden border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/10">
          <div className="size-3 rounded-full bg-red-500/80" />
          <div className="size-3 rounded-full bg-yellow-500/80" />
          <div className="size-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-xs font-mono text-white/40">
            <Editable value={content.title || ""} onChange={(v) => update("title", v)} isEditing={isEditing} placeholder="filename.ts" />
          </span>
        </div>
        <div className="p-6 md:p-8 bg-[#0d0d0d] font-mono text-sm md:text-lg text-white/90 leading-relaxed overflow-x-auto">
          <pre className="whitespace-pre-wrap">
            <Editable value={content.subtitle || ""} onChange={(v) => update("subtitle", v)} isEditing={isEditing} placeholder="// Your code here" multiline />
          </pre>
        </div>
      </motion.div>
    </div>
  );
}
