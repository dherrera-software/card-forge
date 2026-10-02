import { CardTemplate, CardType } from "./schema";

export const CARD_TEMPLATES: Record<CardType, CardTemplate> = {
  monster: {
    type: "monster",
    frameSrc: "/frames/monster.png",
    slots: {
      name:   { x: 20.0, y: 2.7,  w: 75.2, h: 5.7  },
      cost:   { x: 3.8,  y: 2.1,  w: 12.9, h: 8.6  },
      art:    { x: 7.0,  y: 9.1,  w: 86.2, h: 72.8 },
      // Recuadro de efectos: máximo ancho útil del interior del marco
      effect: { x: 3.5,  y: 81.8, w: 93.0, h: 14.5 },
      // ATK/DEF: esquina inferior derecha, suficiente ancho para 1-2 dígitos + etiquetas
      atkdef: { x: 56.0, y: 92.0, w: 40.0, h: 3.8  },
    },
  },
  general: {
    type: "general",
    frameSrc: "/frames/general.png",
    slots: {
      name:   { x: 20.0, y: 2.7,  w: 75.2, h: 5.7  },
      cost:   { x: 3.8,  y: 2.1,  w: 12.9, h: 8.6  },
      art:    { x: 7.0,  y: 9.1,  w: 86.2, h: 72.8 },
      effect: { x: 3.5,  y: 81.8, w: 93.0, h: 14.5 },
    },
  },
  arcano: {
    type: "arcano",
    frameSrc: "/frames/arcano.png",
    slots: {
      name:   { x: 7.6,  y: 2.7,  w: 85.0, h: 5.7  },
      art:    { x: 7.0,  y: 9.1,  w: 86.2, h: 72.8 },
      effect: { x: 3.5,  y: 81.8, w: 93.0, h: 14.5 },
    },
  },
};
