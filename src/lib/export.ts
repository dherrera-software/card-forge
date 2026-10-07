import { toPng, toJpeg } from "html-to-image";
import { CardData, CardDataSchema } from "./schema";

export type ImageFormat = "png" | "jpg";

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
 * Convierte una URL blob: a una data: URL embebida (base64).
 * Las blob: URLs son efímeras y no se pueden re-obtener desde un nodo clonado,
 * lo que causa "Failed to fetch" en html-to-image.
 */
function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  return fetch(blobUrl)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

/**
 * Antes de exportar, convierte todas las <img> con src blob: a data: URL.
 * Devuelve una función de limpieza que restaura las URLs originales.
 */
async function prepareBlobImages(
  node: HTMLElement
): Promise<() => void> {
  const images = Array.from(node.querySelectorAll("img"));
  const originals: { img: HTMLImageElement; src: string }[] = [];

  for (const img of images) {
    if (img.src.startsWith("blob:")) {
      originals.push({ img, src: img.src });
      try {
        const dataUrl = await blobUrlToDataUrl(img.src);
        img.src = dataUrl;
        // Esperar a que la imagen con la nueva src termine de cargar
        await new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        });
      } catch {
        // Si falla la conversión, dejar la URL original
      }
    }
  }

  return () => {
    for (const { img, src } of originals) {
      img.src = src;
    }
  };
}

/**
 * Exporta un nodo HTML de carta a imagen (PNG o JPG) y dispara la descarga
 */
export async function exportCardAsImage(
  node: HTMLElement,
  format: ImageFormat,
  cardName: string
): Promise<void> {
  await waitForAssets(node);

  // Convertir blob: URLs a data: URLs para evitar "Failed to fetch"
  const restoreBlobs = await prepareBlobImages(node);

  try {
    const baseFilename = sanitizeFilename(cardName);
    let dataUrl: string;

    const exportOptions = {
      width: 1024,
      height: 1536,
      pixelRatio: 1,
      cacheBust: false,    // No añadir timestamps a URLs (causa fallos de fetch)
      skipFonts: true,     // next/font ya inyecta las fuentes en el documento
    };

    if (format === "png") {
      dataUrl = await toPng(node, exportOptions);
    } else {
      // jpg
      dataUrl = await toJpeg(node, {
        ...exportOptions,
        quality: 0.95,
        backgroundColor: "#0c1017", // Fondo opaco para JPG
      });
    }

    // Descarga del archivo
    const link = document.createElement("a");
    link.download = `${baseFilename}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Restaurar blob: URLs originales para no inflar la memoria del DOM
    restoreBlobs();
  }
}

/**
 * Exporta los datos de la carta en formato JSON
 */
export function exportCardAsJson(card: CardData): void {
  const sanitizedCard: CardData = {
    ...card,
    background: {
      ...card.background,
      imageUrl: undefined, // No exportar URLs blob efímeras
    },
    character: {
      ...card.character,
      imageUrl: undefined,
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
