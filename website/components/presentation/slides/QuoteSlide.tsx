"use client";
import { motion } from "motion/react";
import { Editable } from "../editable";
import { SlideProps } from "./types";

export function QuoteSlide({ content, isEditing, update, theme }: SlideProps) {
  const brand = theme?.brand || "#CCFF00";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 md:p-20" style={{ backgroundColor: brand }}>
      <motion.div
        className="max-w-5xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-8xl text-black/20 font-serif leading-none mb-4">“</div>
        <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-8">
          <Editable value={content.title || ""} onChange={(v) => update("title", v)} isEditing={isEditing} placeholder="The quote goes here." multiline />
        </h2>
        <p className="text-2xl text-black/70 font-mono">
          — <Editable value={content.subtitle || ""} onChange={(v) => update("subtitle", v)} isEditing={isEditing} placeholder="Author Name" />
        </p>
      </motion.div>
    </div>
  );
}
