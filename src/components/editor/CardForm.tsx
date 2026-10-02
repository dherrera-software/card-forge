"use client";

import React from "react";
import { useCardStore } from "@/store/useCardStore";
import { CardType } from "@/lib/schema";
import { ArtAdjuster } from "./ArtAdjuster";
import { Shield, Sparkles, Swords, RefreshCw } from "lucide-react";

export const CardForm: React.FC = () => {
  const { card, setCardType, updateField, resetCard } = useCardStore();

  const isMonster = card.type === "monster";
  const isArcano = card.type === "arcano";
  const showCost = !isArcano;
  const showAtkDef = isMonster;

  const cardTypes: { type: CardType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: "monster",
      label: "Monstruo",
      icon: <Swords className="w-4 h-4 text-amber-400" />,
      desc: "Nombre, Coste, ATK/DEF y Efecto",
    },
    {
      type: "general",
      label: "General",
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
      desc: "Nombre, Coste y Efecto",
    },
    {
      type: "arcano",
      label: "Arcano",
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      desc: "Nombre y Efecto (sin coste ni ATK/DEF)",
    },
  ];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 text-[#f0e6cf]"
    >
      {/* Selector de Tipo de Carta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-amber-300">
            Tipo de Carta
          </label>
          <button
            type="button"
            onClick={() => resetCard(card.type)}
            className="text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            title="Reiniciar campos"
          >
            <RefreshCw className="w-3 h-3" /> Limpiar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {cardTypes.map(({ type, label, icon }) => {
            const isSelected = card.type === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setCardType(type)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="mb-1.5">{icon}</div>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nombre y Coste */}
      <div className="space-y-4">
        <div className="flex gap-3">
          {/* Nombre */}
          <div className="flex-1 space-y-1.5">
            <label htmlFor="card-name" className="text-xs font-medium text-zinc-300">
              Nombre de la carta
            </label>
            <input
              id="card-name"
              type="text"
              value={card.name}
              onChange={(e) => updateField("name", e.target.value.toUpperCase())}
              placeholder="Ej. DRAGÓN DEL ABISMO"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-[#f0e6cf] font-[family-name:var(--font-cinzel)] font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-zinc-600"
            />
          </div>

          {/* Coste (Oculto en Arcano) */}
          {showCost && (
            <div className="w-24 space-y-1.5 animate-fadeIn">
              <label htmlFor="card-cost" className="text-xs font-medium text-zinc-300">
                Coste
              </label>
              <input
                id="card-cost"
                type="text"
                maxLength={3}
                value={card.cost ?? ""}
                onChange={(e) => updateField("cost", e.target.value)}
                placeholder="0-99"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-center text-[#f0e6cf] font-[family-name:var(--font-cinzel)] font-black focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:font-sans placeholder:text-zinc-600"
              />
            </div>
          )}
        </div>

        {/* ATK / DEF (Solo en Monstruo) */}
        {showAtkDef && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 animate-fadeIn">
            <div className="space-y-1.5">
              <label htmlFor="card-atk" className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                <span>ATK (Ataque)</span>
              </label>
              <input
                id="card-atk"
                type="text"
                maxLength={5}
                value={card.atk ?? ""}
                onChange={(e) => updateField("atk", e.target.value)}
                placeholder="Ej. 3000 o ?"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-[#f0e6cf] font-[family-name:var(--font-cinzel)] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="card-def" className="text-xs font-medium text-blue-400 flex items-center gap-1.5">
                <span>DEF (Defensa)</span>
              </label>
              <input
                id="card-def"
                type="text"
                maxLength={5}
                value={card.def ?? ""}
                onChange={(e) => updateField("def", e.target.value)}
                placeholder="Ej. 2500 o ?"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-[#f0e6cf] font-[family-name:var(--font-cinzel)] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Efecto */}
        <div className="space-y-1.5">
          <label htmlFor="card-effect" className="text-xs font-medium text-zinc-300 flex justify-between">
            <span>Efecto / Descripción</span>
            <span className="text-[11px] text-zinc-500 font-normal">Admite saltos de línea</span>
          </label>
          <textarea
            id="card-effect"
            rows={4}
            value={card.effect}
            onChange={(e) => updateField("effect", e.target.value)}
            placeholder="Escribe el efecto de la carta aquí..."
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-sm text-[#f0e6cf] font-[family-name:var(--font-lora)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-zinc-600 resize-y"
          />
        </div>
      </div>

      {/* Ajuste de Ilustración */}
      <ArtAdjuster />
    </form>
  );
};
