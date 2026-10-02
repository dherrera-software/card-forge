"use client";

import React, { useRef, useState } from "react";
import { Upload, ZoomIn, RotateCcw, Trash2, Move } from "lucide-react";
import { useCardStore } from "@/store/useCardStore";

export const ArtAdjuster: React.FC = () => {
  const { card, updateArt, setArtFile, clearArt } = useCardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const { imageUrl, zoom = 1, offsetX = 0, offsetY = 0 } = card.art;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await setArtFile(file);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageUrl) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    // Factor de escala para que el arrastre en el adjuster se corresponda cómodamente con los 1024x1536 px
    const scaleFactor = 3.5;
    updateArt({
      offsetX: Math.round(dragStartRef.current.startOffsetX + deltaX * scaleFactor),
      offsetY: Math.round(dragStartRef.current.startOffsetY + deltaY * scaleFactor),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const handleReset = () => {
    updateArt({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-amber-300">
          Ilustración de la Carta
        </label>
        {imageUrl && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="Restablecer posición y zoom"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={clearArt}
              title="Eliminar ilustración"
              className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!imageUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 hover:border-amber-500/70 bg-zinc-950/40 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-zinc-900/40 group"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-400 group-hover:text-amber-300 flex items-center justify-center mb-3 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-zinc-200">
            Haz clic o arrastra una imagen aquí
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Formatos admitidos: PNG, JPG, WEBP
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mini touchpad interactivo para arrastre */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative h-36 w-full rounded-lg bg-zinc-950/80 border border-zinc-700/80 overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center ${
              isDragging ? "ring-2 ring-amber-500/80" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Miniatura"
              className="max-h-full max-w-full object-contain pointer-events-none opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/30">
              <Move className="w-6 h-6 text-amber-300/80 mb-1" />
              <span className="text-[11px] font-mono text-zinc-300 bg-black/70 px-2 py-0.5 rounded">
                Arrastra aquí para mover la ilustración
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-xs py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700"
            >
              <Upload className="w-3.5 h-3.5" /> Cambiar imagen
            </button>
          </div>

          {/* Zoom Control */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" /> Zoom
              </span>
              <span className="font-mono text-amber-300">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => updateArt({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Offset Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Desplazamiento X (px)
              </label>
              <input
                type="number"
                value={offsetX}
                onChange={(e) => updateArt({ offsetX: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Desplazamiento Y (px)
              </label>
              <input
                type="number"
                value={offsetY}
                onChange={(e) => updateArt({ offsetY: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
