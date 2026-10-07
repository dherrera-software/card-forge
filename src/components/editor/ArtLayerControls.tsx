"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  RotateCcw,
  Trash2,
  Move,
  ZoomIn,
} from "lucide-react";
import { ArtLayerType } from "@/store/useCardStore";
import { ImageLayer } from "@/lib/schema";

export interface ArtLayerControlsProps {
  layerKey: ArtLayerType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  layer: ImageLayer;
  onUpdate: (updates: Partial<ImageLayer>) => void;
  onSetFile: (file: File) => Promise<void>;
  onClear: () => Promise<void>;
}

export const ArtLayerControls: React.FC<ArtLayerControlsProps> = ({
  layerKey,
  title,
  subtitle,
  icon,
  layer,
  onUpdate,
  onSetFile,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const { imageUrl, zoom = 1, offsetX = 0, offsetY = 0, fitMode = "contain" } = layer;

  // Manejo de archivo mediante input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onSetFile(file);
    }
  };

  // Manejo de Drag & Drop de archivos desde el explorador del sistema
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await onSetFile(file);
    }
  };

  // Arrastre con puntero (ratón o táctil) para mover el offset
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageUrl) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsPointerDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const scaleFactor = 3.5;
    onUpdate({
      offsetX: Math.round(dragStartRef.current.startOffsetX + deltaX * scaleFactor),
      offsetY: Math.round(dragStartRef.current.startOffsetY + deltaY * scaleFactor),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPointerDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsPointerDragging(false);
      dragStartRef.current = null;
    }
  };

  const handleReset = () => {
    onUpdate({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all">
      {/* Cabecera de la capa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-amber-400">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-300 leading-tight">
              {title}
            </h4>
            <p className="text-[11px] text-zinc-400 leading-tight">
              {subtitle}
            </p>
          </div>
        </div>

        {imageUrl && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="Restablecer posición y escala"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              title="Eliminar capa"
              className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Zona de Drop o configuración */}
      {!imageUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDraggingFile
              ? "border-amber-400 bg-amber-500/10 text-amber-300"
              : "border-zinc-800 hover:border-amber-500/50 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Upload className="w-7 h-7 mb-2 opacity-70" />
          <span className="text-xs font-semibold">Subir imagen</span>
          <span className="text-[10px] text-zinc-400 text-center mt-1">
            Arrastra una imagen o haz clic aquí
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pad de Arrastre Táctil y con Ratón */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative h-24 rounded-xl border flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing transition-colors ${
              isPointerDragging
                ? "bg-amber-500/15 border-amber-500/80 shadow-inner"
                : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Move className="w-6 h-6 text-amber-400 mb-1 opacity-70" />
            <span className="text-xs font-semibold text-zinc-200">
              Arrastra para posicionar
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              X: {offsetX}px | Y: {offsetY}px
            </span>
          </div>

          {/* Opciones de Ajuste / Modo de Imagen */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 block">Modo de ajuste</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "contain", label: "Completa" },
                  { id: "cover", label: "Cubrir" },
                  { id: "fill", label: "Estirar" },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onUpdate({ fitMode: mode.id })}
                  className={`py-1 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    fitMode === mode.id
                      ? "bg-amber-500 text-black font-semibold shadow-sm"
                      : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle de Recorte al Marco (Solo para la capa de Personaje) */}
          {layerKey === "character" && (
            <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Recorte de la Criatura
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    Sobresalir crea efecto 3D sobre el marco
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdate({ clipToFrame: true })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    layer.clipToFrame !== false
                      ? "bg-amber-500 text-black font-bold shadow-sm"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <span>Dentro del marco</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ clipToFrame: false })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    layer.clipToFrame === false
                      ? "bg-amber-500 text-black font-bold shadow-sm"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <span>Sobresalir (3D)</span>
                </button>
              </div>
            </div>
          )}

          {/* Control de Zoom / Escala (0.10x a 4.00x) */}
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" /> Tamaño / Escala
              </span>
              <span className="font-mono text-amber-300 font-semibold">
                {zoom.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="4"
              step="0.02"
              value={zoom}
              onChange={(e) => onUpdate({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Coordenadas X e Y numéricas */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-0.5">
                Posición X (px)
              </label>
              <input
                type="number"
                value={offsetX}
                onChange={(e) => onUpdate({ offsetX: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-0.5">
                Posición Y (px)
              </label>
              <input
                type="number"
                value={offsetY}
                onChange={(e) => onUpdate({ offsetY: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
