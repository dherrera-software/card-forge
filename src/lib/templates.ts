import { CardFrameColor, CardTemplate, CardType } from "./schema";

export interface ColorOption {
  id: CardFrameColor;
  label: string;
  badgeHex: string;
  borderHex: string;
  desc: string;
}

export const CARD_FRAME_COLORS: ColorOption[] = [
  { id: "red",    label: "Rojo",     badgeHex: "#eb4c2d", borderHex: "#ff7456", desc: "Fuego" },
  { id: "blue",   label: "Azul",     badgeHex: "#005ea7", borderHex: "#228be6", desc: "Agua" },
  { id: "green",  label: "Verde",    badgeHex: "#38ac30", borderHex: "#51cf66", desc: "Viento" },
  { id: "orange", label: "Naranja",  badgeHex: "#d58515", borderHex: "#ff922b", desc: "Tierra" },
  { id: "yellow", label: "Amarillo", badgeHex: "#fee600", borderHex: "#fff3bf", desc: "Electricidad" },
  { id: "cyan",   label: "Celeste",  badgeHex: "#22a2db", borderHex: "#66d9e8", desc: "Hielo" },
  { id: "black",  label: "Negro",    badgeHex: "#07363a", borderHex: "#20c997", desc: "Oscuridad" },
  { id: "white",  label: "Blanco",   badgeHex: "#e6e5e1", borderHex: "#ffffff", desc: "Luz" },
  { id: "gray",   label: "Gris",     badgeHex: "#828780", borderHex: "#ced4da", desc: "Token" },
];

export function getFrameSrc(color: CardFrameColor = "blue"): string {
  return `/frames/frame_${color}.png`;
}

export const CARD_TEMPLATES: Record<CardType, CardTemplate> = {
  monster: {
    type: "monster",
    frameSrc: "/frames/frame_monster_gray.svg",
    slots: {
      cost:   { x: 4.79, y: 3.45, w: 12.3, h: 8.2 },
      name:   { x: 19.34, y: 4.45, w: 68.0, h: 5.25 },
      art:    { x: 9.6,  y: 13.3, w: 80.8, h: 59.1 },
      effect: { x: 6.5,  y: 76.0, w: 87.0, h: 18.5 },
      atkdef: { x: 67.38, y: 91.4, w: 24.6, h: 3.39 },
    },
  },
  general: {
    type: "general",
    frameSrc: "/frames/frame_general_gray.svg",
    slots: {
      cost:   { x: 4.79, y: 3.45, w: 12.3, h: 8.2 },
      name:   { x: 19.34, y: 4.45, w: 68.0, h: 5.25 },
      art:    { x: 9.6,  y: 13.3, w: 80.8, h: 59.1 },
      effect: { x: 6.5,  y: 76.0, w: 87.0, h: 18.5 },
    },
  },
  arcano: {
    type: "arcano",
    frameSrc: "/frames/frame_arcano_gray.svg",
    slots: {
      name:   { x: 8.79, y: 4.45, w: 82.42, h: 5.25 },
      art:    { x: 9.6,  y: 13.3, w: 80.8, h: 59.1 },
      effect: { x: 6.5,  y: 76.0, w: 87.0, h: 18.5 },
    },
  },
};
