// ─────────────────────────────────────────────
// Premium SVG Illustrations for JanVaani
// ─────────────────────────────────────────────

// India Map Outline (simplified, elegant decorative version)
export const IndiaMapSVG = ({ style = {} }) => (
  <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.07, ...style }}>
    <path d="M200 20 L220 30 L240 25 L260 35 L280 30 L300 40 L310 55 L320 70 L330 60 L340 75 L345 90 L350 105 L340 120 L345 135 L350 150 L355 170 L350 185 L340 200 L345 215 L350 230 L345 250 L335 265 L340 280 L345 295 L340 310 L330 325 L320 340 L310 355 L300 365 L290 380 L275 390 L260 395 L245 405 L230 415 L220 430 L210 445 L200 460 L195 470 L190 460 L185 445 L175 435 L165 420 L155 405 L145 390 L130 380 L115 370 L105 355 L95 340 L85 325 L80 310 L75 295 L70 280 L65 265 L60 250 L55 235 L60 220 L65 205 L70 190 L75 175 L80 160 L85 145 L90 130 L95 115 L105 100 L115 85 L125 75 L140 65 L155 55 L170 45 L185 30 L200 20Z"
      stroke="url(#indiaGrad)" strokeWidth="1.5" fill="url(#indiaFill)" />
    <defs>
      <linearGradient id="indiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
      <linearGradient id="indiaFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.03" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
      </linearGradient>
    </defs>
  </svg>
);

// Ashoka Chakra (24-spoke wheel) — beautiful animated version
export const AshokaChakraSVG = ({ size = 120, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <circle cx="60" cy="60" r="55" stroke="url(#chakraGrad)" strokeWidth="1.5" fill="none" opacity="0.4" />
    <circle cx="60" cy="60" r="48" stroke="url(#chakraGrad)" strokeWidth="0.5" fill="none" opacity="0.2" />
    <circle cx="60" cy="60" r="12" fill="url(#chakraCenter)" opacity="0.6" />
    <circle cx="60" cy="60" r="8" stroke="url(#chakraGrad)" strokeWidth="1" fill="none" opacity="0.5" />
    {/* 24 spokes */}
    {Array.from({ length: 24 }, (_, i) => {
      const angle = (i * 15 * Math.PI) / 180;
      const x1 = 60 + 12 * Math.cos(angle);
      const y1 = 60 + 12 * Math.sin(angle);
      const x2 = 60 + 48 * Math.cos(angle);
      const y2 = 60 + 48 * Math.sin(angle);
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="url(#chakraGrad)" strokeWidth={i % 3 === 0 ? "1" : "0.5"}
          opacity={i % 3 === 0 ? "0.5" : "0.25"} />
      );
    })}
    {/* 24 dots on the rim */}
    {Array.from({ length: 24 }, (_, i) => {
      const angle = (i * 15 * Math.PI) / 180;
      const x = 60 + 51.5 * Math.cos(angle);
      const y = 60 + 51.5 * Math.sin(angle);
      return (
        <circle key={`dot-${i}`} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1}
          fill="url(#chakraGrad)" opacity={i % 3 === 0 ? 0.6 : 0.3} />
      );
    })}
    <defs>
      <radialGradient id="chakraCenter">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
      </radialGradient>
      <linearGradient id="chakraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
  </svg>
);

