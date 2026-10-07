"use client";

import React from "react";
import { Image as ImageIcon, User } from "lucide-react";
import { useCardStore } from "@/store/useCardStore";
import { ArtLayerControls } from "./ArtLayerControls";

export const ArtAdjuster: React.FC = () => {
  const { card, updateLayer, setLayerFile, clearLayer } = useCardStore();

  return (
    <div className="space-y-4">
      {/* 1. Apartado para el Fondo */}
      <ArtLayerControls
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
      <ArtLayerControls
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
