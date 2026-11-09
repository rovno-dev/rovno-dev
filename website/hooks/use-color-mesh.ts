import { useEffect, useState } from "react";

type RGB = { r: number; g: number; b: number };

function extractHueFromRGB(c: RGB): number {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.03) return -1;
  let h: number;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return h * 60;
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hh = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

export function rgba({ r, g, b }: RGB, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function designMesh(hue: number) {
  return {
    base: hslToRgb(hue, 0.44, 0.68),
    highlight: hslToRgb(hue, 0.40, 0.86),
    bright: hslToRgb(hue, 0.28, 0.95),
    shadow: hslToRgb(hue, 0.52, 0.56),
    deep: hslToRgb(hue, 0.48, 0.50),
  };
}

export function useCoverHue(src?: string): number | null {
  const [hue, setHue] = useState<number | null>(null);
  useEffect(() => {
    if (!src) { setHue(223); return; }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const settle = (h: number) => { if (!cancelled) setHue(h); };
    const timer = setTimeout(() => settle(223), 2000);
    img.onload = () => {
      clearTimeout(timer);
      if (cancelled) return;
      try {
        const W = 24, H = 24;
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) { settle(223); return; }
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        let sx = 0, sy = 0, weight = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const c = Math.max(r, g, b) - Math.min(r, g, b);
          if (c < 10) continue;
          const h = extractHueFromRGB({ r, g, b });
          if (h < 0) continue;
          const rad = (h * Math.PI) / 180;
          sx += Math.cos(rad) * c;
          sy += Math.sin(rad) * c;
          weight += c;
        }
        if (weight === 0) { settle(223); return; }
        let avg = (Math.atan2(sy, sx) * 180) / Math.PI;
        if (avg < 0) avg += 360;
        settle(avg);
      } catch { settle(223); }
    };
    img.onerror = () => { clearTimeout(timer); settle(223); };
    img.src = src;
    return () => { cancelled = true; clearTimeout(timer); };
  }, [src]);
  return hue;
}

export function isLightColor({ r, g, b }: RGB): boolean {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}
