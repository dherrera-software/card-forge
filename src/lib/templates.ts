import { CardTemplate, CardType } from "./schema";

export const CARD_TEMPLATES: Record<CardType, CardTemplate> = {
  monster: {
    type: "monster",
    frameSrc: "/frames/monster.png",
    slots: {
      name: { x: 20.0, y: 2.7, w: 75.2, h: 5.7 },
      cost: { x: 3.8, y: 2.1, w: 12.9, h: 8.6 },
      art: { x: 7.0, y: 9.1, w: 86.2, h: 72.8 },
      effect: { x: 7.6, y: 83.0, w: 85.0, h: 12.7 },
      atkdef: { x: 67.4, y: 92.3, w: 23.4, h: 2.9 },
    },
  },
  general: {
    type: "general",
    frameSrc: "/frames/general.png",
    slots: {
      name: { x: 20.0, y: 2.7, w: 75.2, h: 5.7 },
      cost: { x: 3.8, y: 2.1, w: 12.9, h: 8.6 },
      art: { x: 7.0, y: 9.1, w: 86.2, h: 72.8 },
      effect: { x: 7.6, y: 83.0, w: 85.0, h: 12.7 },
    },
  },
  arcano: {
    type: "arcano",
    frameSrc: "/frames/arcano.png",
    slots: {
      // En arcano no hay casilla de coste a la izquierda
      name: { x: 7.6, y: 2.7, w: 85.0, h: 5.7 },
      art: { x: 7.0, y: 9.1, w: 86.2, h: 72.8 },
      effect: { x: 7.6, y: 83.0, w: 85.0, h: 12.7 },
    },
  },
};
