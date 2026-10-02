"use client";

import React from "react";
import { useCardStore } from "@/store/useCardStore";
import { FolderOpen, Trash2, X, Swords, Shield, Sparkles } from "lucide-react";
import { CardType } from "@/lib/schema";

interface CardListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardListModal: React.FC<CardListModalProps> = ({ isOpen, onClose }) => {
  const { savedCards, loadFromLibrary, deleteFromLibrary } = useCardStore();

  if (!isOpen) return null;

  const getTypeIcon = (type: CardType) => {
    switch (type) {
      case "monster":
        return <Swords className="w-3.5 h-3.5 text-amber-400" />;
      case "general":
        return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      case "arcano":
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0d1117] p-6 shadow-2xl text-[#f0e6cf]">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-[family-name:var(--font-cinzel)]">
              Colección de Cartas Guardadas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 max-h-[60vh] overflow-y-auto space-y-2">
          {savedCards.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No tienes cartas guardadas en esta sesión todavía. Pulsa &quot;Guardar&quot; en el panel de exportación para archivar cartas.
            </p>
          ) : (
            savedCards.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:border-amber-500/40 hover:bg-zinc-850 transition-all"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    loadFromLibrary(c.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getTypeIcon(c.type)}
                    <span className="font-bold text-sm text-amber-200">
                      {c.name || "Sin nombre"}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                      • {c.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-[family-name:var(--font-lora)]">
                    {c.effect || "Sin efecto"}
                  </p>
                </div>

                <div className="flex items-center gap-2 pl-3">
                  <button
                    onClick={() => {
                      loadFromLibrary(c.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => deleteFromLibrary(c.id)}
                    title="Eliminar de colección"
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
