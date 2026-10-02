"use client";

import React, { useRef, useState } from "react";
import { Download, FileJson, Upload, Bookmark, Check, Loader2 } from "lucide-react";
import { useCardStore } from "@/store/useCardStore";
import { exportCardAsImage, exportCardAsJson, importCardFromJson, ImageFormat } from "@/lib/export";

interface ExportPanelProps {
  getExportNode: () => HTMLElement | null;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ getExportNode }) => {
  const { card, importCardData, saveToLibrary, savedCards } = useCardStore();
  const [format, setFormat] = useState<ImageFormat>("png");
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const jsonInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDownloadImage = async () => {
    const node = getExportNode();
    if (!node) {
      showFeedback("No se encontró el elemento para exportar.", "error");
      return;
    }

    try {
      setIsExporting(true);
      await exportCardAsImage(node, format, card.name);
      showFeedback(`¡Carta exportada como ${format.toUpperCase()} con éxito!`);
    } catch (error) {
      console.error("Export error:", error);
      showFeedback("Error al generar la imagen. Intenta de nuevo.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    try {
      exportCardAsJson(card);
      showFeedback("Datos JSON exportados correctamente.");
    } catch (error) {
      console.error("JSON export error:", error);
      showFeedback("Error al exportar JSON.", "error");
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importCardFromJson(file);
      importCardData(data);
      showFeedback(`Carta "${data.name}" cargada correctamente.`);
    } catch (error) {
      console.error("JSON import error:", error);
      showFeedback("Archivo JSON inválido o incompatible con el esquema.", "error");
    } finally {
      if (jsonInputRef.current) {
        jsonInputRef.current.value = "";
      }
    }
  };

  const handleSaveToCollection = async () => {
    try {
      await saveToLibrary();
      showFeedback("Carta guardada en la colección local.");
    } catch (error) {
      console.error("Error saving to library:", error);
      showFeedback("Error al guardar en la colección.", "error");
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-[#f0e6cf]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-300">
          Exportación y Guardado
        </h3>
        <span className="text-xs text-zinc-500">
          {savedCards.length} en colección
        </span>
      </div>

      {feedbackMsg && (
        <div
          className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/70 border border-emerald-700/50 text-emerald-300"
              : "bg-red-950/70 border border-red-700/50 text-red-300"
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Selector de formato de imagen */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 block">Formato de descarga</label>
        <div className="grid grid-cols-3 gap-2">
          {(["png", "jpg", "webp"] as ImageFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition-all ${
                format === fmt
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Botón principal de descarga */}
      <button
        type="button"
        disabled={isExporting}
        onClick={handleDownloadImage}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generando imagen (1024×1536)...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Descargar {format.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Acciones Secundarias: Guardar en Colección y JSON */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={handleSaveToCollection}
          title="Guardar en la colección local (IndexedDB)"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700/60"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Guardar</span>
        </button>

        <button
          type="button"
          onClick={handleExportJson}
          title="Exportar configuración de carta en JSON"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700/60"
        >
          <FileJson className="w-3.5 h-3.5 text-cyan-400" />
          <span>JSON</span>
        </button>

        <button
          type="button"
          onClick={() => jsonInputRef.current?.click()}
          title="Cargar carta desde archivo JSON"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700/60"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          <span>Cargar</span>
        </button>
      </div>

      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJson}
        className="hidden"
      />
    </div>
  );
};