// Government Building/Capitol illustration
export const GovBuildingSVG = ({ style = {} }) => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    {/* Main building base */}
    <rect x="30" y="70" width="140" height="80" rx="2"
      fill="url(#buildGrad)" stroke="rgba(56,189,248,0.3)" strokeWidth="0.5" />
    {/* Pillars */}
    {[50, 75, 100, 125, 150].map((x, i) => (
      <g key={i}>
        <rect x={x - 3} y="45" width="6" height="105" rx="1"
          fill="url(#pillarGrad)" stroke="rgba(56,189,248,0.2)" strokeWidth="0.3" />
        <rect x={x - 5} y="42" width="10" height="5" rx="1"
          fill="rgba(56,189,248,0.15)" />
        <rect x={x - 5} y="148" width="10" height="4" rx="1"
          fill="rgba(56,189,248,0.15)" />
      </g>
    ))}
    {/* Dome */}
    <path d="M70 45 Q100 5 130 45" stroke="url(#domeGrad)" strokeWidth="1.5" fill="url(#domeFill)" />
    <circle cx="100" cy="15" r="3" fill="rgba(56,189,248,0.6)" />
    <line x1="100" y1="18" x2="100" y2="28" stroke="rgba(56,189,248,0.4)" strokeWidth="0.5" />
    {/* Steps */}
    <rect x="20" y="150" width="160" height="4" rx="1" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.15)" strokeWidth="0.3" />
    <rect x="15" y="154" width="170" height="4" rx="1" fill="rgba(56,189,248,0.05)" stroke="rgba(56,189,248,0.1)" strokeWidth="0.3" />
    {/* Windows */}
    {[60, 85, 115, 140].map((x, i) => (
      <g key={`w-${i}`}>
        <rect x={x - 4} y="80" width="8" height="12" rx="4"
          fill="rgba(56,189,248,0.15)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.3" />
        <rect x={x - 4} y="105" width="8" height="12" rx="4"
          fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.2)" strokeWidth="0.3" />
      </g>
    ))}
    {/* Door */}
    <rect x="92" y="118" width="16" height="30" rx="8"
      fill="rgba(56,189,248,0.2)" stroke="rgba(56,189,248,0.35)" strokeWidth="0.5" />
    <defs>
      <linearGradient id="buildGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(56,189,248,0.12)" />
        <stop offset="100%" stopColor="rgba(56,189,248,0.03)" />
      </linearGradient>
      <linearGradient id="pillarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(56,189,248,0.15)" />
        <stop offset="100%" stopColor="rgba(99,102,241,0.08)" />
      </linearGradient>
      <linearGradient id="domeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
      <linearGradient id="domeFill" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="rgba(56,189,248,0.08)" />
        <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
      </linearGradient>
    </defs>
  </svg>
);

// Typing/Document illustration for the "Record by Typing" card
export const TypingIllustrationSVG = ({ style = {} }) => (
  <svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    {/* Document */}
    <rect x="45" y="10" width="90" height="100" rx="6" fill="rgba(56,189,248,0.06)" stroke="rgba(56,189,248,0.25)" strokeWidth="0.8" />
    <rect x="45" y="10" width="90" height="20" rx="6" fill="rgba(56,189,248,0.1)" />
    {/* Lines of text */}
    {[40, 52, 64, 76, 88].map((y, i) => (
      <rect key={i} x="55" y={y} width={60 - i * 6} height="3" rx="1.5"
        fill={`rgba(56,189,248,${0.3 - i * 0.04})`} />
    ))}
    {/* Pen/cursor */}
    <line x1="55" y1="95" x2="55" y2="82" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
    </line>
    {/* Corner fold */}
    <path d="M125 10 L135 10 L135 20 Z" fill="rgba(56,189,248,0.15)" />
    {/* Checkmark */}
    <circle cx="147" cy="75" r="12" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5" />
    <path d="M141 75 L145 79 L153 71" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

// Microphone/Voice illustration for the "Record by Voice" card
export const VoiceIllustrationSVG = ({ style = {} }) => (
  <svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    {/* Microphone body */}
    <rect x="80" y="20" width="20" height="50" rx="10" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.4)" strokeWidth="0.8" />
    {/* Mic stand arc */}
    <path d="M70 55 Q70 85 90 85 Q110 85 110 55" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="none" />
    {/* Stand */}
    <line x1="90" y1="85" x2="90" y2="100" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
    <line x1="78" y1="100" x2="102" y2="100" stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeLinecap="round" />
    {/* Sound waves */}
    {[1, 2, 3].map(i => (
      <path key={i}
        d={`M${60 - i * 12} ${35 + i * 2} Q${60 - i * 12} ${55 - i * 2} ${60 - i * 12} ${55 + i * 3}`}
        stroke={`rgba(16,185,129,${0.5 - i * 0.12})`}
        strokeWidth="1" fill="none" strokeLinecap="round">
        <animate attributeName="opacity" values={`${0.2};${0.6 - i * 0.12};${0.2}`}
          dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
      </path>
    ))}
    {[1, 2, 3].map(i => (
      <path key={`r-${i}`}
        d={`M${120 + i * 12} ${35 + i * 2} Q${120 + i * 12} ${55 - i * 2} ${120 + i * 12} ${55 + i * 3}`}
        stroke={`rgba(16,185,129,${0.5 - i * 0.12})`}
        strokeWidth="1" fill="none" strokeLinecap="round">
        <animate attributeName="opacity" values={`${0.2};${0.6 - i * 0.12};${0.2}`}
          dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
      </path>
    ))}
    {/* Floating waveform */}
    <path d="M25 45 Q30 35 35 45 Q40 55 45 45 Q50 35 55 45" stroke="rgba(16,185,129,0.2)" strokeWidth="0.8" fill="none">
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M125 45 Q130 35 135 45 Q140 55 145 45 Q150 35 155 45" stroke="rgba(16,185,129,0.2)" strokeWidth="0.8" fill="none">
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.3s" repeatCount="indefinite" />
    </path>
  </svg>
);

