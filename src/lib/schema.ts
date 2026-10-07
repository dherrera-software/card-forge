import { z } from "zod";

export const CardTypeSchema = z.preprocess((val) => {
  if (val === "evento") return "general";
  if (val === "lider") return "arcano";
  return val;
}, z.enum(["monster", "general", "arcano"]));
export type CardType = z.infer<typeof CardTypeSchema>;

export const CardFrameColorSchema = z.enum([
  "blue",
  "red",
  "yellow",
  "orange",
  "green",
  "cyan",
  "black",
  "white",
  "gray",
]);
export type CardFrameColor = z.infer<typeof CardFrameColorSchema>;

export const ImageFitModeSchema = z.enum(["contain", "cover", "fill"]);
export type ImageFitMode = z.infer<typeof ImageFitModeSchema>;

export const ImageLayerSchema = z.object({
  imageId: z.string().optional(),
  imageUrl: z.string().optional(), // Vista previa local (ObjectURL o Base64)
  zoom: z.number().default(1),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  fitMode: ImageFitModeSchema.default("contain"),
  clipToFrame: z.boolean().default(true),
});
export type ImageLayer = z.infer<typeof ImageLayerSchema>;

// Compatibilidad hacia atrás con tipo legado ArtData
export const ArtDataSchema = ImageLayerSchema;
export type ArtData = ImageLayer;

const RawCardDataSchema = z.object({
  id: z.string(),
  type: CardTypeSchema,
  name: z.string(),
  frameColor: CardFrameColorSchema.default("blue"),
  cost: z.string().max(3).optional(),
  atk: z.string().max(5).optional(),
  def: z.string().max(5).optional(),
  effect: z.string(),
  background: ImageLayerSchema.default({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    fitMode: "contain",
    clipToFrame: true,
  }),
  character: ImageLayerSchema.default({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    fitMode: "contain",
    clipToFrame: true,
  }),
  // Opcional para tolerar datos legados
  art: ImageLayerSchema.optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const CardDataSchema = z.preprocess((val) => {
  if (typeof val === "object" && val !== null) {
    const obj = { ...(val as Record<string, unknown>) };
    // Migración de datos legados donde solo existía 'art'
    if (obj.art && typeof obj.art === "object" && !obj.background && !obj.character) {
      const legacyArt = obj.art as Record<string, unknown>;
      obj.background = {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        fitMode: "cover",
      };
      obj.character = {
        imageId: legacyArt.imageId,
        imageUrl: legacyArt.imageUrl,
        zoom: typeof legacyArt.zoom === "number" ? legacyArt.zoom : 1,
        offsetX: typeof legacyArt.offsetX === "number" ? legacyArt.offsetX : 0,
        offsetY: typeof legacyArt.offsetY === "number" ? legacyArt.offsetY : 0,
        fitMode: "contain",
      };
    }
    return obj;
  }
  return val;
}, RawCardDataSchema);

export type CardData = z.infer<typeof RawCardDataSchema>;

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
