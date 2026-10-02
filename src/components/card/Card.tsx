"use client";

import React, { forwardRef } from "react";
import { CardData, CardTemplate } from "@/lib/schema";
import { CARD_TEMPLATES } from "@/lib/templates";
import { AutoFitText } from "./AutoFitText";

export interface CardProps {
  card: CardData;
  template?: CardTemplate;
  calibration?: boolean;
  className?: string;
}

/**
 * Carta renderizada siempre a 1024×1536 px lógicos.
 *
 * Layout (de arriba a abajo, en % de la altura total):
 *   ┌──────────────────────────────────┐
 *   │  Header row  (h ≈ 9%)            │
 *   │  [Coste] [Nombre]                │
 *   ├──────────────────────────────────┤
 *   │  Arte (h ≈ 73%)                  │
 *   ├──────────────────────────────────┤
 *   │  Panel inferior (h ≈ 16%)        │
 *   │  Efecto (flex-1)                 │
 *   │  ATK/DEF (h fija, solo monster)  │
 *   └──────────────────────────────────┘
 *
 * Todo usa unidades relativas (% / fr) — sin px en el layout.
 * La imagen del marco es una capa encima del contenido.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, template: customTemplate, calibration = false, className = "" }, ref) => {
    const template = customTemplate || CARD_TEMPLATES[card.type] || CARD_TEMPLATES.monster;
    const { frameSrc, slots } = template;

    const isMonster = card.type === "monster";
    const isArcano = card.type === "arcano";
    const showCost = !isArcano;
    const showAtkDef = isMonster;

    const artUrl = card.art.imageUrl;
    const { zoom = 1, offsetX = 0, offsetY = 0 } = card.art;

    // Proporciones clave de la carta expresadas en % (ajusta aquí para calibrar)
    const HEADER_H = 9;          // % altura del header
    const ART_H    = 72;         // % altura del arte
    const BOTTOM_H = 100 - HEADER_H - ART_H; // resto para panel inferior
    const COST_W   = 13;         // % ancho del medallón de coste
    const MARGIN_H = 3.5;        // % margen horizontal interior del marco
    const ATKDEF_H = isMonster ? 27 : 0; // % de BOTTOM_H reservado para ATK/DEF

    // Color de debug para calibración
    const dbg = calibration ? "1px dashed rgba(250,200,0,0.7)" : "none";

    return (
      <div
        ref={ref}
        id="card-render-node"
        className={`relative select-none overflow-hidden bg-[#0c1017] text-[#f0e6cf] ${className}`}
        style={{
          width: "1024px",
          height: "1536px",
          minWidth: "1024px",
          minHeight: "1536px",
          maxWidth: "1024px",
          maxHeight: "1536px",
          // Grid principal: header | arte | panel inferior
          display: "grid",
          gridTemplateRows: `${HEADER_H}% ${ART_H}% ${BOTTOM_H}%`,
          gridTemplateColumns: "100%",
        }}
      >
        {/* ── ROW 1: Header ─────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: showCost
              ? `${COST_W}% 1fr`
              : "1fr",
            padding: `1% ${MARGIN_H}%`,
            gap: "0 1%",
            alignItems: "center",
            border: calibration ? dbg : "none",
            position: "relative",
            zIndex: 30,
          }}
        >
          {/* Coste (medallón) */}
          {showCost && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                border: calibration ? dbg : "none",
              }}
            >
              <AutoFitText
                text={card.cost || "0"}
                singleLine
                minFontSize={28}
                maxFontSize={80}
                className="font-[family-name:var(--font-cinzel)] font-black text-center text-[#f5ebd7] drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
              />
            </div>
          )}

          {/* Nombre */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              border: calibration ? dbg : "none",
            }}
          >
            <AutoFitText
              text={card.name || "NOMBRE DE LA CARTA"}
              singleLine
              minFontSize={18}
              maxFontSize={52}
              className="font-[family-name:var(--font-cinzel)] font-bold tracking-wider text-center text-[#f0e6cf] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>

        {/* ── ROW 2: Arte ───────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            margin: `0 ${MARGIN_H}%`,
            border: calibration ? dbg : "none",
            zIndex: 10,
            background: "rgba(0,0,0,0.35)",
          }}
        >
          {artUrl ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                transition: "transform 75ms",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artUrl}
                alt={card.name || "Card Art"}
                style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "none" }}
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.4,
              }}
            >
              <svg style={{ width: "8%", marginBottom: "2%" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span style={{ fontSize: "3%", letterSpacing: "0.2em" }}>SIN ILUSTRACIÓN</span>
            </div>
          )}
        </div>

        {/* ── ROW 3: Panel inferior (Efecto + ATK/DEF) ─────────────── */}
        <div
          style={{
            display: "grid",
            // Si hay ATK/DEF: última fila reservada para la banda de stats
            gridTemplateRows: showAtkDef ? `1fr ${ATKDEF_H}%` : "1fr",
            margin: `1% ${MARGIN_H}%`,
            gap: "1% 0",
            overflow: "hidden",
            border: calibration ? dbg : "none",
            zIndex: 30,
          }}
        >
          {/* Efecto: ocupa el espacio disponible */}
          <div
            style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "1% 2%",
              border: calibration ? dbg : "none",
            }}
          >
            <AutoFitText
              text={card.effect || "Efecto o descripción de la carta..."}
              minFontSize={10}
              maxFontSize={34}
              className="font-[family-name:var(--font-lora)] text-[#f0e6cf] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* ATK / DEF: banda en la parte inferior, solo monster */}
          {showAtkDef && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 2%",
                overflow: "hidden",
                border: calibration ? dbg : "none",
              }}
            >
              <AutoFitText
                text={`ATK ${card.atk || "0"}  /  DEF ${card.def || "0"}`}
                singleLine
                minFontSize={16}
                maxFontSize={52}
                className="font-[family-name:var(--font-cinzel)] font-black tracking-wider text-right text-[#f5ebd7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
              />
            </div>
          )}
        </div>

        {/* ── Marco decorativo: capa encima de todo el contenido ─────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameSrc}
            alt={`${card.type} frame`}
            style={{ width: "100%", height: "100%", objectFit: "fill" }}
            crossOrigin="anonymous"
          />
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";
