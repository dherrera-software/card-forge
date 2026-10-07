import React from "react";
import { CardData, Rect } from "@/lib/schema";

export interface CardArtViewProps {
  card: CardData;
  artSlot: Rect;
}

/**
 * Renderizado de las capas de arte de la carta:
 * - Capa 1: Fondo (recortado dentro de la ventana de arte)
 * - Capa 2: Personaje (recortado o desbordado en 3D pop-out)
 * - Placeholder elegante si no hay ilustraciones cargadas
 */
export const CardArtView: React.FC<CardArtViewProps> = ({ card, artSlot }) => {
  const bg = card.background;
  const char = card.character;
  const hasAnyArt = Boolean(bg?.imageUrl || char?.imageUrl);

  return (
    <>
      {/* ── 1. VENTANA DE ILUSTRACIÓN (zIndex: 1) ────────────────────── */}
      <div
        data-slot="art"
        style={{
          position: "absolute",
          left: `${artSlot.x}%`,
          top: `${artSlot.y}%`,
          width: `${artSlot.w}%`,
          height: `${artSlot.h}%`,
          overflow: "hidden",
          zIndex: 1,
          background: "#080a0f",
        }}
      >
        {/* Capa Fondo */}
        {bg?.imageUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${bg.offsetX || 0}px, ${bg.offsetY || 0}px) scale(${bg.zoom || 1})`,
              transition: "transform 75ms",
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bg.imageUrl}
              alt="Fondo de la carta"
              style={{
                ...(bg.fitMode === "cover"
                  ? { width: "100%", height: "100%", objectFit: "cover" }
                  : bg.fitMode === "fill"
                  ? { width: "100%", height: "100%", objectFit: "fill" }
                  : {
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }),
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Capa Personaje (Recortado al marco) */}
        {char?.imageUrl && char.clipToFrame !== false && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${char.offsetX || 0}px, ${char.offsetY || 0}px) scale(${char.zoom || 1})`,
              transition: "transform 75ms",
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={char.imageUrl}
              alt={card.name || "Personaje"}
              style={{
                ...(char.fitMode === "cover"
                  ? { width: "100%", height: "100%", objectFit: "cover" }
                  : char.fitMode === "fill"
                  ? { width: "100%", height: "100%", objectFit: "fill" }
                  : {
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }),
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Placeholder cuando no hay ninguna imagen cargada */}
        {!hasAnyArt && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.35,
              zIndex: 0,
            }}
          >
            <svg
              style={{ width: "9%", marginBottom: "2%" }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span className="font-[family-name:var(--font-cinzel)] text-2xl tracking-widest text-[#f0e6cf]">
              SIN ILUSTRACIÓN
            </span>
          </div>
        )}
      </div>

      {/* ── 2. PERSONAJE QUE SOBRESALE DEL MARCO (zIndex: 5, Pop-out 3D) ─ */}
      {char?.imageUrl && char.clipToFrame === false && (
        <div
          style={{
            position: "absolute",
            left: `${artSlot.x}%`,
            top: `${artSlot.y}%`,
            width: `${artSlot.w}%`,
            height: `${artSlot.h}%`,
            overflow: "visible",
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${char.offsetX || 0}px, ${char.offsetY || 0}px) scale(${char.zoom || 1})`,
              transition: "transform 75ms",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={char.imageUrl}
              alt={card.name || "Personaje sobresaliendo"}
              style={{
                ...(char.fitMode === "cover"
                  ? { width: "100%", height: "100%", objectFit: "cover" }
                  : char.fitMode === "fill"
                  ? { width: "100%", height: "100%", objectFit: "fill" }
                  : {
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }),
              }}
              crossOrigin="anonymous"
            />
          </div>
        </div>
      )}
    </>
  );
};
