import { CardFrameColor, CardTemplate, CardType } from "./schema";

export interface ColorOption {
  id: CardFrameColor;
  label: string;
  badgeHex: string;
  borderHex: string;
  desc: string;
}

export const CARD_FRAME_COLORS: ColorOption[] = [
  { id: "blue",   label: "Azul",     badgeHex: "#1e3a8a", borderHex: "#3b82f6", desc: "Zafiro Celestial" },
  { id: "red",    label: "Rojo",     badgeHex: "#7f1d1d", borderHex: "#ef4444", desc: "Rubí Carmesí" },
  { id: "yellow", label: "Amarillo", badgeHex: "#78350f", borderHex: "#eab308", desc: "Ámbar Solar" },
  { id: "orange", label: "Naranja",  badgeHex: "#7c2d12", borderHex: "#f97316", desc: "Fuego & Brasa" },
  { id: "green",  label: "Verde",    badgeHex: "#14532d", borderHex: "#22c55e", desc: "Esmeralda Mística" },
  { id: "cyan",   label: "Celeste",  badgeHex: "#164e63", borderHex: "#06b6d4", desc: "Éter Astral" },
  { id: "black",  label: "Negro",    badgeHex: "#09090b", borderHex: "#52525b", desc: "Obsidiana Abisal" },
  { id: "white",  label: "Blanco",   badgeHex: "#e4e4e7", borderHex: "#ffffff", desc: "Alabastro Sagrado" },
  { id: "gray",   label: "Gris",     badgeHex: "#27272a", borderHex: "#a1a1aa", desc: "Tokens & Neutral" },
];

export function getFrameSrc(color: CardFrameColor = "blue"): string {
  return `/frames/frame_${color}.png`;
}

export const CARD_TEMPLATES: Record<CardType, CardTemplate> = {
  monster: {
    type: "monster",
    frameSrc: "/frames/frame_blue.png",
    slots: {
      cost:   { x: 3.4,  y: 2.2,  w: 13.0, h: 8.6  },
      name:   { x: 19.8, y: 3.2,  w: 66.8, h: 6.2  },
      art:    { x: 9.6,  y: 12.2, w: 80.8, h: 60.8 },
      effect: { x: 5.6,  y: 75.8, w: 88.8, h: 19.0 },
      atkdef: { x: 67.0, y: 89.4, w: 26.5, h: 4.8  },
    },
  },
  general: {
    type: "general",
    frameSrc: "/frames/frame_blue.png",
    slots: {
      cost:   { x: 3.4,  y: 2.2,  w: 13.0, h: 8.6  },
      name:   { x: 19.8, y: 3.2,  w: 66.8, h: 6.2  },
      art:    { x: 9.6,  y: 12.2, w: 80.8, h: 60.8 },
      effect: { x: 5.6,  y: 75.8, w: 88.8, h: 19.0 },
    },
  },
  arcano: {
    type: "arcano",
    frameSrc: "/frames/frame_blue.png",
    slots: {
      name:   { x: 19.8, y: 3.2,  w: 66.8, h: 6.2  },
      art:    { x: 9.6,  y: 12.2, w: 80.8, h: 60.8 },
      effect: { x: 5.6,  y: 75.8, w: 88.8, h: 19.0 },
    },
  },
};