// Search/Track illustration for the "Track Complaint" card
export const TrackIllustrationSVG = ({ style = {} }) => (
  <svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    {/* Magnifying glass */}
    <circle cx="80" cy="50" r="28" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" fill="rgba(99,102,241,0.05)" />
    <circle cx="80" cy="50" r="22" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5" fill="none" />
    <line x1="100" y1="70" x2="120" y2="90" stroke="rgba(99,102,241,0.5)" strokeWidth="3" strokeLinecap="round" />
    {/* Search pulse rings */}
    <circle cx="80" cy="50" r="32" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5" fill="none">
      <animate attributeName="r" values="30;40;30" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
    {/* Progress dots inside the glass */}
    <circle cx="68" cy="48" r="3" fill="rgba(99,102,241,0.3)">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" begin="0s" repeatCount="indefinite" />
    </circle>
    <circle cx="80" cy="48" r="3" fill="rgba(99,102,241,0.3)">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
    </circle>
    <circle cx="92" cy="48" r="3" fill="rgba(99,102,241,0.3)">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
    </circle>
    {/* Ticket card floating */}
    <rect x="130" y="25" width="35" height="28" rx="4" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.25)" strokeWidth="0.5"
      transform="rotate(5 147 39)">
      <animate attributeName="y" values="25;20;25" dur="3s" repeatCount="indefinite" />
    </rect>
    <rect x="135" y="32" width="20" height="2" rx="1" fill="rgba(99,102,241,0.2)" transform="rotate(5 145 33)" />
    <rect x="135" y="38" width="15" height="2" rx="1" fill="rgba(99,102,241,0.15)" transform="rotate(5 142 39)" />
    <rect x="135" y="44" width="18" height="2" rx="1" fill="rgba(99,102,241,0.1)" transform="rotate(5 144 45)" />
  </svg>
);

// Particle field for the hero area - adds depth
export const ParticleField = ({ style = {} }) => (
  <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", ...style }}>
    {/* Connection lines */}
    {[
      [100, 150, 250, 200], [250, 200, 400, 120], [400, 120, 550, 250],
      [550, 250, 700, 180], [700, 180, 850, 300], [850, 300, 1000, 200],
      [1000, 200, 1100, 350], [200, 400, 350, 320], [500, 450, 650, 380],
      [800, 420, 950, 350],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="rgba(56,189,248,0.06)" strokeWidth="0.5" />
    ))}
    {/* Floating particles */}
    {[
      { cx: 100, cy: 150, r: 2.5, dur: "8s", delay: "0s" },
      { cx: 250, cy: 200, r: 1.5, dur: "10s", delay: "1s" },
      { cx: 400, cy: 120, r: 3, dur: "7s", delay: "0.5s" },
      { cx: 550, cy: 250, r: 2, dur: "9s", delay: "2s" },
      { cx: 700, cy: 180, r: 2.5, dur: "11s", delay: "1.5s" },
      { cx: 850, cy: 300, r: 1.5, dur: "8s", delay: "3s" },
      { cx: 1000, cy: 200, r: 3, dur: "10s", delay: "0.8s" },
      { cx: 1100, cy: 350, r: 2, dur: "9s", delay: "2.5s" },
      { cx: 200, cy: 400, r: 2, dur: "7s", delay: "1.2s" },
      { cx: 350, cy: 320, r: 1.5, dur: "12s", delay: "0.3s" },
      { cx: 500, cy: 450, r: 2.5, dur: "8s", delay: "1.8s" },
      { cx: 650, cy: 380, r: 2, dur: "10s", delay: "0.7s" },
      { cx: 800, cy: 420, r: 3, dur: "9s", delay: "2.2s" },
      { cx: 950, cy: 350, r: 1.5, dur: "11s", delay: "1.1s" },
      { cx: 150, cy: 80, r: 2, dur: "8s", delay: "0s" },
      { cx: 600, cy: 90, r: 1.5, dur: "9s", delay: "0.5s" },
      { cx: 900, cy: 100, r: 2, dur: "7s", delay: "1s" },
      { cx: 300, cy: 500, r: 2.5, dur: "10s", delay: "1.5s" },
      { cx: 750, cy: 500, r: 2, dur: "8s", delay: "2s" },
    ].map((p, i) => (
      <circle key={`p-${i}`} cx={p.cx} cy={p.cy} r={p.r}
        fill="url(#particleGrad)" opacity="0.4">
        <animate attributeName="opacity" values="0.15;0.6;0.15" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
        <animate attributeName="cy" values={`${p.cy};${p.cy - 15};${p.cy}`} dur={p.dur} begin={p.delay} repeatCount="indefinite" />
      </circle>
    ))}
    <defs>
      <radialGradient id="particleGrad">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="60%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// National Emblem decorative ring (simplified)
