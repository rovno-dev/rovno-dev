"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function AsciiLogo({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let primaryColor = "#ffffff";

    const updateThemeColor = () => {
      primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
    };
    updateThemeColor();

    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // ── Particle Generation ──────────────────────────────────────────────
    const particles: {
      x: number; y: number; baseX: number; baseY: number;
      char: string; size: number; baseOpacity: number;
      floatPhaseX: number; floatPhaseY: number;
      floatSpeedX: number; floatSpeedY: number;
      driftAmount: number;
    }[] = [];

    const chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    // Denser grid for a smoother look
    for (let x = 0; x < 100; x += 1.0) {
      for (let y = 0; y < 100; y += 1.0) {
        const jx = x + (Math.random() * 3 - 1.5);
        const jy = y + (Math.random() * 3 - 1.5);

        const isLeftStem = jx >= 22 && jx <= 30 && jy >= 15 && jy <= 85;
        const isLeftTopArm = jx >= 22 && jx <= 42 && jy >= 15 && jy <= 22;
        const isLeftBottomArm = jx >= 22 && jx <= 42 && jy >= 78 && jy <= 85;
        const isLeft = isLeftStem || isLeftTopArm || isLeftBottomArm;

        const isRightStem = jx >= 70 && jx <= 78 && jy >= 15 && jy <= 85;
        const isRightTopArm = jx >= 58 && jx <= 78 && jy >= 15 && jy <= 22;
        const isRightBottomArm = jx >= 58 && jx <= 78 && jy >= 78 && jy <= 85;
        const isRight = isRightStem || isRightTopArm || isRightBottomArm;

        const inLeftZone = jx >= 15 && jx <= 50 && jy >= 10 && jy <= 90;
        const inRightZone = jx >= 50 && jx <= 85 && jy >= 10 && jy <= 90;
        
        const isLeftScatter = inLeftZone && !isLeft && Math.random() < 0.15;
        const isRightScatter = inRightZone && !isRight && Math.random() < 0.15;

        if (isLeft || isRight || isLeftScatter || isRightScatter) {
          const isMain = isLeft || isRight;
          const nx = jx / 100;
          const ny = jy / 100;
          
          particles.push({
            x: nx, y: ny, baseX: nx, baseY: ny,
            char: chars[Math.floor(Math.random() * chars.length)],
            size: isMain ? 12 : 9,
            baseOpacity: isMain ? (0.5 + Math.random() * 0.4) : (0.1 + Math.random() * 0.3),
            floatPhaseX: Math.random() * Math.PI * 2,
            floatPhaseY: Math.random() * Math.PI * 2,
            floatSpeedX: 0.4 + Math.random() * 0.8, // Slower, softer waves
            floatSpeedY: 0.4 + Math.random() * 0.8,
            driftAmount: isMain ? 3 : 6, // Scatter moves more than the main ring
          });
        }
      }
    }

    // ── Sizing & DPR ─────────────────────────────────────────────────────
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    resize();

    // ── Mouse Tracking ───────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    // ── Animation Loop ───────────────────────────────────────────────────
    let lastTime = performance.now();
    let time = 0;

    const animate = (currentTime: number) => {
      // Calculate dt (clamped to avoid jumps if tab is backgrounded)
      const dt = Math.min((currentTime - lastTime) / 16.666, 3);
      lastTime = currentTime;
      time += 0.0018 * dt;

      ctx.clearRect(0, 0, width, height);

      // Lerp speed (smooth interpolation)
      // 0.06 is very smooth, 0.15 is snappier
      const lerpFactor = 1 - Math.pow(1 - 0.12, dt); 
      const mouseRepelRadius = 150;
      const maxRepel = 45; // Pixels

      particles.forEach((p) => {
        // 1. Calculate gentle AFK target
        const idleX = Math.sin(time * p.floatSpeedX + p.floatPhaseX) * p.driftAmount;
        const idleY = Math.cos(time * p.floatSpeedY + p.floatPhaseY) * p.driftAmount;
        
        let targetPxX = (p.baseX * width) + idleX;
        let targetPxY = (p.baseY * height) + idleY;

        const px = p.x * width;
        const py = p.y * height;
        const mx = mouseRef.current.x * width;
        const my = mouseRef.current.y * height;

        const dx = px - mx;
        const dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 2. Smooth Mouse Repulsion (Alters the target, not the velocity)
        let isHovered = false;
        if (dist < mouseRepelRadius) {
          isHovered = true;
          const force = (mouseRepelRadius - dist) / mouseRepelRadius;
          const angle = Math.atan2(dy, dx);
          // Push the target away from the mouse
          targetPxX += Math.cos(angle) * force * maxRepel;
          targetPxY += Math.sin(angle) * force * maxRepel;
        }

        // 3. Smoothly glide the particle to its target
        p.x += (targetPxX / width - p.x) * lerpFactor;
        p.y += (targetPxY / height - p.y) * lerpFactor;

        // 4. Opacity (breathing + hover highlight)
        let opacity = p.baseOpacity;
        if (isHovered) {
          opacity = Math.min(1, opacity + 0.4); // Gentle highlight
        } else {
          opacity += Math.sin(time * 2 + p.floatPhaseX) * 0.1;
        }

        // 5. Render
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.fillStyle = primaryColor;
        ctx.font = `500 ${p.size}px "Geist Mono", monospace`;
        
        ctx.fillText(p.char, p.x * width, p.y * height);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      observer.disconnect();
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
