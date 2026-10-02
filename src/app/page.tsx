"use client";

import React, { useState } from "react";
import { Card } from "@/components/card/Card";
import { CardData, CardType } from "@/lib/schema";

const SAMPLE_CARDS: Record<CardType, CardData> = {
  monster: {
    id: "sample-monster",
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
  },
  general: {
    id: "sample-general",
    type: "general",
    name: "RELIQUIA DE LOS TIEMPOS",
    cost: "4",
    effect:
      "Roba 2 cartas al comienzo de tu fase principal.\nSi controlas una carta de tipo Arcano, roba 1 carta adicional.",
    art: {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  arcano: {
    id: "sample-arcano",
    type: "arcano",
    name: "EL JUICIO CELESTIAL",
    effect:
      "Elige un jugador. Ese jugador destierra la mitad de las cartas de su cementerio boca abajo.\nNo se puede responder a este efecto.",
    art: {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

export default function HomePage() {
  const [selectedType, setSelectedType] = useState<CardType>("monster");
  const [calibration, setCalibration] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.42);

  const card = SAMPLE_CARDS[selectedType];

  return (
    <main className="min-h-screen flex flex-col items-center p-6 bg-[#0a0d14] text-[#f0e6cf]">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-amber-900/30 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-amber-300 drop-shadow-sm">
            Card Forge
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Fase 1: Renderizado base a 1024×1536 px con plantillas calibrables
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
          <div className="flex rounded-lg overflow-hidden border border-zinc-700">
            {(["monster", "general", "arcano"] as CardType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedType === t
                    ? "bg-amber-500 text-black font-bold"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {t === "monster" ? "Monstruo" : t === "general" ? "General" : "Arcano"}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-750">
            <input
              type="checkbox"
              checked={calibration}
              onChange={(e) => setCalibration(e.target.checked)}
              className="accent-amber-400 rounded"
            />
            <span>Modo Calibración</span>
          </label>

          <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
            <span>Escala:</span>
            <input
              type="range"
              min={0.25}
              max={0.65}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-20 accent-amber-400"
            />
            <span className="font-mono">{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </header>

      {/* Preview Container */}
      <div className="flex flex-col items-center justify-center w-full">
        <div
          className="relative rounded-2xl shadow-2xl shadow-black/80 overflow-hidden border border-amber-900/40"
          style={{
            width: `${1024 * scale}px`,
            height: `${1536 * scale}px`,
          }}
        >
          <div
            className="origin-top-left"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Card card={card} calibration={calibration} />
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-4 text-center">
          Renderizado en vivo con resolución fija 1024×1536 px • Escalado visual CSS al{" "}
          {Math.round(scale * 100)}%
        </p>
      </div>
    </main>
  );
}
