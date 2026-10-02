import { z } from "zod";

export const CardTypeSchema = z.enum(["monster", "general", "arcano"]);
export type CardType = z.infer<typeof CardTypeSchema>;

export const ArtDataSchema = z.object({
  imageId: z.string().optional(),
  imageUrl: z.string().optional(), // Vista previa local (ObjectURL o Base64)
  zoom: z.number().default(1),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
});
export type ArtData = z.infer<typeof ArtDataSchema>;

export const CardDataSchema = z.object({
  id: z.string(),
  type: CardTypeSchema,
  name: z.string(),
  cost: z.string().max(3).optional(),
  atk: z.string().max(5).optional(),
  def: z.string().max(5).optional(),
  effect: z.string(),
  art: ArtDataSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type CardData = z.infer<typeof CardDataSchema>;

export interface Rect {
  x: number; // en % del marco (0 a 100)
  y: number; // en % del marco (0 a 100)
  w: number; // en % del marco (0 a 100)
  h: number; // en % del marco (0 a 100)
}

export interface CardTemplate {
  type: CardType;
  frameSrc: string; // p. ej. /frames/monster.png
  slots: {
    name: Rect;
    art: Rect;
    effect: Rect;
    cost?: Rect;    // ausente en arcano
    atkdef?: Rect;  // solo en monster
  };
}
