"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  ex: number;
  ey: number;
  size: number;
  alpha: number;
  phase: number;
  freq: number;
}

const CANVAS = 320;

function buildParticles(): Particle[] {
  const out: Particle[] = [];
  // Denser step for a sharper, more premium texture
  const S = 1.8;

  const add = (x: number, y: number, alpha: number, size: number) => {
    const a = Math.random() * Math.PI * 2;
    const m = 100 + Math.random() * 60;
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
  const sx = 55;
  const sw = 10;    // Thinner spine
  const sy = 30;
  const bh = 260;   // Keep tall
  const ah = 10;    // Thinner arms
  const reach = 45; // Shorter arm reach

  // Spine (thin vertical on the left)
  for (let y = sy; y <= sy + bh; y += S) {
    for (let dx = 0; dx < sw; dx += S) {
      add(sx + dx, y, 1, 2.2);
    }
  }

  // Top arm (short horizontal)
  for (let x = sx; x <= sx + reach; x += S) {
    for (let dy = 0; dy < ah; dy += S) {
      add(x, sy + dy, 1, 2.2);
    }
  }

  // Bottom arm (short horizontal)
  for (let x = sx; x <= sx + reach; x += S) {
    for (let dy = 0; dy < ah; dy += S) {
      add(x, sy + bh - dy, 1, 2.2);
    }
  }

  // ── Right bracket ] ───────────────────────────────────────────────────
  const mirror = (x: number) => CANVAS - x;
  const n = out.length;
  for (let i = 0; i < n; i++) {
    const p = out[i];
    const a = Math.random() * Math.PI * 2;
    const m = 100 + Math.random() * 60;
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
  const mouse = useRef({ x: -1000, y: -1000 });

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
      // Very fast shatter, snappy return
      const rate = target > envelope.current ? 0.35 : 0.15;
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

      // Pass 1: Trails (under dots)
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      for (const p of particles.current) {
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1.5 && hv > 0.05) {
          ctx.globalAlpha = Math.min(0.25, hv * speed * 0.04);
          ctx.lineWidth = p.size * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 2.0, p.y - p.vy * 2.0);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      // Pass 2: Dots
      ctx.fillStyle = color;
      for (const p of particles.current) {
        const tx = p.hx + p.ex * hv;
        const ty = p.hy + p.ey * hv;

        // Mouse repulsion (only active when scattered)
        let mxForce = 0;
        let myForce = 0;
        if (hv > 0.1) {
          const dx = p.x - mouse.current.x;
          const dy = p.y - mouse.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 70) {
            const force = (70 - dist) / 70;
            mxForce = (dx / dist) * force * 4;
            myForce = (dy / dist) * force * 4;
          }
        }

        const wob = hv * 3;
        const dx = tx - p.x + Math.sin(t * p.freq + p.phase) * wob + mxForce;
        const dy = ty - p.y + Math.cos(t * p.freq + p.phase) * wob + myForce;

        p.vx += dx * 0.08 * dt;
        p.vy += dy * 0.08 * dt;
        const damp = Math.pow(0.82 + hv * 0.05, dt);
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
      onMouseLeave={() => { 
        targetHover.current = 0; 
        mouse.current = { x: -1000, y: -1000 };
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouse.current = {
            x: (e.clientX - rect.left) * (CANVAS / rect.width),
            y: (e.clientY - rect.top) * (CANVAS / rect.height),
          };
        }}
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
