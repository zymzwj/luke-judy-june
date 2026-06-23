import React from "react";

function judyChibiSVG() {
  return `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Hair back (long flowing) -->
    <path d="M 22 50 Q 14 95 18 140 L 28 145 L 30 70 Z" fill="#6b3e1f"/>
    <path d="M 78 50 Q 86 95 82 140 L 72 145 L 70 70 Z" fill="#6b3e1f"/>
    <path d="M 26 55 Q 20 110 28 150 L 34 152 L 34 80 Z" fill="#5d3618"/>
    <path d="M 74 55 Q 80 110 72 150 L 66 152 L 66 80 Z" fill="#5d3618"/>
    <!-- Face -->
    <ellipse cx="50" cy="55" rx="21" ry="23" fill="#f7d3b3"/>
    <!-- Hair top -->
    <path d="M 28 42 Q 28 24 50 22 Q 72 24 72 42 L 72 56 Q 68 40 58 38 Q 50 36 42 38 Q 32 40 28 56 Z" fill="#5d3618"/>
    <!-- Bangs -->
    <path d="M 32 38 Q 36 32 42 42 L 42 52 Q 38 46 32 50 Z" fill="#4d2a10"/>
    <path d="M 42 36 Q 48 34 50 40 Q 52 34 58 36 L 58 50 Q 50 44 42 50 Z" fill="#4d2a10"/>
    <path d="M 58 38 Q 64 32 68 38 L 68 50 Q 62 46 58 52 Z" fill="#4d2a10"/>
    <!-- Eyes -->
    <ellipse cx="40" cy="60" rx="3.5" ry="5" fill="#fff"/>
    <ellipse cx="60" cy="60" rx="3.5" ry="5" fill="#fff"/>
    <ellipse cx="40" cy="60" rx="2.6" ry="4.2" fill="#5d3618"/>
    <ellipse cx="60" cy="60" rx="2.6" ry="4.2" fill="#5d3618"/>
    <circle cx="40.8" cy="58" r="1.2" fill="#fff"/>
    <circle cx="60.8" cy="58" r="1.2" fill="#fff"/>
    <!-- Eyebrows -->
    <path d="M 35 51 Q 40 49 44 51" stroke="#5d3618" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M 56 51 Q 60 49 65 51" stroke="#5d3618" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <!-- Mouth -->
    <path d="M 47 70 Q 50 73 53 70" stroke="#a05a3a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <!-- Cheek blush -->
    <ellipse cx="35" cy="66" rx="3" ry="1.5" fill="#f0a8a0" opacity="0.55"/>
    <ellipse cx="65" cy="66" rx="3" ry="1.5" fill="#f0a8a0" opacity="0.55"/>
    <!-- Sweater body (mint cable knit) -->
    <path d="M 28 78 Q 26 100 28 138 L 72 138 Q 74 100 72 78 Q 60 73 50 73 Q 40 73 28 78 Z" fill="#b8d8c8"/>
    <!-- Turtleneck -->
    <path d="M 38 73 Q 50 70 62 73 L 62 80 Q 50 78 38 80 Z" fill="#a3c5b3"/>
    <!-- Cable knit texture -->
    <path d="M 37 84 Q 36 110 37 132" stroke="#a3c5b3" stroke-width="0.9" fill="none"/>
    <path d="M 47 84 Q 46 110 47 132" stroke="#a3c5b3" stroke-width="0.9" fill="none"/>
    <path d="M 53 84 Q 54 110 53 132" stroke="#a3c5b3" stroke-width="0.9" fill="none"/>
    <path d="M 63 84 Q 64 110 63 132" stroke="#a3c5b3" stroke-width="0.9" fill="none"/>
    <!-- Sleeves -->
    <path d="M 22 82 Q 18 100 22 130 L 30 132 L 30 80 Z" fill="#b8d8c8"/>
    <path d="M 78 82 Q 82 100 78 130 L 70 132 L 70 80 Z" fill="#b8d8c8"/>
    <path d="M 25 92 L 25 125" stroke="#a3c5b3" stroke-width="0.8"/>
    <path d="M 75 92 L 75 125" stroke="#a3c5b3" stroke-width="0.8"/>
    <!-- Hands -->
    <circle cx="22" cy="135" r="4" fill="#f7d3b3"/>
    <circle cx="78" cy="135" r="4" fill="#f7d3b3"/>
    <!-- Crossbody bag strap -->
    <path d="M 30 80 Q 50 95 68 105" stroke="#e8d8c0" stroke-width="2" fill="none"/>
    <rect x="62" y="100" width="14" height="11" rx="1.5" fill="#f5ecd8"/>
    <rect x="62" y="100" width="14" height="2" rx="0.5" fill="#e0d4b8"/>
    <circle cx="69" cy="105" r="0.8" fill="#c0a878"/>
    <!-- Skirt (cream pleated) -->
    <path d="M 28 138 L 22 162 L 78 162 L 72 138 Z" fill="#f5ecd8"/>
    <path d="M 35 140 L 32 160" stroke="#e0d4b8" stroke-width="0.9"/>
    <path d="M 42 140 L 41 160" stroke="#e0d4b8" stroke-width="0.9"/>
    <path d="M 50 140 L 50 160" stroke="#e0d4b8" stroke-width="0.9"/>
    <path d="M 58 140 L 59 160" stroke="#e0d4b8" stroke-width="0.9"/>
    <path d="M 65 140 L 68 160" stroke="#e0d4b8" stroke-width="0.9"/>
    <!-- Legs -->
    <rect x="40" y="162" width="6" height="14" fill="#f7d3b3"/>
    <rect x="54" y="162" width="6" height="14" fill="#f7d3b3"/>
    <!-- Boots -->
    <path d="M 37 176 L 36 196 L 49 196 L 48 176 Z" fill="#dec39a"/>
    <path d="M 52 176 L 51 196 L 64 196 L 63 176 Z" fill="#dec39a"/>
    <ellipse cx="42.5" cy="175" rx="6" ry="2.5" fill="#f5e4c8"/>
    <ellipse cx="57.5" cy="175" rx="6" ry="2.5" fill="#f5e4c8"/>
    <ellipse cx="42.5" cy="196" rx="6.5" ry="1.5" fill="#6b5230"/>
    <ellipse cx="57.5" cy="196" rx="6.5" ry="1.5" fill="#6b5230"/>
  </svg>`;
}

