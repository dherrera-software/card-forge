import { create } from "zustand";
import { CardData, CardType } from "@/lib/schema";
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
  cost: "7",
  atk: "3200",
  def: "2800",
  effect:
    "Cuando esta criatura entra en juego, destruye todas las cartas en juego con un coste de 3 o menor.\n\nUna vez por turno, puedes descartar 1 carta para anular un efecto enemigo.",
  art: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

interface CardStoreState {
  card: CardData;
  savedCards: CardData[];
  isLoaded: boolean;
  calibration: boolean;
  previewScale: number;

  // Acciones
  setCardType: (type: CardType) => void;
  updateField: <K extends keyof CardData>(field: K, value: CardData[K]) => void;
  updateArt: (updates: Partial<CardData["art"]>) => void;
  setArtFile: (file: File) => Promise<void>;
  clearArt: () => Promise<void>;
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
  isLoaded: false,
  calibration: false,
  previewScale: 0.42,

  setCardType: (type: CardType) => {
    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        type,
        // Limpiamos o inicializamos campos según el tipo
        cost: type === "arcano" ? undefined : (state.card.cost ?? "1"),
        atk: type === "monster" ? (state.card.atk ?? "1000") : undefined,
        def: type === "monster" ? (state.card.def ?? "1000") : undefined,
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

  updateArt: (updates) => {
    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        art: {
          ...state.card.art,
          ...updates,
        },
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  setArtFile: async (file: File) => {
    const prevImageId = get().card.art.imageId;
    if (prevImageId) {
      await deleteImageBlob(prevImageId).catch(() => {});
    }

    const imageId = `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await saveImageBlob(imageId, file);
    const objectUrl = URL.createObjectURL(file);

    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        art: {
          ...state.card.art,
          imageId,
          imageUrl: objectUrl,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
        },
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

  clearArt: async () => {
    const currentImageId = get().card.art.imageId;
    if (currentImageId) {
      await deleteImageBlob(currentImageId).catch(() => {});
    }

    set((state) => {
      const nextCard: CardData = {
        ...state.card,
        art: {
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
        },
        updatedAt: Date.now(),
      };
      debouncedSaveCurrent(nextCard);
      return { card: nextCard };
    });
  },

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
      cost: type !== "arcano" ? "1" : undefined,
      atk: type === "monster" ? "1000" : undefined,
      def: type === "monster" ? "1000" : undefined,
      effect: "Descripción del efecto...",
      art: {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
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
    if (cardToLoad.art.imageId) {
      const blob = await getImageBlob(cardToLoad.art.imageId);
      if (blob) {
        cardToLoad.art.imageUrl = URL.createObjectURL(blob);
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
