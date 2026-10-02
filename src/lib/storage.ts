import { get, set, del } from "idb-keyval";
import { CardData, CardDataSchema } from "./schema";

const CURRENT_CARD_KEY = "card_forge_current_card";
const CARDS_LIST_KEY = "card_forge_cards_list";
const IMAGE_PREFIX = "card_forge_img_";

/**
 * Guarda el Blob de una imagen en IndexedDB
 */
export async function saveImageBlob(id: string, blob: Blob): Promise<void> {
  await set(`${IMAGE_PREFIX}${id}`, blob);
}

/**
 * Recupera el Blob de una imagen desde IndexedDB
 */
export async function getImageBlob(id: string): Promise<Blob | undefined> {
  return await get<Blob>(`${IMAGE_PREFIX}${id}`);
}

/**
 * Elimina el Blob de una imagen de IndexedDB
 */
export async function deleteImageBlob(id: string): Promise<void> {
  await del(`${IMAGE_PREFIX}${id}`);
}

/**
 * Guarda los datos de la carta en edición actual
 */
export async function saveCurrentCard(card: CardData): Promise<void> {
  // Evitamos guardar imageUrl efímera (blob: o data:) en la metadata persistida
  const cardToSave: CardData = {
    ...card,
    art: {
      ...card.art,
      imageUrl: undefined,
    },
    updatedAt: Date.now(),
  };
  await set(CURRENT_CARD_KEY, cardToSave);
}

/**
 * Carga los datos de la carta en edición actual y reconstituye la imagen si existe
 */
export async function loadCurrentCard(): Promise<CardData | null> {
  try {
    const raw = await get<unknown>(CURRENT_CARD_KEY);
    if (!raw) return null;

    const parsed = CardDataSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn("Invalid card data in IndexedDB, resetting", parsed.error);
      return null;
    }

    const card = parsed.data;

    // Sanitizar stats heredados con más de 2 cifras (datos cacheados de versión anterior)
    const sanitizeStat = (val: string | undefined): string | undefined => {
      if (!val) return val;
      // Permitir "?" u otros strings cortos. Solo truncar si son números de > 2 dígitos
      const trimmed = val.trim();
      if (/^\d{3,}$/.test(trimmed)) return trimmed.slice(0, 2);
      return trimmed;
    };
    card.atk = sanitizeStat(card.atk);
    card.def = sanitizeStat(card.def);

    if (card.art.imageId) {
      const blob = await getImageBlob(card.art.imageId);
      if (blob) {
        card.art.imageUrl = URL.createObjectURL(blob);
      }
    }
    return card;
  } catch (error) {
    console.error("Error loading current card from IndexedDB:", error);
    return null;
  }
}

/**
 * Guarda la lista de cartas creadas
 */
export async function saveCardsList(cards: CardData[]): Promise<void> {
  const sanitized = cards.map((c) => ({
    ...c,
    art: {
      ...c.art,
      imageUrl: undefined,
    },
  }));
  await set(CARDS_LIST_KEY, sanitized);
}

/**
 * Carga la lista de cartas creadas
 */
export async function loadCardsList(): Promise<CardData[]> {
  try {
    const raw = await get<unknown[]>(CARDS_LIST_KEY);
    if (!Array.isArray(raw)) return [];

    const validCards: CardData[] = [];
    for (const item of raw) {
      const parsed = CardDataSchema.safeParse(item);
      if (parsed.success) {
        validCards.push(parsed.data);
      }
    }
    return validCards;
  } catch (error) {
    console.error("Error loading cards list from IndexedDB:", error);
    return [];
  }
}
