import React from "react";

export interface BrasaoProps {
  className?: string;
  size?: number;
}

/**
 * Brasão da 19ª CIPM / PARIPE - PMBA
 * Rendered in high quality SVG with transparent background (no black borders)
 */
export const Brasao19CIPM: React.FC<BrasaoProps> = ({ className = "h-16 w-16", size }) => {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      style={size ? { width: size, height: (size * 240) / 200 } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2545" />
          <stop offset="50%" stopColor="#134074" />
          <stop offset="100%" stopColor="#091E3A" />
        </linearGradient>
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA7C11" />
        </linearGradient>
        <linearGradient id="redStripe" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BA181B" />
          <stop offset="100%" stopColor="#E5383B" />
        </linearGradient>
      </defs>

      {/* Main Shield Outline with Golden Trim */}
      <path
        d="M100 8 C155 8 190 28 190 65 C190 150 145 205 100 232 C55 205 10 150 10 65 C10 28 45 8 100 8 Z"
        fill="url(#shieldBg)"
        stroke="url(#goldBorder)"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Inner Border */}
      <path
        d="M100 16 C148 16 180 34 180 67 C180 144 140 196 100 220 C60 196 20 144 20 67 C20 34 52 16 100 16 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />

      {/* Top Banner Ribbon */}
      <path
        d="M30 42 Q100 28 170 42 L164 68 Q100 54 36 68 Z"
        fill="url(#redStripe)"
        stroke="url(#goldBorder)"
        strokeWidth="1.5"
      />
      <text
        x="100"
        y="58"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="900"
        letterSpacing="2"
        fontFamily="sans-serif"
      >
        19ª CIPM
      </text>

      {/* Crossed Swords (Militarism symbol) */}
      <g stroke="url(#goldBorder)" strokeWidth="3" strokeLinecap="round">
        <line x1="55" y1="85" x2="145" y2="165" />
        <line x1="145" y1="85" x2="55" y2="165" />
      </g>
      <circle cx="100" cy="125" r="8" fill="#D4AF37" />

      {/* Central Star */}
      <polygon
        points="100,95 104,107 117,107 106,115 110,127 100,120 90,127 94,115 83,107 96,107"
        fill="#FFFFFF"
        stroke="#D4AF37"
        strokeWidth="1"
      />

      {/* 19 Number Emblazoned */}
      <circle cx="100" cy="148" r="18" fill="#BA181B" stroke="url(#goldBorder)" strokeWidth="2" />
      <text
        x="100"
        y="155"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="18"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        19
      </text>

      {/* Lower Ribbon with PARIPE */}
      <path
        d="M40 182 Q100 198 160 182 L155 204 Q100 220 45 204 Z"
        fill="#0B2545"
        stroke="url(#goldBorder)"
        strokeWidth="2"
      />
      <text
        x="100"
        y="198"
        textAnchor="middle"
        fill="#FFE066"
        fontSize="11"
        fontWeight="bold"
        letterSpacing="2.5"
        fontFamily="sans-serif"
      >
        PARIPE
      </text>
    </svg>
  );
};

/**
 * Brasão da Polícia Militar da Bahia (PMBA)
 * Transparent SVG badge for upper right header
 */
export const BrasaoPMBA: React.FC<BrasaoProps> = ({ className = "h-16 w-16", size }) => {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      style={size ? { width: size, height: (size * 240) / 200 } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pmbaBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00296B" />
          <stop offset="100%" stopColor="#001B44" />
        </linearGradient>
        <linearGradient id="pmbaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD000" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#997300" />
        </linearGradient>
      </defs>

      {/* Shield Base */}
      <path
        d="M100 10 C160 10 188 32 188 70 C188 155 145 210 100 234 C55 210 12 155 12 70 C12 32 40 10 100 10 Z"
        fill="url(#pmbaBlue)"
        stroke="url(#pmbaGold)"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Bahia Flag Center Motif (Triangle in white circle) */}
      <circle cx="100" cy="115" r="45" fill="#FFFFFF" stroke="url(#pmbaGold)" strokeWidth="3" />

      {/* Red Masonic / Inconfidência Triangle from Bahia State Flag */}
      <polygon points="100,85 130,135 70,135" fill="#D90429" stroke="#990000" strokeWidth="1.5" />

      {/* PMBA text on top */}
      <path
        d="M32 46 Q100 32 168 46 L162 70 Q100 56 38 70 Z"
        fill="#00296B"
        stroke="url(#pmbaGold)"
        strokeWidth="1.5"
      />
      <text
        x="100"
        y="62"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        letterSpacing="2"
        fontFamily="sans-serif"
      >
        PMBA
      </text>

      {/* Motto banner bottom */}
      <text
        x="100"
        y="190"
        textAnchor="middle"
        fill="#FFE066"
        fontSize="9.5"
        fontWeight="bold"
        letterSpacing="1"
        fontFamily="sans-serif"
      >
        1825 • BAHIA
      </text>
    </svg>
  );
};
