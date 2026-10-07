"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  ZoomIn,
  RotateCcw,
  Trash2,
  Move,
  Image as ImageIcon,
  User,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useCardStore, ArtLayerType } from "@/store/useCardStore";
import { ImageLayer } from "@/lib/schema";

interface LayerControlProps {
  layerKey: ArtLayerType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  layer: ImageLayer;
  onUpdate: (updates: Partial<ImageLayer>) => void;
  onSetFile: (file: File) => Promise<void>;
  onClear: () => Promise<void>;
}

const LayerControl: React.FC<LayerControlProps> = ({
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
              ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
              : "border-zinc-750 hover:border-amber-500/70 bg-zinc-950/40 hover:bg-zinc-900/40"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
              isDraggingFile
                ? "bg-amber-400 text-black scale-110"
                : "bg-zinc-800 text-zinc-400 group-hover:text-amber-300"
            }`}
          >
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-200 text-center">
            {isDraggingFile ? "¡Suelta la imagen aquí!" : "Haz clic o arrastra un archivo aquí"}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 text-center">
            PNG (con transparencia), JPG o WEBP
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mini touchpad interactivo para mover la posición */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative h-32 w-full rounded-lg bg-zinc-950/80 border border-zinc-750 overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center transition-all ${
              isPointerDragging
                ? "ring-2 ring-amber-500 shadow-md"
                : isDraggingFile
                ? "ring-2 ring-amber-400 bg-amber-500/10"
                : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className={`max-h-full max-w-full pointer-events-none opacity-60 ${
                fitMode === "cover" ? "object-cover h-full w-full" : "object-contain"
              }`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/35">
              <Move className="w-5 h-5 text-amber-300/90 mb-1" />
              <span className="text-[10px] font-mono text-zinc-300 bg-black/75 px-2 py-0.5 rounded">
                Arrastra para reposicionar
              </span>
            </div>
          </div>

          {/* Botón cambiar imagen con soporte drag & drop */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="w-full text-xs py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Cambiar archivo (o arrastra otro)</span>
          </button>

          {/* Selector de modo de ajuste (Completa vs Rellenar vs Estirar) */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 block font-medium">
              Modo de proporción
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onUpdate({ fitMode: "contain" })}
                title="Muestra toda la imagen original sin recortar ningún borde"
                className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  fitMode === "contain"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Minimize2 className="w-3 h-3" />
                <span>Completa</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ fitMode: "cover" })}
                title="Llena toda la ventana de arte"
                className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  fitMode === "cover"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>Rellenar</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ fitMode: "fill" })}
                title="Estira la imagen para coincidir exactamente con los bordes"
                className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  fitMode === "fill"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Move className="w-3 h-3" />
                <span>Estirar</span>
              </button>
            </div>
          </div>

          {/* Opción para el Personaje: Recortar vs Sobresalir del marco (Pop-out 3D) */}
          {layerKey === "character" && (
            <div className="space-y-1 pt-0.5">
              <label className="text-[11px] text-zinc-400 block font-medium">
                Efecto de marco del personaje
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdate({ clipToFrame: true })}
                  className={`py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    layer.clipToFrame !== false
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <span>Dentro del marco</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ clipToFrame: false })}
                  title="Permite que el personaje sobresalga por encima del marco decorativo"
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

export const ArtAdjuster: React.FC = () => {
  const { card, updateLayer, setLayerFile, clearLayer } = useCardStore();

  return (
    <div className="space-y-4">
      {/* 1. Apartado para el Fondo */}
      <LayerControl
        layerKey="background"
        title="1. Fondo de la Ilustración"
        subtitle="Escenario, paisaje o textura de fondo"
        icon={<ImageIcon className="w-4 h-4" />}
        layer={card.background}
        onUpdate={(updates) => updateLayer("background", updates)}
        onSetFile={(file) => setLayerFile("background", file)}
        onClear={() => clearLayer("background")}
      />

      {/* 2. Apartado para el Personaje */}
      <LayerControl
        layerKey="character"
        title="2. Personaje o Criatura"
        subtitle="Sujeto principal (admite PNG transparente)"
        icon={<User className="w-4 h-4" />}
        layer={card.character}
        onUpdate={(updates) => updateLayer("character", updates)}
        onSetFile={(file) => setLayerFile("character", file)}
        onClear={() => clearLayer("character")}
      />
    </div>
  );
};
