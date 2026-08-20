import React from 'react';

export const RocketBlueprint: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://w3.org"
      viewBox="0 0 1000 450"
      width="100%"
      height="100%"
      style={{ backgroundColor: '#071626', userSelect: 'none' }}
      {...props}
    >
      <defs>
        {/* Deep schematic background gradient */}
        <radialGradient id="rovno-blueprint-bg" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#0d253f" />
          <stop offset="100%" stopColor="#040b14" />
        </radialGradient>

        <style>{`
          .rv-grid-major { stroke: #123459; stroke-width: 0.8; }
          .rv-grid-minor { stroke: #0a1f36; stroke-width: 0.3; stroke-dasharray: 3,3; }
          .rv-center-axis { stroke: #225c99; stroke-width: 1; stroke-dasharray: 12,4,2,4; fill: none; }
          .rv-dim-line { stroke: #438cd4; stroke-width: 0.8; fill: none; }
          .rv-hatch { stroke: #184473; stroke-width: 0.6; stroke-dasharray: 1,4; }
          
          /* Line Weights */
          .rv-hull-primary { stroke: #ffffff; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
          .rv-hull-secondary { stroke: #ffffff; stroke-width: 1.5; fill: none; }
          .rv-mech-lines { stroke: #7ec0ff; stroke-width: 1.2; fill: none; stroke-linecap: round; }
          .rv-internal-dash { stroke: #4ca1fa; stroke-width: 1; fill: none; stroke-dasharray: 4,3; }
          
          /* Blueprint Typography */
          .rv-text-main { fill: #8cc3f7; font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; }
          .rv-text-bold { fill: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: bold; letter-spacing: 2px; }
          .rv-text-dim { fill: #4880b5; font-family: 'Courier New', Courier, monospace; font-size: 9px; }
          .rv-decal { fill: #4ca1fa; font-family: 'Arial Black', sans-serif; font-weight: 900; font-size: 14px; letter-spacing: 5px; opacity: 0.45; }
        `}</style>
      </defs>

      {/* Background Canvas */}
      <rect width="1000" height="450" fill="url(#rovno-blueprint-bg)" />

      {/* Grid Underlay */}
      <g>
        {/* Minor Grid Lines */}
        <path className="rv-grid-minor" d="
          M 0,25 H 1000 M 0,75 H 1000 M 0,125 H 1000 M 0,175 H 1000 M 0,225 H 1000 M 0,275 H 1000 M 0,325 H 1000 M 0,375 H 1000 M 0,425 H 1000
          M 25,0 V 450 M 75,0 V 450 M 125,0 V 450 M 175,0 V 450 M 225,0 V 450 M 275,0 V 450 M 325,0 V 450 M 375,0 V 450 M 425,0 V 450 M 475,0 V 450
          M 525,0 V 450 M 575,0 V 450 M 625,0 V 450 M 675,0 V 450 M 725,0 V 450 M 775,0 V 450 M 825,0 V 450 M 875,0 V 450 M 925,0 V 450 M 975,0 V 450
        " />
        {/* Major Grid Lines */}
        <path className="rv-grid-major" d="
          M 0,50 H 1000 M 0,100 H 1000 M 0,150 H 1000 M 0,200 H 1000 M 0,250 H 1000 M 0,300 H 1000 M 0,350 H 1000 M 0,400 H 1000
          M 50,0 V 450 M 100,0 V 450 M 150,0 V 450 M 200,0 V 450 M 250,0 V 450 M 300,0 V 450 M 350,0 V 450 M 400,0 V 450 M 450,0 V 450 M 500,0 V 450
          M 550,0 V 450 M 600,0 V 450 M 650,0 V 450 M 700,0 V 450 M 750,0 V 450 M 800,0 V 450 M 850,0 V 450 M 900,0 V 450 M 950,0 V 450
        " />
      </g>

      {/* Main Structural Center Datum Axis */}
      <line className="rv-center-axis" x1="40" y1="225" x2="960" y2="225" />

      {/* --- DIMENSIONAL SCHEMATICS --- */}
      <g>
        {/* Top Boundary Dimension Line */}
        <path className="rv-dim-line" d="M 110,65 V 45 H 890 V 65" />
        <path className="rv-dim-line" d="M 110,45 L 120,41 M 110,45 L 120,49 M 890,45 L 880,41 M 890,45 L 880,49" />
        <text className="rv-text-main" x="430" y="38">OAL EXP: 84.120 mm [ROVNO AERO-SYSTEMS]</text>

        {/* Lower Core Diameter Spec */}
        <path className="rv-dim-line" d="M 905,145 H 930 V 305 H 905" />
        <path className="rv-dim-line" d="M 930,145 L 926,155 M 930,145 L 934,155 M 930,305 L 926,295 M 930,305 L 934,295" />
        <text className="rv-text-main" x="940" y="229">Ø 9.150 mm</text>

        {/* Dynamic Architectural Flag Markers */}
        <path className="rv-dim-line" d="M 810,145 L 840,95 H 910" />
        <circle cx="810" cy="145" r="2.5" fill="#438cd4" />
        <text className="rv-text-main" x="845" y="91">INTEGRATED ROVNO FAIRING MODULE</text>

        <path className="rv-dim-line" d="M 620,180 L 655,95 H 710" />
        <circle cx="620" cy="180" r="2.5" fill="#438cd4" />
        <text className="rv-text-main" x="660" y="91">SOLID LIQUID CRYOTANK</text>

        <path className="rv-dim-line" d="M 230,265 L 200,365 H 110" />
        <circle cx="230" cy="265" r="2.5" fill="#438cd4" />
        <text className="rv-text-main" x="115" y="360">STAGE I FLUID RE-FEED LINE</text>
      </g>

      {/* --- INTERNAL PROPULSION AND REINFORCEMENTS --- */}
      <g>
        <rect className="rv-hatch" x="220" y="225" width="230" height="80" />
        <rect className="rv-hatch" x="510" y="225" width="230" height="80" />

        <path className="rv-internal-dash" d="M 220,145 H 450 M 220,305 H 450" />
        <path className="rv-internal-dash" d="M 450,225 Q 465,265 450,305" />
        <path className="rv-internal-dash" d="M 510,225 Q 525,265 510,305" />
        <path className="rv-internal-dash" d="M 740,225 Q 755,265 740,305" />

        <line className="rv-mech-lines" x1="450" y1="223" x2="510" y2="223" />
        <line className="rv-mech-lines" x1="450" y1="227" x2="510" y2="227" />
      </g>

      {/* --- ROVNO.DEV FUSELAGE BRANDING --- */}
      <text className="rv-decal" x="250" y="185">ROVNO.DEV</text>

      {/* --- PRIMARY STRUCTURAL EXTERIOR PROFILES --- */}
      <g className="rv-hull-primary">
        <path d="M 160,145 H 450 M 450,305 H 160" />

        <path d="M 160,145 V 195 M 160,305 V 255" />
        <line x1="160" y1="145" x2="205" y2="145" />
        <line x1="160" y1="305" x2="205" y2="305" />

        <path d="M 450,145 V 305" />
        <path d="M 510,145 V 305" />
        <path d="M 450,150 H 510 M 450,300 H 510" />

        <path d="M 510,145 H 740 M 740,305 H 510" />

        <path d="M 740,145 Q 830,150 890,225 Q 830,300 740,305" />
        <path d="M 740,145 V 305" />
      </g>

      {/* --- PANEL DETAILED JOINTS AND SEAMS --- */}
      <g className="rv-mech-lines">
        <rect x="470" y="127" width="22" height="18" rx="1" fill="#0d253f" />
        <line x1="481" y1="127" x2="481" y2="145" />
        <rect x="470" y="305" width="22" height="18" rx="1" fill="#0d253f" />
        <line x1="481" y1="305" x2="481" y2="323" />

        <line x1="280" y1="145" x2="280" y2="305" strokeDasharray="4,6" />
        <line x1="380" y1="145" x2="380" y2="305" strokeDasharray="4,6" />
        <line x1="600" y1="145" x2="600" y2="305" strokeDasharray="4,6" />
        <line x1="680" y1="145" x2="680" y2="305" strokeDasharray="4,6" />

        <rect x="210" y="148" width="210" height="3" fill="#040b14" />
        <rect x="540" y="148" width="170" height="3" fill="#040b14" />
      </g>

      {/* --- THRUST PROPULSION SYSTEM ASSEMBLIES --- */}
      <g className="rv-hull-primary">
        <rect x="145" y="195" width="15" height="60" rx="3" fill="#071626" />
        <path d="M 145,200 L 95,160 V 290 L 145,250 Z" fill="#071626" fillOpacity="0.6" />
      </g>
      <g className="rv-mech-lines">
        <path d="M 133,190 V 260 M 121,180 V 270 M 109,171 V 279 M 97,162 V 288" />
      </g>

      {/* Heavy Stabilization Aero Fins */}
      <g className="rv-hull-secondary">
        <path d="M 230,145 L 145,85 H 90 L 160,145 Z" fill="#071626" fillOpacity="0.4" />
        <line className="rv-mech-lines" x1="145" y1="85" x2="160" y2="145" />
        <line className="rv-mech-lines" x1="115" y1="85" x2="135" y2="145" />

        <path d="M 230,305 L 145,365 H 90 L 160,305 Z" fill="#071626" fillOpacity="0.4" />
        <line className="rv-mech-lines" x1="145" y1="365" x2="160" y2="305" />
        <line className="rv-mech-lines" x1="115" y1="365" x2="135" y2="305" />
      </g>

      {/* Exhaust Plume / Shock Diamonds Vectors */}
      <g className="rv-mech-lines" strokeOpacity="0.6">
        <path d="M 95,210 L 65,225 L 95,240 M 65,214 L 40,225 L 65,236 M 40,218 L 20,225 L 40,232" />
        <line x1="95" y1="225" x2="10" y2="225" strokeDasharray="6,4" />
      </g>

      {/* --- OUTER LAYOUT FRAMES AND SCHEMATIC BORDERS --- */}
      <rect x="15" y="15" width="970" height="420" fill="none" stroke="#163f6b" strokeWidth="1.5" />
      <rect x="20" y="20" width="960" height="410" fill="none" stroke="#0e2a4a" strokeWidth="0.5" />

      {/* --- FORMAL INDUSTRIAL TITLE BLOCK --- */}
      <g transform="translate(685, 345)">
        <rect width="275" height="70" fill="#040b14" stroke="#2b6fb3" strokeWidth="1.5" />
        <line x1="0" y1="24" x2="275" y2="24" stroke="#2b6fb3" strokeWidth="0.8" />
        <line x1="145" y1="24" x2="145" y2="70" stroke="#2b6fb3" strokeWidth="0.8" />

        <text className="rv-text-bold" x="12" y="17">ROVNO.DEV AERO</text>
        <text className="rv-text-dim" x="12" y="37">SCALE: 1:125</text>
        <text className="rv-text-dim" x="12" y="49">DWG REF: RV-9941-X</text>
        <text className="rv-text-dim" x="12" y="61">CORE TYPE: CH-PROPULSION</text>

        <text className="rv-text-dim" x="154" y="37">STAGE ID: BLK-IV</text>
        <text className="rv-text-dim" x="154" y="49">DATE: 2026-AUG-20</text>
        <text className="rv-text-main" x="154" y="61" style={{ fill: '#7ec0ff' }}>STATUS: APPROVED</text>
      </g>
    </svg>
  );
};
