"use client";
import { motion } from "motion/react";
import { Editable } from "../editable";
import { SlideProps } from "./types";

export function SplitSlide({ content, isEditing, update, theme }: SlideProps) {
  const brand = theme?.brand || "#CCFF00";
  const mode = theme?.mode || "dark";
  const isDark = mode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const subColor = isDark ? "text-white/60" : "text-black/60";

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row">
      <motion.div
        className="flex-1 flex items-center justify-center p-8 md:p-16 z-10"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="w-full max-w-lg">
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${textColor}`}>
            <Editable value={content.title || ""} onChange={(v) => update("title", v)} isEditing={isEditing} placeholder="Title" />
          </h2>
          <p className={`text-xl md:text-2xl leading-relaxed ${subColor}`}>
            <Editable value={content.subtitle || ""} onChange={(v) => update("subtitle", v)} isEditing={isEditing} placeholder="Text on the left side." multiline />
          </p>
        </div>
      </motion.div>
      <motion.div
        className={`flex-1 relative ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {content.image_url ? (
          <img src={content.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
             <span className="font-mono text-sm">Image URL</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
