"use client";
import React from 'react';

export default function SpeedIllustration() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0a1622] rounded-2xl border border-sky-950/30 select-none flex items-center justify-center">
      {/* Precision Structural Grid Matrix Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Hyper-Slick Technical Blueprint Animation Overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes subtlePulse {
          0%, 100% { 
            opacity: 0.45;
            filter: drop-shadow(0 0 4px rgba(34,211,238,0.15));
          }
          50% { 
            opacity: 0.85;
            filter: drop-shadow(0 0 14px rgba(34,211,238,0.5));
          }
        }
        @keyframes speedStream {
          0% { stroke-dashoffset: 300; opacity: 0.1; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { stroke-dashoffset: 0; opacity: 0.1; }
        }
        @keyframes globalFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-4px) translateX(2px); }
        }
        
        .animated-ring-group {
          animation: subtlePulse 5s ease-in-out infinite;
        }
        .stream-line-fast {
          stroke-dasharray: 60, 200;
          animation: speedStream 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        .stream-line-slow {
          stroke-dasharray: 100, 250;
          animation: speedStream 3.2s linear infinite;
        }
        .canvas-drift {
          transform-origin: center center;
          animation: globalFloat 7s ease-in-out infinite;
        }
      `}} />

      {/* Main SVG Vector Space */}
      <svg
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full p-4 relative z-10"
        xmlns="http://w3.org"
      >
        <g className="canvas-drift">

          {/* TECHNICAL REFERENCE AXIS AXIAL LINES */}
          <g opacity="0.12" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4,6">
            <line x1="50" y1="230" x2="950" y2="230" />
            <line x1="515" y1="30" x2="515" y2="470" />
            <circle cx="515" cy="230" r="6" fill="none" strokeDasharray="none" />
          </g>

          {/* LAYER 1: AMBIENT FLOW STRIPS */}
          <g stroke="#0ea5e9" opacity="0.4" fill="none" strokeWidth="1.5" strokeLinecap="round">
            <path d="M 260,85 L 350,95" className="stream-line-slow" />
            <path d="M 90,120 L 190,125" className="stream-line-fast" />
            <path d="M 65,215 L 115,218" strokeWidth="1" />
            <path d="M 265,340 L 395,355" className="stream-line-fast" />
            <path d="M 430,425 L 530,432" className="stream-line-slow" />
            <path d="M 690,440 L 810,445" className="stream-line-fast" />
          </g>

          {/* LAYER 2: CHASSIS SHARP HULL (Perfect Centered Needle Profile) */}
          <g stroke="#38bdf8" strokeWidth="1.8" fill="none" strokeLinejoin="round" strokeLinecap="round">
            {/* Main Long Hypersonic Core Needle Structure */}
            <path d="M 15,190 L 810,315 L 755,342 L 530,285 L 140,195" opacity="0.25" fill="#0ea5e9" fillOpacity="0.04" />
            <path d="M 15,190 L 810,315 L 755,342 L 530,285 L 140,195 Z" />

            {/* Centerline Internal Spline Line */}
            <line x1="15" y1="190" x2="530" y2="285" strokeWidth="1.2" opacity="0.6" />
            <line x1="530" y1="285" x2="810" y2="315" strokeWidth="1.2" opacity="0.6" strokeDasharray="2,4" />
          </g>

          {/* LAYER 3: AERODYNAMIC SHOCK RINGS (Rewritten cleanly using exact math arcs) */}
          <g className="animated-ring-group" fill="none" strokeLinecap="round">

            {/* NOSE CONE MINI RING RING */}
            <g stroke="#22d3ee" strokeWidth="1.5">
              {/* Main forward wrapping crescent arc */}
              <path d="M 145,145 A 50 85 0 0 1 255,295" />
              {/* Parallel micro-echo trace lines */}
              <path d="M 160,152 A 42 75 0 0 1 245,282" opacity="0.5" strokeWidth="1" />
              <path d="M 185,140 L 250,150" strokeWidth="1" opacity="0.3" />
            </g>

            {/* MID SHOCKWAVE EXPANSION ARC RING */}
            <g stroke="#38bdf8" strokeWidth="2.5">
              {/* Front high-pressure sweeping curvature curve */}
              <path d="M 470,82 A 95 190 0 0 1 605,378" />
              {/* Secondary rear matching twin shadow arc */}
              <path d="M 445,145 A 75 160 0 0 1 505,310" strokeWidth="1.5" opacity="0.6" />
              {/* Crossflow horizontal interface lines */}
              <line x1="540" y1="170" x2="685" y2="195" strokeWidth="1.2" opacity="0.5" />
              <line x1="465,225" x2="520" y2="225" strokeWidth="1" opacity="0.4" />
            </g>

            {/* REAR TERMINAL EXHAUST GIANT RING */}
            <g stroke="#0ea5e9" strokeWidth="3">
              {/* Giant clean exit vortex crescent path */}
              <path d="M 770,85 A 150 250 0 0 1 890,445" />
              {/* Inner crisp concentric pressure ring edge */}
              <path d="M 700,125 A 120 210 0 0 1 790,410" strokeWidth="1.5" opacity="0.7" />
              {/* Outermost clean expansion dynamic boundary edge */}
              <path d="M 885,210 A 170 280 0 0 1 935,360" strokeWidth="1" opacity="0.4" />
            </g>

          </g>

        </g>
      </svg>

      {/* Outer Atmospheric Depth Tint Overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_30px_rgba(10,22,34,0.85)]" />
    </div>
  );
}