export const EmblemRingSVG = ({ size = 80, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <circle cx="40" cy="40" r="38" stroke="url(#emblemGrad)" strokeWidth="1" fill="none" opacity="0.5" />
    <circle cx="40" cy="40" r="34" stroke="url(#emblemGrad)" strokeWidth="0.5" fill="none" opacity="0.3" />
    <circle cx="40" cy="40" r="30" stroke="url(#emblemGrad)" strokeWidth="0.3" fill="none" opacity="0.2" />
    {/* Stars */}
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const x = 40 + 36 * Math.cos(angle);
      const y = 40 + 36 * Math.sin(angle);
      return <circle key={i} cx={x} cy={y} r="1.5" fill="#38bdf8" opacity="0.5" />;
    })}
    <defs>
      <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
  </svg>
);

// Decorative wave divider
export const WaveDivider = ({ style = {} }) => (
  <svg viewBox="0 0 1200 60" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "auto", ...style }}>
    <path d="M0 30 Q150 0 300 30 Q450 60 600 30 Q750 0 900 30 Q1050 60 1200 30"
      stroke="url(#waveGrad)" strokeWidth="0.8" fill="none" opacity="0.3" />
    <path d="M0 35 Q150 10 300 35 Q450 55 600 35 Q750 10 900 35 Q1050 55 1200 35"
      stroke="url(#waveGrad)" strokeWidth="0.4" fill="none" opacity="0.15" />
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="20%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="80%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);

// Tricolor accent bar (India flag colors)
export const TricolorBar = ({ style = {} }) => (
  <div style={{ display: "flex", width: "100%", height: 3, borderRadius: 2, overflow: "hidden", ...style }}>
    <div style={{ flex: 1, background: "linear-gradient(90deg, transparent, #FF9933)" }} />
    <div style={{ flex: 1, background: "#FFFFFF", opacity: 0.3 }} />
    <div style={{ flex: 1, background: "linear-gradient(90deg, #138808, transparent)" }} />
  </div>
);

