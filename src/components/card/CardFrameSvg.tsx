"use client";

import React from "react";
import { CardFrameColor, CardType } from "@/lib/schema";

/**
 * Paleta de colores para los fondos del marco.
 * Cada entrada define los stops de los 3 gradientes de fondo:
 *  - bg: radialGradient para el fondo general de la carta
 *  - panel: linearGradient para los paneles (nombre, efecto)
 *  - inset: linearGradient de viñeta interior de los paneles
 */
interface ColorPalette {
  bg: [string, string, string, string];
  panel: [string, string, string, string];
  insetOpacity: [number, number]; // [edge opacity, mid opacity]
  insetColor: [string, string]; // [edge color, mid color]
  darkRim: string;
}

const COLOR_PALETTES: Record<CardFrameColor, ColorPalette> = {
  red: {
    bg: ["#eb4c2d", "#b32e15", "#6e1707", "#380a02"],
    panel: ["#541407", "#3d0c03", "#280701", "#180400"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#120300", "#300a03"],
    darkRim: "#140300",
  },
  blue: {
    bg: ["#0077d4", "#005ea7", "#003a6b", "#001a33"],
    panel: ["#00335e", "#002442", "#00172b", "#000d1a"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#000912", "#001e38"],
    darkRim: "#000b14",
  },
  green: {
    bg: ["#38ac30", "#2a8723", "#1b5916", "#0d2e0b"],
    panel: ["#184714", "#11330e", "#0b2109", "#061305"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#040d03", "#102e0d"],
    darkRim: "#050f04",
  },
  orange: {
    bg: ["#d58515", "#aa640c", "#6e3e04", "#381e00"],
    panel: ["#422502", "#301a01", "#211100", "#140a00"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#0e0700", "#261501"],
    darkRim: "#100800",
  },
  yellow: {
    bg: ["#fffb75", "#fee600", "#dfca00", "#a89800"],
    panel: ["#4d4400", "#3a3400", "#2b2600", "#1c1900"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#121000", "#3b3400"],
    darkRim: "#242000",
  },
  cyan: {
    bg: ["#78e0ff", "#22a2db", "#148ac2", "#0c618c"],
    panel: ["#104e6e", "#0b3b54", "#072b3d", "#041d2a"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#02121c", "#125478"],
    darkRim: "#041d2b",
  },
  black: {
    bg: ["#07363a", "#05272a", "#03191c", "#010c0e"],
    panel: ["#041e21", "#031618", "#020f11", "#010809"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#010506", "#031416"],
    darkRim: "#010607",
  },
  white: {
    bg: ["#ffffff", "#e6e5e1", "#b0aca2", "#6b665c"],
    panel: ["#3d3b37", "#2e2c29", "#21201d", "#141311"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#0d0d0c", "#292724"],
    darkRim: "#10100f",
  },
  gray: {
    bg: ["#828780", "#626660", "#414440", "#222421"],
    panel: ["#2e302d", "#232522", "#181917", "#0e0f0e"],
    insetOpacity: [0.85, 0.35],
    insetColor: ["#0a0a09", "#1e201d"],
    darkRim: "#0d0e0c",
  },
};

export interface CardFrameSvgProps {
  cardType: CardType;
  frameColor: CardFrameColor;
}

/**
 * Marco de carta vectorial SVG puro con colores dinámicos.
 * Reemplaza los marcos PNG rasterizados. Se renderiza a 1024×1536 px lógicos
 * con viewBox nativo y escala perfecta en cualquier resolución.
 */
export const CardFrameSvg: React.FC<CardFrameSvgProps> = ({ cardType, frameColor }) => {
  const palette = COLOR_PALETTES[frameColor] || COLOR_PALETTES.blue;
  const isMonster = cardType === "monster";
  const isArcano = cardType === "arcano";
  const hasCost = !isArcano; // General y Monster tienen medallón de coste

  // ID únicos para evitar colisiones si se renderizan múltiples cartas
  const uid = `cf-${frameColor}-${cardType}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1536"
      width="1024"
      height="1536"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        {/* ── Gradientes de Oro Metálico ── */}
        <linearGradient id={`${uid}-gold-p`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="20%" stopColor="#e9c871" />
          <stop offset="45%" stopColor="#b68925" />
          <stop offset="70%" stopColor="#f3d17e" />
          <stop offset="90%" stopColor="#8a6311" />
          <stop offset="100%" stopColor="#543c06" />
        </linearGradient>
        <linearGradient id={`${uid}-gold-b`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#fbe8a6" />
          <stop offset="50%" stopColor="#d4aa43" />
          <stop offset="75%" stopColor="#fff1be" />
          <stop offset="100%" stopColor="#9a7019" />
        </linearGradient>
        <linearGradient id={`${uid}-gold-d`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c49733" />
          <stop offset="50%" stopColor="#73520e" />
          <stop offset="100%" stopColor="#3d2a04" />
        </linearGradient>
        <radialGradient id={`${uid}-gold-r`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fae498" />
          <stop offset="70%" stopColor="#b38421" />
          <stop offset="100%" stopColor="#4e3404" />
        </radialGradient>

        {/* ── Gradientes de Fondo Dinámicos ── */}
        <radialGradient id={`${uid}-bg`} cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor={palette.bg[0]} />
          <stop offset="40%" stopColor={palette.bg[1]} />
          <stop offset="75%" stopColor={palette.bg[2]} />
          <stop offset="100%" stopColor={palette.bg[3]} />
        </radialGradient>
        <linearGradient id={`${uid}-pnl`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.panel[0]} />
          <stop offset="35%" stopColor={palette.panel[1]} />
          <stop offset="80%" stopColor={palette.panel[2]} />
          <stop offset="100%" stopColor={palette.panel[3]} />
        </linearGradient>
        <linearGradient id={`${uid}-ins`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.insetColor[0]} stopOpacity={palette.insetOpacity[0]} />
          <stop offset="15%" stopColor={palette.insetColor[1]} stopOpacity={palette.insetOpacity[1]} />
          <stop offset="85%" stopColor={palette.insetColor[1]} stopOpacity={palette.insetOpacity[1]} />
          <stop offset="100%" stopColor={palette.insetColor[0]} stopOpacity={palette.insetOpacity[0]} />
        </linearGradient>

        {/* ── Filtro de Sombra ── */}
        <filter id={`${uid}-sh`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000000" floodOpacity="0.85" />
        </filter>

        {/* ── Máscara: Ventana de Arte Transparente ── */}
        <mask id={`${uid}-mask`}>
          <rect x="0" y="0" width="1024" height="1536" fill="#ffffff" />
          {hasCost ? (
            <path d="M 197,204 L 914,204 Q 926,204 926,216 L 926,1100 Q 926,1112 914,1112 L 110,1112 Q 98,1112 98,1100 L 98,274 C 134,228 172,206 197,204 Z" fill="#000000" />
          ) : (
            <rect x="96" y="200" width="832" height="904" rx="20" fill="#000000" />
          )}
        </mask>

        {/* ── Símbolo: Estrella Celestial ── */}
        <g id={`${uid}-star`}>
          <polygon points="0,-24 4,-6 6,-4 24,0 6,4 4,6 0,24 -4,6 -6,4 -24,0 -6,-4 -4,-6" fill={`url(#${uid}-gold-d)`} />
          <polygon points="0,-44 5,-8 0,0" fill="#fff7dd" />
          <polygon points="0,44 -5,8 0,0" fill="#dfb651" />
          <polygon points="44,0 8,5 0,0" fill="#ffe9a6" />
          <polygon points="-44,0 -8,-5 0,0" fill="#dfb651" />
          <polygon points="0,-44 -5,-8 0,0" fill="#9d741c" />
          <polygon points="0,44 5,8 0,0" fill="#66470a" />
          <polygon points="44,0 8,-5 0,0" fill="#886012" />
          <polygon points="-44,0 -8,5 0,0" fill="#4d3405" />
          <circle cx="0" cy="0" r="17" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="2" />
          <circle cx="0" cy="0" r="13" fill="none" stroke={`url(#${uid}-gold-d)`} strokeWidth="1.2" />
          <polygon points="0,-5 5,0 0,5 -5,0" fill={`url(#${uid}-gold-r)`} stroke="#ffffff" strokeWidth="0.9" />
        </g>

        {/* ── Filigrana de Esquina ── */}
        <g id={`${uid}-corn`}>
          <path d="M 0,0 C 20,4 42,16 52,38 C 56,48 48,58 38,56 C 28,54 28,38 18,24 C 12,16 4,6 0,0 Z" fill={`url(#${uid}-gold-p)`} />
          <path d="M 12,0 C 26,12 36,28 38,46" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.5" />
          <circle cx="44" cy="44" r="3.5" fill={`url(#${uid}-gold-r)`} stroke="#3d2a04" strokeWidth="0.8" />
          <circle cx="24" cy="18" r="2" fill="#fff9e6" />
        </g>
      </defs>

      {/* ═══ 1. BASE ═══ */}
      <rect x="0" y="0" width="1024" height="1536" rx="36" fill={`url(#${uid}-bg)`} mask={`url(#${uid}-mask)`} />
      <rect x="8" y="8" width="1008" height="1520" rx="30" fill="none" stroke="#000000" strokeWidth="6" opacity="0.6" mask={`url(#${uid}-mask)`} />

      {/* ═══ 2. MOLDURAS ═══ */}
      <rect x="22" y="22" width="980" height="1492" rx="24" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="4.5" />
      <rect x="32" y="32" width="960" height="1472" rx="16" fill="none" stroke={`url(#${uid}-gold-d)`} strokeWidth="1.8" />
      <rect x="36" y="36" width="952" height="1464" rx="14" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1" opacity="0.85" />

      {/* ═══ 3. FILIGRANA LATERAL ═══ */}
      <path d="M 27,240 L 27,680 M 27,780 L 27,1220" stroke={`url(#${uid}-gold-p)`} strokeWidth="2.5" />
      <path d="M 997,240 L 997,680 M 997,780 L 997,1220" stroke={`url(#${uid}-gold-p)`} strokeWidth="2.5" />
      <line x1="42" y1="260" x2="42" y2="1200" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.2" strokeDasharray="3,12" opacity="0.75" />
      <line x1="982" y1="260" x2="982" y2="1200" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.2" strokeDasharray="3,12" opacity="0.75" />

      {/* Filigranas de Esquina */}
      <g transform="translate(36, 36)"><use href={`#${uid}-corn`} /></g>
      <g transform="translate(988, 36) scale(-1, 1)"><use href={`#${uid}-corn`} /></g>
      <g transform="translate(36, 1500) scale(1, -1)"><use href={`#${uid}-corn`} /></g>
      <g transform="translate(988, 1500) scale(-1, -1)"><use href={`#${uid}-corn`} /></g>

      {/* Estrellas Cardinales */}
      <g transform="translate(512, 22) scale(0.68)"><use href={`#${uid}-star`} /></g>
      <g transform="translate(512, 1514) scale(0.68)"><use href={`#${uid}-star`} /></g>
      <g transform="translate(22, 730) scale(0.72)"><use href={`#${uid}-star`} /></g>
      <g transform="translate(1002, 730) scale(0.72)"><use href={`#${uid}-star`} /></g>

      {/* Estrellas de Esquina */}
      <g transform="translate(48, 48) scale(0.78)"><use href={`#${uid}-star`} /></g>
      <g transform="translate(976, 48) scale(0.78)"><use href={`#${uid}-star`} /></g>
      <g transform="translate(48, 1488) scale(0.78)"><use href={`#${uid}-star`} /></g>
      <g transform="translate(976, 1488) scale(0.78)"><use href={`#${uid}-star`} /></g>

      {/* ═══ 4. MEDALLÓN DE COSTE (General y Monster) ═══ */}
      {hasCost && (
        <g filter={`url(#${uid}-sh)`}>
          <circle cx="112" cy="116" r="82" fill="none" stroke={`url(#${uid}-gold-d)`} strokeWidth="1.2" strokeDasharray="4,6" opacity="0.65" />
          <circle cx="112" cy="116" r="74" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="7" />
          <circle cx="112" cy="116" r="70" fill="none" stroke={palette.darkRim} strokeWidth="1.5" />
          <circle cx="112" cy="116" r="66" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="2.5" />
          <circle cx="112" cy="42" r="4" fill="#fff4d4" stroke="#684c0c" strokeWidth="1" />
          <circle cx="186" cy="116" r="4" fill="#fff4d4" stroke="#684c0c" strokeWidth="1" />
          <circle cx="112" cy="190" r="4" fill="#fff4d4" stroke="#684c0c" strokeWidth="1" />
          <circle cx="38" cy="116" r="4" fill="#fff4d4" stroke="#684c0c" strokeWidth="1" />
          <circle cx="112" cy="116" r="63" fill={`url(#${uid}-pnl)`} />
          <circle cx="112" cy="116" r="63" fill={`url(#${uid}-ins)`} />
          <circle cx="112" cy="116" r="60" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="1" opacity="0.5" />
        </g>
      )}

      {/* ═══ 5. PLACA DE NOMBRE ═══ */}
      <g filter={`url(#${uid}-sh)`}>
        {isArcano ? (
          <>
            {/* Arcano: placa simétrica completa */}
            <path d="M 112,62 L 912,62 Q 934,62 944,78 L 944,136 Q 934,152 912,152 L 112,152 Q 90,152 80,136 L 80,78 Q 90,62 112,62 Z" fill={`url(#${uid}-gold-p)`} />
            <path d="M 116,66 L 908,66 Q 928,66 938,80 L 938,134 Q 928,148 908,148 L 116,148 Q 96,148 86,134 L 86,80 Q 96,66 116,66 Z" fill={palette.darkRim} />
            <path d="M 120,69 L 904,69 Q 924,69 934,82 L 934,132 Q 924,145 904,145 L 120,145 Q 100,145 90,132 L 90,82 Q 100,69 120,69 Z" fill={`url(#${uid}-pnl)`} />
            <path d="M 120,69 L 904,69 Q 924,69 934,82 L 934,132 Q 924,145 904,145 L 120,145 Q 100,145 90,132 L 90,82 Q 100,69 120,69 Z" fill={`url(#${uid}-ins)`} />
            <path d="M 124,74 L 900,74 L 926,107 L 900,140 L 124,140 L 98,107 Z" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.2" opacity="0.75" />
            {/* Mini estrellas de remate */}
            <g transform="translate(100, 107) scale(0.42)"><use href={`#${uid}-star`} /></g>
            <g transform="translate(924, 107) scale(0.42)"><use href={`#${uid}-star`} /></g>
          </>
        ) : (
          <>
            {/* General / Monster: placa con muesca izquierda */}
            <path d="M 198,62 L 872,62 Q 894,62 904,78 L 904,136 Q 894,152 872,152 L 198,152 Q 186,134 186,107 Q 186,80 198,62 Z" fill={`url(#${uid}-gold-p)`} />
            <path d="M 202,66 L 868,66 Q 888,66 898,80 L 898,134 Q 888,148 868,148 L 202,148 Q 192,132 192,107 Q 192,82 202,66 Z" fill={palette.darkRim} />
            <path d="M 205,69 L 865,69 Q 884,69 894,82 L 894,132 Q 884,145 865,145 L 205,145 Q 195,130 195,107 Q 195,84 205,69 Z" fill={`url(#${uid}-pnl)`} />
            <path d="M 205,69 L 865,69 Q 884,69 894,82 L 894,132 Q 884,145 865,145 L 205,145 Q 195,130 195,107 Q 195,84 205,69 Z" fill={`url(#${uid}-ins)`} />
            <path d="M 210,74 L 860,74 L 886,107 L 860,140 L 210,140 Z" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.2" opacity="0.65" />
          </>
        )}
      </g>

      {/* ═══ 6. VENTANA DE ARTE ═══ */}
      <g filter={`url(#${uid}-sh)`}>
        {hasCost ? (
          <>
            {/* General / Monster: ventana con muesca del medallón */}
            <path d="M 194,196 L 920,196 Q 934,196 934,210 L 934,1106 Q 934,1120 920,1120 L 104,1120 Q 90,1120 90,1106 L 90,270 Q 90,250 102,238 C 126,212 168,198 194,196 Z" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="6" />
            <path d="M 197,203 L 914,203 Q 926,203 926,215 L 926,1100 Q 926,1112 914,1112 L 110,1112 Q 98,1112 98,1100 L 98,274 C 134,228 172,206 197,203 Z" fill="none" stroke={`url(#${uid}-gold-d)`} strokeWidth="2.2" />
            <path d="M 200,208 L 910,208 L 921,219 L 921,1096 L 910,1107 L 114,1107 L 103,1096 L 103,278 C 138,234 175,212 200,208 Z" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.2" opacity="0.8" />
          </>
        ) : (
          <>
            {/* Arcano: ventana simétrica */}
            <rect x="90" y="194" width="844" height="916" rx="26" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="6" />
            <rect x="96" y="200" width="832" height="904" rx="20" fill="none" stroke={`url(#${uid}-gold-d)`} strokeWidth="2.2" />
            <rect x="100" y="204" width="824" height="896" rx="16" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.2" opacity="0.8" />
            {/* Florones en las esquinas de la ventana de arte */}
            <g transform="translate(102, 206) scale(0.6)"><use href={`#${uid}-corn`} /></g>
            <g transform="translate(922, 206) scale(-0.6, 0.6)"><use href={`#${uid}-corn`} /></g>
            <g transform="translate(102, 1098) scale(0.6, -0.6)"><use href={`#${uid}-corn`} /></g>
            <g transform="translate(922, 1098) scale(-0.6, -0.6)"><use href={`#${uid}-corn`} /></g>
          </>
        )}
      </g>

      {/* ═══ 7. CUADRO DE EFECTOS ═══ */}
      <g filter={`url(#${uid}-sh)`}>
        <rect x="56" y="1152" width="912" height="316" rx="20" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="5" />
        <rect x="62" y="1158" width="900" height="304" rx="16" fill={palette.darkRim} />
        <rect x="66" y="1162" width="892" height="296" rx="14" fill={`url(#${uid}-pnl)`} />
        <rect x="66" y="1162" width="892" height="296" rx="14" fill={`url(#${uid}-ins)`} />
        <rect x="74" y="1170" width="876" height="280" rx="10" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="1.5" opacity="0.85" />
        <rect x="80" y="1176" width="864" height="268" rx="8" fill="none" stroke={`url(#${uid}-gold-d)`} strokeWidth="1" opacity="0.65" />

        {/* Esquineros */}
        <path d="M 74,1194 L 74,1170 L 98,1170" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="3" />
        <circle cx="86" cy="1182" r="2.5" fill="#fff4d4" />
        <path d="M 950,1194 L 950,1170 L 926,1170" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="3" />
        <circle cx="938" cy="1182" r="2.5" fill="#fff4d4" />
        <path d="M 74,1426 L 74,1450 L 98,1450" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="3" />
        <circle cx="86" cy="1438" r="2.5" fill="#fff4d4" />
        <path d="M 950,1426 L 950,1450 L 926,1450" fill="none" stroke={`url(#${uid}-gold-p)`} strokeWidth="3" />
        <circle cx="938" cy="1438" r="2.5" fill="#fff4d4" />

        {/* Florón separador */}
        <g transform="translate(512, 1152) scale(0.55)"><use href={`#${uid}-star`} /></g>
      </g>

      {/* ═══ 8. FRANJA ATK/DEF (Solo Monstruo) ═══ */}
      {isMonster && (
        <g filter={`url(#${uid}-sh)`}>
          <rect x="690" y="1404" width="252" height="52" rx="10" fill={`url(#${uid}-gold-p)`} />
          <rect x="694" y="1408" width="244" height="44" rx="8" fill={palette.darkRim} />
          <rect x="698" y="1412" width="236" height="36" rx="6" fill={`url(#${uid}-pnl)`} />
          <rect x="698" y="1412" width="236" height="36" rx="6" fill={`url(#${uid}-ins)`} />
          <line x1="816" y1="1414" x2="816" y2="1446" stroke={`url(#${uid}-gold-p)`} strokeWidth="1.5" opacity="0.7" />
          <rect x="700" y="1414" width="232" height="32" rx="5" fill="none" stroke={`url(#${uid}-gold-b)`} strokeWidth="0.8" opacity="0.6" />
          <polygon points="700,1430 704,1426 708,1430 704,1434" fill={`url(#${uid}-gold-r)`} />
          <polygon points="928,1430 924,1426 920,1430 924,1434" fill={`url(#${uid}-gold-r)`} />
        </g>
      )}
    </svg>
  );
};
