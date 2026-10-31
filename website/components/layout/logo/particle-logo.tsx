"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  hx: number;
  hy: number;
  ex: number;
  ey: number;
  size: number;
  alpha: number;
  density: number;
}

const CANVAS = 320;
const MOUSE_RADIUS = 80;
const DRIFT = 0.5;

function buildParticles(): Particle[] {
  const out: Particle[] = [];
  const S = 1.8;

  const add = (x: number, y: number, alpha: number, size: number) => {
    const a = Math.random() * Math.PI * 2;
    const m = 100 + Math.random() * 60;
    out.push({
      x, y,
      hx: x, hy: y,
      ex: Math.cos(a) * m,
      ey: Math.sin(a) * m,
      size: size * (0.75 + Math.random() * 0.5),
      alpha,
      density: Math.random() * 30 + 10,
    });
  };

  const sx = 55;
  const sw = 10;
  const sy = 30;
  const bh = 260;
  const ah = 10;
  const reach = 45;

  for (let y = sy; y <= sy + bh; y += S) {
    for (let dx = 0; dx < sw; dx += S) {
      add(sx + dx, y, 1, 2.2);
    }
  }

  for (let x = sx; x <= sx + reach; x += S) {
    for (let dy = 0; dy < ah; dy += S) {
      add(x, sy + dy, 1, 2.2);
    }
  }

  for (let x = sx; x <= sx + reach; x += S) {
    for (let dy = 0; dy < ah; dy += S) {
      add(x, sy + bh - dy, 1, 2.2);
    }
  }

  const mirror = (x: number) => CANVAS - x;
  const n = out.length;
  for (let i = 0; i < n; i++) {
    const p = out[i];
    const a = Math.random() * Math.PI * 2;
    const m = 100 + Math.random() * 60;
    out.push({
      x: mirror(p.x), y: p.y,
      hx: mirror(p.hx), hy: p.hy,
      ex: Math.cos(a) * m,
      ey: Math.sin(a) * m,
      size: p.size,
      alpha: p.alpha,
      density: Math.random() * 30 + 10,
    });
  }

  return out;
}

function updateParticle(
  p: Particle,
  mouseX: number,
  mouseY: number,
  t: number,
  hv: number
) {
  const tx = p.hx + p.ex * hv;
  const ty = p.hy + p.ey * hv;

  const dx = mouseX - p.x;
  const dy = mouseY - p.y;
  const distSq = dx * dx + dy * dy;
  const maxDistSq = MOUSE_RADIUS * MOUSE_RADIUS;

  // Repel from mouse
  if (MOUSE_RADIUS > 0 && distSq < maxDistSq) {
    const distance = Math.sqrt(distSq);
    const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
    p.x -= (dx / distance) * force * p.density;
    p.y -= (dy / distance) * force * p.density;
  } else {
    // Spring back to target (Changed from /15 to /8 for faster, snappier return)
    const rx = p.x - tx;
    const ry = p.y - ty;
    if (rx !== 0) p.x -= rx / 8;
    if (ry !== 0) p.y -= ry / 8;
  }

  // Ambient drift
  p.x += Math.sin(t + p.hy) * DRIFT;
  p.y += Math.cos(t + p.hx) * DRIFT;
}

export function ParticleLogo({
  className = "",
  restOpacity = 0.6,
}: {
  className?: string;
  restOpacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetHover = useRef(0);
  const envelope = useRef(0);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    particles.current = buildParticles();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
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
      // Faster reassembly (Changed from 0.15 to 0.25)
      const rate = target > envelope.current ? 0.35 : 0.25;
      envelope.current += (target - envelope.current) * rate * dt;
      const hv = envelope.current;

      ctx.clearRect(0, 0, CANVAS, CANVAS);
      const color = readColor();

      const t = now * 0.001;

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        updateParticle(p, mouse.current.x, mouse.current.y, t, hv);
        
        ctx.globalAlpha = p.alpha * (restOpacity + hv * (1 - restOpacity));
        
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [restOpacity]);

  return (
    <div
      ref={containerRef}
      className={`relative cursor-pointer ${className}`}
      onMouseEnter={() => { targetHover.current = 1; }}
      onMouseLeave={() => { 
        targetHover.current = 0; 
        mouse.current = { x: -1000, y: -1000 };
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouse.current = {
          x: (e.clientX - rect.left) * (CANVAS / rect.width),
          y: (e.clientY - rect.top) * (CANVAS / rect.height),
        };
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none w-full h-full"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}
