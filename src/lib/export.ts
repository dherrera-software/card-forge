import { toPng, toJpeg, toCanvas } from "html-to-image";
import { CardData, CardDataSchema } from "./schema";

export type ImageFormat = "png" | "jpg" | "webp";

/**
 * Sanea el nombre de la carta para usarlo como nombre de archivo
 */
export function sanitizeFilename(name: string): string {
  if (!name.trim()) return "carta";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita tildes
    .replace(/[^a-z0-9_-]/g, "_")    // Reemplaza espacios y símbolos por _
    .replace(/_+/g, "_")             // Evita múltiples guiones bajos
    .replace(/^_|_$/g, "");          // Quita guiones iniciales o finales
}

/**
 * Espera a que las fuentes y las imágenes estén cargadas en el documento
 */
async function waitForAssets(node: HTMLElement): Promise<void> {
  // Esperar a document.fonts.ready
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  // Esperar a que todas las imágenes dentro del nodo hayan terminado de cargar
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

/**
 * Exporta un nodo HTML de carta a imagen (PNG, JPG o WEBP) y dispara la descarga
 */
export async function exportCardAsImage(
  node: HTMLElement,
  format: ImageFormat,
  cardName: string
): Promise<void> {
  await waitForAssets(node);

  const baseFilename = sanitizeFilename(cardName);
  let dataUrl: string;

  const exportOptions = {
    width: 1024,
    height: 1536,
    pixelRatio: 1,
    cacheBust: true,
  };

  if (format === "png") {
    dataUrl = await toPng(node, exportOptions);
  } else if (format === "jpg") {
    dataUrl = await toJpeg(node, {
      ...exportOptions,
      quality: 0.95,
      backgroundColor: "#0c1017", // Fondo opaco para JPG
    });
  } else {
    // webp
    const canvas = await toCanvas(node, exportOptions);
    dataUrl = canvas.toDataURL("image/webp", 0.95);
  }

  // Descarga del archivo
  const link = document.createElement("a");
  link.download = `${baseFilename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta los datos de la carta en formato JSON
 */
export function exportCardAsJson(card: CardData): void {
  const sanitizedCard: CardData = {
    ...card,
    art: {
      ...card.art,
      imageUrl: undefined, // No exportar URLs blob efímeras
    },
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(sanitizedCard, null, 2)
  )}`;
  const filename = `${sanitizeFilename(card.name)}.json`;

  const link = document.createElement("a");
  link.download = filename;
  link.href = jsonString;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Importa y valida los datos de una carta desde un archivo JSON
 */
export async function importCardFromJson(file: File): Promise<CardData> {
  const text = await file.text();
  const raw = JSON.parse(text);
  const validated = CardDataSchema.parse(raw);
  return validated;
}
