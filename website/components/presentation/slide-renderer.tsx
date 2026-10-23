"use client";
import { SLIDE_COMPONENTS } from "./registry";
import { Slide } from "@/utils/api/presentations";

interface SlideRendererProps {
  slide: Slide;
  isEditing?: boolean;
  update?: (key: string, val: any) => void;
}

export function SlideRenderer({ slide, isEditing, update }: SlideRendererProps) {
  const Component = SLIDE_COMPONENTS[slide.type];
  
  if (!Component) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-950 text-red-500 font-mono text-sm border-2 border-red-500 border-dashed m-8 rounded-xl">
        Unknown Slide Type: "{slide.type}"
      </div>
    );
  }

  const theme = slide.theme || { mode: "dark", brand: "#CCFF00" };
  const isDark = theme.mode === "dark";
  
  // Apply theme background
  const bgStyle = theme.bg 
    ? { backgroundColor: theme.bg } 
    : { backgroundColor: isDark ? "#000000" : "#ffffff" };

  return (
    <div className="absolute inset-0 overflow-hidden" style={bgStyle}>
      <Component 
        content={slide.content} 
        isEditing={!!isEditing} 
        update={update || (() => {})} 
        theme={theme} 
      />
    </div>
  );
}
