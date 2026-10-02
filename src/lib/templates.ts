import { CardTemplate, CardType } from "./schema";

export const CARD_TEMPLATES: Record<CardType, CardTemplate> = {
  monster: {
    type: "monster",
    frameSrc: "/frames/monster.png",
    slots: {
      name:   { x: 17.5, y: 2.2,  w: 77.7, h: 6.2  },
      cost:   { x: 4.8,  y: 2.2,  w: 11.5, h: 6.2  },
      art:    { x: 4.8,  y: 9.2,  w: 90.4, h: 70.8 },
      effect: { x: 4.8,  y: 81.0, w: 90.4, h: 15.6 },
      atkdef: { x: 67.5, y: 91.0, w: 26.5, h: 4.6  },
    },
  },
  general: {
    type: "general",
    frameSrc: "/frames/general.png",
    slots: {
      name:   { x: 17.5, y: 2.2,  w: 77.7, h: 6.2  },
      cost:   { x: 4.8,  y: 2.2,  w: 11.5, h: 6.2  },
      art:    { x: 4.8,  y: 9.2,  w: 90.4, h: 70.8 },
      effect: { x: 4.8,  y: 81.0, w: 90.4, h: 15.6 },
    },
  },
  arcano: {
    type: "arcano",
    frameSrc: "/frames/arcano.png",
    slots: {
      name:   { x: 4.8,  y: 2.2,  w: 90.4, h: 6.2  },
      art:    { x: 4.8,  y: 9.2,  w: 90.4, h: 70.8 },
      effect: { x: 4.8,  y: 81.0, w: 90.4, h: 15.6 },
    },
  },
};