function lukeChibiSVG() {
  return `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Hair back -->
    <path d="M 28 50 Q 26 70 32 78 L 68 78 Q 74 70 72 50 Z" fill="#0a0a0a"/>
    <!-- Face -->
    <ellipse cx="50" cy="55" rx="20" ry="22" fill="#f7d3b3"/>
    <!-- Hair top -->
    <path d="M 28 45 Q 24 26 38 22 Q 50 18 62 22 Q 76 26 72 45 L 68 52 Q 64 36 56 36 Q 50 28 44 36 Q 36 36 32 52 Z" fill="#1a1a1a"/>
    <!-- Stand-up tufts -->
    <path d="M 36 25 L 38 18 L 42 27 Z" fill="#1a1a1a"/>
    <path d="M 46 22 L 49 16 L 52 22 Z" fill="#1a1a1a"/>
    <path d="M 54 20 L 57 16 L 60 23 Z" fill="#1a1a1a"/>
    <path d="M 60 24 L 64 19 L 66 28 Z" fill="#1a1a1a"/>
    <!-- Front side bangs -->
    <path d="M 32 40 Q 34 32 38 38 L 38 50 Q 34 47 32 52 Z" fill="#0a0a0a"/>
    <path d="M 62 38 Q 66 32 68 40 L 68 52 Q 64 47 62 50 Z" fill="#0a0a0a"/>
    <!-- Center fringe -->
    <path d="M 38 38 Q 50 32 62 38 L 60 48 Q 50 44 40 48 Z" fill="#0a0a0a"/>
    <!-- Eyebrows -->
    <path d="M 34 52 Q 39 50 44 52" stroke="#0a0a0a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 56 52 Q 61 50 66 52" stroke="#0a0a0a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Eyes -->
    <ellipse cx="40" cy="60" rx="3" ry="4" fill="#fff"/>
    <ellipse cx="60" cy="60" rx="3" ry="4" fill="#fff"/>
    <ellipse cx="40" cy="60" rx="2.3" ry="3.5" fill="#2a1a10"/>
    <ellipse cx="60" cy="60" rx="2.3" ry="3.5" fill="#2a1a10"/>
    <circle cx="40.8" cy="58.5" r="0.9" fill="#fff"/>
    <circle cx="60.8" cy="58.5" r="0.9" fill="#fff"/>
    <!-- Mouth -->
    <path d="M 46 70 Q 50 72 54 70" stroke="#a05a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <!-- Inner shirt -->
    <path d="M 40 78 L 60 78 L 60 84 L 40 84 Z" fill="#0a0a0a"/>
    <!-- Jacket body -->
    <path d="M 26 80 Q 24 100 28 145 L 72 145 Q 76 100 74 80 Q 64 76 50 76 Q 36 76 26 80 Z" fill="#1a1a1a"/>
    <!-- Jacket collar -->
    <path d="M 36 80 Q 50 84 64 80 L 62 86 Q 50 88 38 86 Z" fill="#0a0a0a"/>
    <!-- Zipper -->
    <line x1="50" y1="86" x2="50" y2="142" stroke="#3a3a3a" stroke-width="1.2"/>
    <circle cx="50" cy="88" r="1.2" fill="#5a5a5a"/>
    <!-- Side seam -->
    <line x1="34" y1="100" x2="33" y2="140" stroke="#0a0a0a" stroke-width="0.8" opacity="0.6"/>
    <line x1="66" y1="100" x2="67" y2="140" stroke="#0a0a0a" stroke-width="0.8" opacity="0.6"/>
    <!-- Sleeves -->
    <path d="M 22 84 Q 18 105 22 138 L 30 138 L 30 82 Z" fill="#1a1a1a"/>
    <path d="M 78 84 Q 82 105 78 138 L 70 138 L 70 82 Z" fill="#1a1a1a"/>
    <rect x="20" y="135" width="11" height="3" fill="#0a0a0a"/>
    <rect x="69" y="135" width="11" height="3" fill="#0a0a0a"/>
    <!-- Hands -->
    <circle cx="25" cy="142" r="3.5" fill="#f7d3b3"/>
    <circle cx="75" cy="142" r="3.5" fill="#f7d3b3"/>
    <!-- Jacket hem -->
    <rect x="28" y="143" width="44" height="3" fill="#0a0a0a"/>
    <!-- Pants -->
    <path d="M 32 146 L 32 184 L 48 184 L 49 146 Z" fill="#2a2a2a"/>
    <path d="M 51 146 L 52 184 L 68 184 L 68 146 Z" fill="#2a2a2a"/>
    <line x1="40" y1="150" x2="40" y2="182" stroke="#1a1a1a" stroke-width="0.6" opacity="0.5"/>
    <line x1="60" y1="150" x2="60" y2="182" stroke="#1a1a1a" stroke-width="0.6" opacity="0.5"/>
    <!-- Sneakers -->
    <path d="M 30 184 L 30 196 L 50 196 L 50 184 Z" fill="#f5f5f5"/>
    <path d="M 50 184 L 50 196 L 70 196 L 70 184 Z" fill="#f5f5f5"/>
    <line x1="34" y1="188" x2="46" y2="188" stroke="#d0d0d0" stroke-width="0.7"/>
    <line x1="54" y1="188" x2="66" y2="188" stroke="#d0d0d0" stroke-width="0.7"/>
    <rect x="29" y="194" width="22" height="2.5" rx="1" fill="#d8d8d8"/>
    <rect x="49" y="194" width="22" height="2.5" rx="1" fill="#d8d8d8"/>
  </svg>`;
}

export default function PixelAvatars({ birthday = false }) {
  return (
    <div
      className={`pixel-avatars${birthday ? " birthday" : ""}`}
      id="pixelAvatars"
    >
      <div
        className="pixel-char judy"
        dangerouslySetInnerHTML={{ __html: judyChibiSVG() }}
      />
      <div
        className="pixel-char luke"
        dangerouslySetInnerHTML={{ __html: lukeChibiSVG() }}
      />
    </div>
  );
}
