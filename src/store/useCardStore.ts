import { create } from "zustand";
import { CardData, CardFrameColor, CardType, ImageLayer } from "@/lib/schema";
import {
  saveCurrentCard,
  loadCurrentCard,
  saveCardsList,
  loadCardsList,
  saveImageBlob,
  deleteImageBlob,
  getImageBlob,
} from "@/lib/storage";

const DEFAULT_CARD: CardData = {
  id: "card-default",
  type: "monster",
  name: "DRAGÓN DEL ABISMO",
  frameColor: "blue",
  cost: "5",
  atk: "8",
  def: "6",
  effect:
    "Cuando esta criatura entra en juego, destruye todas las cartas en juego con un coste de 3 o menor.\n\nUna vez por turno, puedes descartar 1 carta para anular un efecto enemigo.",
  background: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    fitMode: "contain",
    clipToFrame: true,
  },
  character: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    fitMode: "contain",
    clipToFrame: true,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export type ArtLayerType = "background" | "character";

interface CardStoreState {
  card: CardData;
  savedCards: CardData[];
  isLoaded: boolean;
  calibration: boolean;
  previewScale: number;

  // Acciones de capas de imagen
  updateLayer: (layer: ArtLayerType, updates: Partial<ImageLayer>) => void;
  setLayerFile: (layer: ArtLayerType, file: File) => Promise<void>;
  clearLayer: (layer: ArtLayerType) => Promise<void>;

  // Compatibilidad hacia atrás
  updateArt: (updates: Partial<ImageLayer>) => void;
  setArtFile: (file: File) => Promise<void>;
  clearArt: () => Promise<void>;

  // Acciones generales
  setCardType: (type: CardType) => void;
  setFrameColor: (color: CardFrameColor) => void;
  updateField: <K extends keyof CardData>(field: K, value: CardData[K]) => void;
  setCalibration: (enabled: boolean) => void;
  setPreviewScale: (scale: number) => void;
  importCardData: (data: CardData) => void;
  resetCard: (type?: CardType) => void;
  loadSavedData: () => Promise<void>;
  saveToLibrary: () => Promise<void>;
  loadFromLibrary: (id: string) => Promise<void>;
  deleteFromLibrary: (id: string) => Promise<void>;
}

let saveTimeout: NodeJS.Timeout | null = null;
const debouncedSaveCurrent = (card: CardData) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCurrentCard(card).catch((err) =>
      console.error("Auto-save current card failed:", err)
    );
  }, 400);
};

export const useCardStore = create<CardStoreState>((set, get) => ({
  card: DEFAULT_CARD,
  savedCards: [],
  isLoaded: true,
  calibration: false,
  previewScale: 0.42,

  setCardType: (type: CardType) => {
    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        type,
        // Limpiamos o inicializamos campos según el tipo
        cost: type === "arcano" ? undefined : (state.card.cost ?? "1"),
        atk: type === "monster" ? (state.card.atk ?? "5") : undefined,
        def: type === "monster" ? (state.card.def ?? "5") : undefined,
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  setFrameColor: (color: CardFrameColor) => {
    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        frameColor: color,
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  updateField: (field, value) => {
    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        [field]: value,
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  updateLayer: (layer, updates) => {
    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        [layer]: {
          ...state.card[layer],
          ...updates,
        },
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  setLayerFile: async (layer, file) => {
    const prevImageId = get().card[layer]?.imageId;
    if (prevImageId) {
      await deleteImageBlob(prevImageId).catch(() => {});
    }

    const imageId = `${layer}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await saveImageBlob(imageId, file);
    const objectUrl = URL.createObjectURL(file);

    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        [layer]: {
          ...state.card[layer],
          imageId,
          imageUrl: objectUrl,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          fitMode: state.card[layer]?.fitMode || "contain",
          clipToFrame: state.card[layer]?.clipToFrame ?? true,
        },
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  clearLayer: async (layer) => {
    const currentImageId = get().card[layer]?.imageId;
    if (currentImageId) {
      await deleteImageBlob(currentImageId).catch(() => {});
    }

    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        [layer]: {
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          fitMode: "contain",
          clipToFrame: true,
        },
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  // Métodos legados delegados a 'character'
  updateArt: (updates) => get().updateLayer("character", updates),
  setArtFile: async (file) => get().setLayerFile("character", file),
  clearArt: async () => get().clearLayer("character"),

  setCalibration: (enabled) => set({ calibration: enabled }),

  setPreviewScale: (scale) => set({ previewScale: scale }),

  importCardData: (data) => {
    set({
      card: {
        ...data,
        updatedAt: Date.now(),
      },
    });
    debouncedSaveCurrent(data);
  },

  resetCard: (type = "monster") => {
    const newCard: CardData = {
      id: `card_${Date.now()}`,
      type,
      name: "NUEVA CARTA",
      frameColor: get().card.frameColor || "blue",
      cost: type !== "arcano" ? "1" : undefined,
      atk: type === "monster" ? "5" : undefined,
      def: type === "monster" ? "5" : undefined,
      effect: "Descripción del efecto...",
      background: {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        fitMode: "contain",
        clipToFrame: true,
      },
      character: {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        fitMode: "contain",
        clipToFrame: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ card: newCard });
    debouncedSaveCurrent(newCard);
  },

  loadSavedData: async () => {
    try {
      const [currentCard, library] = await Promise.all([
        loadCurrentCard(),
        loadCardsList(),
      ]);

      set({
        card: currentCard || DEFAULT_CARD,
        savedCards: library,
        isLoaded: true,
      });
    } catch (e) {
      console.error("Error initializing store from IndexedDB:", e);
      set({ isLoaded: true });
    }
  },

  saveToLibrary: async () => {
    const current = get().card;
    const library = [...get().savedCards];
    const index = library.findIndex((c) => c.id === current.id);

    if (index >= 0) {
      library[index] = current;
    } else {
      library.push(current);
    }

    set({ savedCards: library });
    await saveCardsList(library);
  },

  loadFromLibrary: async (id: string) => {
    const found = get().savedCards.find((c) => c.id === id);
    if (!found) return;

    const cardToLoad: CardData = { ...found };

    // Restaurar Blob de fondo
    if (cardToLoad.background?.imageId) {
      const blob = await getImageBlob(cardToLoad.background.imageId);
      if (blob) {
        cardToLoad.background.imageUrl = URL.createObjectURL(blob);
      }
    }

    // Restaurar Blob de personaje
    if (cardToLoad.character?.imageId) {
      const blob = await getImageBlob(cardToLoad.character.imageId);
      if (blob) {
        cardToLoad.character.imageUrl = URL.createObjectURL(blob);
      }
    }

    set({ card: cardToLoad });
    debouncedSaveCurrent(cardToLoad);
  },

  deleteFromLibrary: async (id: string) => {
    const library = get().savedCards.filter((c) => c.id !== id);
    set({ savedCards: library });
    await saveCardsList(library);
  },
}));
