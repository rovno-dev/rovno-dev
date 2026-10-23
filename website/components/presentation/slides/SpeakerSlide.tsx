"use client";
import { motion } from "motion/react";
import { Editable } from "../editable";
import { SlideProps } from "./types";

export function SpeakerSlide({ content, isEditing, update, theme }: SlideProps) {
  const brand = theme?.brand || "#CCFF00";
  const mode = theme?.mode || "dark";
  const isDark = mode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const subColor = isDark ? "text-white/60" : "text-black/60";

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
      <motion.div
        className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`w-64 h-64 md:w-96 md:h-96 rounded-3xl overflow-hidden border-4 ${isDark ? 'border-white/10' : 'border-black/5'} shrink-0 shadow-2xl relative`}>
          {content.image_url ? (
            <img src={content.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'} flex items-center justify-center text-4xl opacity-50`}>?</div>
          )}
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
               <span className="text-white text-sm font-mono">Add Image URL in inspector</span>
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left w-full">
          <h2 className={`text-4xl md:text-6xl font-bold mb-3 ${textColor}`}>
            <Editable value={content.title || ""} onChange={(v) => update("title", v)} isEditing={isEditing} placeholder="Speaker Name" />
          </h2>
          <p className="text-xl md:text-2xl font-mono mb-6" style={{ color: brand }}>
            <Editable value={content.subtitle || ""} onChange={(v) => update("subtitle", v)} isEditing={isEditing} placeholder="Role / Company" />
          </p>
          <p className={`text-base md:text-xl leading-relaxed ${subColor}`}>
            <Editable value={content.text || ""} onChange={(v) => update("text", v)} isEditing={isEditing} placeholder="Short speaker bio..." multiline />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
