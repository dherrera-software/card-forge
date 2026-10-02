"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCardStore } from "@/store/useCardStore";
import { Card } from "@/components/card/Card";
import { CardForm } from "@/components/editor/CardForm";
import { ExportPanel } from "@/components/editor/ExportPanel";
import { CardListModal } from "@/components/editor/CardListModal";
import { Sparkles, Sliders, FolderOpen, Eye } from "lucide-react";

export default function HomePage() {
  const {
    card,
    isLoaded,
    calibration,
    setCalibration,
    previewScale,
    setPreviewScale,
    loadSavedData,
    savedCards,
  } = useCardStore();

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // Ajuste automático de escala inicial para pantallas de escritorio
  useEffect(() => {
    if (typeof window !== "undefined") {
      const w = window.innerWidth;
      if (w < 768) {
        // En móvil preview arriba
        setPreviewScale(Math.min(0.35, (w - 32) / 1024));
      } else if (w < 1280) {
        setPreviewScale(0.36);
      } else {
        setPreviewScale(0.44);
      }
    }
  }, [setPreviewScale]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] text-[#f0e6cf]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span className="font-serif text-sm tracking-wider text-amber-200/80">
            Cargando Card Forge...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-[#f0e6cf]">
      {/* Barra de navegación superior */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c1017]/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-[family-name:var(--font-cinzel)] tracking-wider text-amber-300">
              CARD FORGE
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans">
              Generador de Cartas Coleccionables
            </p>
          </div>
        </div>

        {/* Acciones de la barra */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Colección</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px]">
              {savedCards.length}
            </span>
          </button>

          <label
            title="Muestra los rectángulos de cada slot para verificar porcentajes"
            className="flex items-center gap-2 cursor-pointer text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-750 px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
          >
            <input
              type="checkbox"
              checked={calibration}
              onChange={(e) => setCalibration(e.target.checked)}
              className="accent-amber-400 rounded cursor-pointer"
            />
            <span className="hidden sm:inline">Modo Calibración</span>
            <span className="sm:hidden">Calibrar</span>
          </label>
        </div>
      </header>

      {/* Contenido principal: Escritorio (Form izquierda, Preview derecha) / Móvil (Preview arriba, Form abajo) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Formulario y Exportación */}
        <section className="lg:col-span-6 xl:col-span-5 order-2 lg:order-1 space-y-6">
          <CardForm />
          <ExportPanel getExportNode={() => exportCardRef.current} />
        </section>

        {/* Columna Derecha: Vista previa fija */}
        <section
          ref={previewContainerRef}
          className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2 flex flex-col items-center lg:sticky lg:top-20 z-20 space-y-4"
        >
          {/* Controles de vista previa */}
          <div className="w-full flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                Vista Previa en Vivo
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Escala:
              </span>
              <input
                type="range"
                min={0.25}
                max={0.65}
                step={0.01}
                value={previewScale}
                onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                className="w-24 accent-amber-400 bg-zinc-800 rounded h-1 cursor-pointer"
              />
              <span className="font-mono text-amber-300 w-9 text-right">
                {Math.round(previewScale * 100)}%
              </span>
            </div>
          </div>

          {/* Marco de visualización con escalado CSS */}
          <div
            className="relative rounded-2xl shadow-2xl shadow-black/90 overflow-hidden border border-amber-900/40 bg-black/40"
            style={{
              width: `${1024 * previewScale}px`,
              height: `${1536 * previewScale}px`,
            }}
          >
            <div
              className="origin-top-left"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <Card card={card} calibration={calibration} />
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            Resolución nativa: 1024×1536 px • Exporta con tipografía Cinzel y serif nítida
          </p>
        </section>
      </main>

      {/* Modal de la Colección */}
      <CardListModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      {/* Nodo invisible fuera de pantalla a 1024x1536 exactos para exportación fotográfica */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-99999px",
          top: "-99999px",
          width: "1024px",
          height: "1536px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <Card ref={exportCardRef} card={card} calibration={false} />
      </div>
    </div>
  );
}
