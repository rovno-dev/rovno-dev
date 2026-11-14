import React from "react";

export const LOGO_ANIM_CSS = `
  @keyframes logoSquareIn {
    0%   { opacity: 0; transform: scale(0.55); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes logoBarIn {
    0%   { opacity: 0; transform: scaleY(0.15); }
    100% { opacity: 1; transform: scaleY(1); }
  }
  @keyframes logoLetterIn {
    0%   { opacity: 0; transform: translateY(7px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes logoWholeIn {
    0%   { opacity: 0; transform: scale(0.55); }
    100% { opacity: 1; transform: scale(1); }
  }

  .logo-anim-square,
  .logo-anim-bar,
  .logo-anim-letter,
  .logo-anim-whole {
    transform-box: fill-box;
    transform-origin: center;
    will-change: transform, opacity;
  }
  .logo-anim-square { animation: logoSquareIn 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .logo-anim-bar    { animation: logoBarIn    0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .logo-anim-letter { animation: logoLetterIn 0.50s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .logo-anim-whole  { animation: logoWholeIn  0.70s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

  @media (prefers-reduced-motion: reduce) {
    .logo-anim-square, .logo-anim-bar,
    .logo-anim-letter, .logo-anim-whole {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

export function animStyle(animated: boolean) {
  return animated ? <style>{LOGO_ANIM_CSS}</style> : null;
}

export function letterAnim(animated: boolean, i: number, base = 0.3, stagger = 0.035) {
  if (!animated) return {};
  return {
    className: "logo-anim-letter",
    style: { animationDelay: `${base + i * stagger}s` },
  };
}

export function barAnim(animated: boolean, i: 1 | 2) {
  if (!animated) return {};
  return {
    className: "logo-anim-bar",
    style: { animationDelay: `${0.18 + (i - 1) * 0.06}s` },
  };
}