// Grievance Network Background — departments as nodes connected by flowing grievance paths
export const DeptIconsField = ({ style = {} }) => {
  // Department nodes positioned across the viewport
  const depts = [
    { x: 120, y: 80, label: "WATER", icon: "💧", r: 22, color: "#0ea5e9" },
    { x: 380, y: 140, label: "HEALTH", icon: "🏥", r: 24, color: "#ef4444" },
    { x: 650, y: 60, label: "EDUCATION", icon: "📚", r: 22, color: "#8b5cf6" },
    { x: 900, y: 130, label: "ROADS", icon: "🛣️", r: 22, color: "#64748b" },
    { x: 1080, y: 80, label: "POWER", icon: "⚡", r: 20, color: "#f59e0b" },
    { x: 200, y: 320, label: "POLICE", icon: "🛡️", r: 24, color: "#6366f1" },
    { x: 500, y: 380, label: "SANITATION", icon: "🚰", r: 22, color: "#10b981" },
    { x: 780, y: 340, label: "HOUSING", icon: "🏠", r: 22, color: "#f97316" },
    { x: 1020, y: 360, label: "AGRICULTURE", icon: "🌾", r: 22, color: "#22c55e" },
    { x: 340, y: 520, label: "TRANSPORT", icon: "🚌", r: 22, color: "#0284c7" },
    { x: 660, y: 540, label: "REVENUE", icon: "📋", r: 22, color: "#7c3aed" },
    { x: 950, y: 500, label: "TELECOM", icon: "📡", r: 20, color: "#06b6d4" },
  ];
  // Connection paths between departments (grievance routing)
  const connections = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,7],[3,8],
    [5,6],[6,7],[7,8],[5,9],[6,10],[7,11],[9,10],[10,11],
    [1,5],[2,6],[3,7],[4,8],[0,9],[6,2]
  ];
  return (
    <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:4, ...style }}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="deptGlow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        {depts.map((d, i) => (
          <radialGradient key={`dg${i}`} id={`dg${i}`}>
            <stop offset="0%" stopColor={d.color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={d.color} stopOpacity="0"/>
          </radialGradient>
        ))}
      </defs>
      {/* Connection lines with flowing pulse */}
      {connections.map(([a,b], i) => {
        const da = depts[a], db = depts[b];
        return (
          <g key={`c${i}`}>
            <line x1={da.x} y1={da.y} x2={db.x} y2={db.y}
              stroke="rgba(56,189,248,0.06)" strokeWidth="0.8" strokeDasharray="6 4"/>
            {/* flowing dot along the line */}
            <circle r="2" fill="rgba(56,189,248,0.5)">
              <animate attributeName="cx" values={`${da.x};${db.x};${da.x}`}
                dur={`${8 + (i % 5) * 2}s`} begin={`${(i * 0.7) % 4}s`} repeatCount="indefinite"/>
              <animate attributeName="cy" values={`${da.y};${db.y};${da.y}`}
                dur={`${8 + (i % 5) * 2}s`} begin={`${(i * 0.7) % 4}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;0.6;0.6;0"
                dur={`${8 + (i % 5) * 2}s`} begin={`${(i * 0.7) % 4}s`} repeatCount="indefinite"/>
            </circle>
          </g>
        );
      })}
      {/* Department nodes */}
      {depts.map((d, i) => (
        <g key={`d${i}`}>
          {/* Ambient glow circle */}
          <circle cx={d.x} cy={d.y} r={d.r * 2.5} fill={`url(#dg${i})`}>
            <animate attributeName="r" values={`${d.r*2.2};${d.r*3};${d.r*2.2}`}
              dur={`${6 + i}s`} repeatCount="indefinite"/>
          </circle>
          {/* Node ring */}
          <circle cx={d.x} cy={d.y} r={d.r} fill="none"
            stroke={d.color} strokeWidth="0.8" opacity="0.25">
            <animate attributeName="opacity" values="0.15;0.35;0.15"
              dur={`${5+i}s`} repeatCount="indefinite"/>
          </circle>
          {/* Inner filled circle */}
          <circle cx={d.x} cy={d.y} r={d.r * 0.65} fill={d.color} opacity="0.06"/>
          {/* Icon */}
          <text x={d.x} y={d.y + 1} textAnchor="middle" dominantBaseline="central"
            fontSize="10" opacity="0.18" style={{userSelect:"none"}}>
            {d.icon}
          </text>
          {/* Label */}
          <text x={d.x} y={d.y + d.r + 12} textAnchor="middle"
            fill={d.color} fontSize="5.5" fontFamily="Manrope, sans-serif"
            fontWeight="700" letterSpacing="1.2" opacity="0.12"
            style={{userSelect:"none"}}>
            {d.label}
          </text>
        </g>
      ))}
      {/* Floating grievance documents moving upward */}
      {[
        {x: 160, delay: "0s", dur: "18s"},
        {x: 440, delay: "4s", dur: "22s"},
        {x: 720, delay: "8s", dur: "20s"},
        {x: 980, delay: "2s", dur: "24s"},
        {x: 300, delay: "10s", dur: "19s"},
        {x: 840, delay: "6s", dur: "21s"},
      ].map((doc, i) => (
        <g key={`doc${i}`} opacity="0">
          <animate attributeName="opacity" values="0;0.12;0.12;0"
            dur={doc.dur} begin={doc.delay} repeatCount="indefinite"/>
          <rect x={doc.x - 6} y="0" width="12" height="16" rx="1.5"
            fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="0.5">
            <animate attributeName="y" values="580;-20" dur={doc.dur} begin={doc.delay} repeatCount="indefinite"/>
          </rect>
          <line x1={doc.x - 3} x2={doc.x + 3} y1="0" y2="0"
            stroke="rgba(148,163,184,0.3)" strokeWidth="0.4">
            <animate attributeName="y1" values="585;-15" dur={doc.dur} begin={doc.delay} repeatCount="indefinite"/>
            <animate attributeName="y2" values="585;-15" dur={doc.dur} begin={doc.delay} repeatCount="indefinite"/>
          </line>
          <line x1={doc.x - 3} x2={doc.x + 2} y1="0" y2="0"
            stroke="rgba(148,163,184,0.25)" strokeWidth="0.4">
            <animate attributeName="y1" values="588;-12" dur={doc.dur} begin={doc.delay} repeatCount="indefinite"/>
            <animate attributeName="y2" values="588;-12" dur={doc.dur} begin={doc.delay} repeatCount="indefinite"/>
          </line>
        </g>
      ))}
    </svg>
  );
};
