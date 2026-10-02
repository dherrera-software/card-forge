import { CardTemplate, CardType } from "./schema";

/**
 * NOTA: con el rediseño de Card.tsx basado en CSS Grid,
 * los slots name/effect/atkdef ya no se usan como posición absoluta.
 * Solo se mantienen art (todavía posicional) y frameSrc.
 * Los valores numéricos sirven únicamente para el modo calibración (CardSlot).
 */
export const CARD_TEMPLATES: Record<CardType, CardTemplate> = {
  monster: {
    type: "monster",
    frameSrc: "/frames/monster.png",
    slots: {
      name:   { x: 14.0, y: 1.5,  w: 82.5, h: 7.5  },
      cost:   { x: 2.0,  y: 1.5,  w: 12.0, h: 7.5  },
      art:    { x: 3.5,  y: 9.0,  w: 93.0, h: 72.0 },
      effect: { x: 3.5,  y: 81.0, w: 93.0, h: 11.5 },
      atkdef: { x: 3.5,  y: 92.5, w: 93.0, h: 5.0  },
    },
  },
  general: {
    type: "general",
    frameSrc: "/frames/general.png",
    slots: {
      name:   { x: 14.0, y: 1.5, w: 82.5, h: 7.5  },
      cost:   { x: 2.0,  y: 1.5, w: 12.0, h: 7.5  },
      art:    { x: 3.5,  y: 9.0, w: 93.0, h: 72.0 },
      effect: { x: 3.5,  y: 81.0, w: 93.0, h: 16.0 },
    },
  },
  arcano: {
    type: "arcano",
    frameSrc: "/frames/arcano.png",
    slots: {
      name:   { x: 3.5,  y: 1.5, w: 93.0, h: 7.5  },
      art:    { x: 3.5,  y: 9.0, w: 93.0, h: 72.0 },
      effect: { x: 3.5,  y: 81.0, w: 93.0, h: 16.0 },
    },
  },
};
