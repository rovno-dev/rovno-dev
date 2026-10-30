"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Home position — where this particle sits when the logo is assembled. */
  hx: number;
  hy: number;
  /** Escape vector, applied × hover envelope, so targets scatter on hover. */
  ex: number;
  ey: number;
  size: number;
  alpha: number;
  phase: number;
  freq: number;
}

/**
 * Particle field forming a "[]" bracket logo — procedurally generated from
 * the ASCII reference. No SVG sampling, no external assets.
 *
 * NOTE: The inner "kidneys" loop was completely deleted. This file contains
 * ONLY spine, top arm, and bottom arm generation. If you still see a central
 * pill after saving this file, you are looking at a cached browser version.
 */
const CANVAS = 320;

function buildParticles(): Particle[] {
  const out: Particle[] = [];
  const S = 2.4;

  const add = (x: number, y: number, alpha: number, size: number) => {
    const a = Math.random() * Math.PI * 2;
    const m = 55 + Math.random() * 40;
    out.push({
      x, y, vx: 0, vy: 0,
      hx: x, hy: y,
      ex: Math.cos(a) * m,
      ey: Math.sin(a) * m,
      size: size * (0.75 + Math.random() * 0.5),
      alpha,
      phase: Math.random() * Math.PI * 2,
      freq: 0.5 + Math.random() * 1.2,
    });
  };

  // ── Left bracket [ ────────────────────────────────────────────────────
  // Huge: 260px tall, 110px reach. Thick 24px spine and arms.
  const sx = 30;
  const sw = 24;
  const sy = 30;
  const bh = 260;
  const ah = 24;
  const reach = 110;

  // Spine (thick vertical on the left)
  for (let y = sy; y <= sy + bh; y += S) {
    for (let dx = 0; dx < sw; dx += S) {
      add(sx + dx, y, 1, 2.8);
    }
  }

  // Top arm (thick horizontal, extends right from spine)
  for (let x = sx; x <= sx + reach; x += S) {
    for (let dy = 0; dy < ah; dy += S) {
      add(x, sy + dy, 1, 2.8);
    }
  }

  // Bottom arm (same, mirrored y)
  for (let x = sx; x <= sx + reach; x += S) {
    for (let dy = 0; dy < ah; dy += S) {
      add(x, sy + bh - dy, 1, 2.8);
    }
  }

  // ── Right bracket ] — exact mirror around canvas center ─────────────
  const mirror = (x: number) => CANVAS - x;
  const n = out.length;
  for (let i = 0; i < n; i++) {
    const p = out[i];
    const a = Math.random() * Math.PI * 2;
    const m = 55 + Math.random() * 40;
    out.push({
      x: mirror(p.x), y: p.y,
      vx: 0, vy: 0,
      hx: mirror(p.hx), hy: p.hy,
      ex: Math.cos(a) * m,
      ey: Math.sin(a) * m,
      size: p.size,
      alpha: p.alpha,
      phase: Math.random() * Math.PI * 2,
      freq: 0.5 + Math.random() * 1.2,
    });
  }

  return out;
}

export function ParticleLogo({
  className = "",
  restOpacity = 0.6,
}: {
  className?: string;
  restOpacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetHover = useRef(0);
  const envelope = useRef(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    particles.current = buildParticles();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = CANVAS * DPR;
    canvas.height = CANVAS * DPR;
    ctx.scale(DPR, DPR);

    const readColor = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--on-bg-high")
        .trim() || "#ECECEE";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ctx.fillStyle = readColor();
      for (const p of particles.current) {
        ctx.globalAlpha = p.alpha * restOpacity;
        ctx.beginPath();
        ctx.arc(p.hx, p.hy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    let last = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;

      const target = targetHover.current;
      const rate = target > envelope.current ? 0.16 : 0.075;
      envelope.current += (target - envelope.current) * rate * dt;
      const hv = envelope.current;

      ctx.clearRect(0, 0, CANVAS, CANVAS);
      const color = readColor();

      if (hv < 0.005 && target === 0) {
        ctx.fillStyle = color;
        for (const p of particles.current) {
          ctx.globalAlpha = p.alpha * restOpacity;
          ctx.beginPath();
          ctx.arc(p.hx, p.hy, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        raf = requestAnimationFrame(animate);
        return;
      }

      const t = now / 1000;

      // Trails
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      for (const p of particles.current) {
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1.8 && hv > 0.05) {
          ctx.globalAlpha = Math.min(0.28, hv * speed * 0.045);
          ctx.lineWidth = p.size * 0.65;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      // Dots
      ctx.fillStyle = color;
      for (const p of particles.current) {
        const tx = p.hx + p.ex * hv;
        const ty = p.hy + p.ey * hv;

        const wob = hv * 3;
        const dx = tx - p.x + Math.sin(t * p.freq + p.phase) * wob;
        const dy = ty - p.y + Math.cos(t * p.freq + p.phase) * wob;

        p.vx += dx * 0.075 * dt;
        p.vy += dy * 0.075 * dt;
        const damp = Math.pow(0.80 + hv * 0.06, dt);
        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        ctx.globalAlpha = p.alpha * (restOpacity + hv * (1 - restOpacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [restOpacity]);

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      onMouseEnter={() => { targetHover.current = 1; }}
      onMouseLeave={() => { targetHover.current = 0; }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none w-full h-full"
        style={{
          maskImage:
            "radial-gradient(circle at center, black 45%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 45%, transparent 100%)",
        }}
      />
    </div>
  );
}
