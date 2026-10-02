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
 * Carta a 1024×1536 px lógicos.
 *
 * Layout en % de la altura total (1536 px):
 *   ┌──────────────────────────────┐
 *   │  Header   ~9%  (≈138 px)    │
 *   │  [Coste] + [Nombre]         │
 *   ├──────────────────────────────┤
 *   │  Arte    ~71%  (≈1090 px)   │
 *   ├──────────────────────────────┤
 *   │  Efecto  ~14%  (≈215 px)    │
 *   ├──────────────────────────────┤
 *   │  ATK/DEF  ~6%  (≈ 92 px)   │  (solo monster)
 *   │  ó Efecto continúa en gen.  │
 *   └──────────────────────────────┘
 *
 * Reglas críticas para que no haya overflow:
 *  - Todos los ítems de flex/grid tienen `overflow: hidden`
 *  - `minHeight: 0` en cada sección (fix CSS Grid)
 *  - AutoFitText mide con ResizeObserver (no depende del timing del primer paint)
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, template: customTemplate, calibration = false, className = "" }, ref) => {
    const template = customTemplate || CARD_TEMPLATES[card.type] || CARD_TEMPLATES.monster;
    const { frameSrc } = template;

    const isMonster = card.type === "monster";
    const isArcano = card.type === "arcano";

    const { zoom = 1, offsetX = 0, offsetY = 0 } = card.art;
    const artUrl = card.art.imageUrl;

    // ─── Proporciones (% de 1536 px) ────────────────────────────
    const H_HEADER  = 9;
    const H_ART     = 71;
    const H_EFFECT  = isMonster ? 14 : 20;
    const H_ATKDEF  = isMonster ? 6  : 0;
    // Margen horizontal interior del marco (% de 1024 px)
    const MH = 3.8;

    const dbg = calibration
      ? { outline: "2px dashed rgba(255,210,0,0.8)" }
      : {};

    // Estilo base para todas las secciones: contención estricta
    const sectionBase: React.CSSProperties = {
      overflow: "hidden",
      minHeight: 0,         // ← fix CSS Grid/Flex: evita que la celda se expanda
      position: "relative",
    };

    return (
      <div
        ref={ref}
        id="card-render-node"
        className={`select-none text-[#f0e6cf] ${className}`}
        style={{
          width: "1024px",
          height: "1536px",
          minWidth: "1024px",
          minHeight: "1536px",
          maxWidth: "1024px",
          maxHeight: "1536px",
          overflow: "hidden",
          background: "#0c1017",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ── HEADER (Coste + Nombre) ────────────────────────────── */}
        <div
          style={{
            ...sectionBase,
            ...dbg,
            height: `${H_HEADER}%`,
            flexShrink: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: `${MH}%`,
            paddingRight: `${MH}%`,
            gap: "1%",
          }}
        >
          {/* Medallón de coste */}
          {!isArcano && (
            <div
              style={{
                ...sectionBase,
                ...dbg,
                width: "12%",
                flexShrink: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoFitText
                text={card.cost || "0"}
                singleLine
                minFontSize={28}
                maxFontSize={90}
                className="font-[family-name:var(--font-cinzel)] font-black text-center text-[#f5ebd7] drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
              />
            </div>
          )}

          {/* Nombre */}
          <div
            style={{
              ...sectionBase,
              ...dbg,
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isArcano ? "center" : "flex-start",
              paddingLeft: isArcano ? 0 : "2%",
            }}
          >
            <AutoFitText
              text={card.name || "NOMBRE DE LA CARTA"}
              singleLine
              minFontSize={18}
              maxFontSize={54}
              className="font-[family-name:var(--font-cinzel)] font-bold tracking-wider text-[#f0e6cf] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>

        {/* ── ARTE ──────────────────────────────────────────────── */}
        <div
          style={{
            ...sectionBase,
            ...dbg,
            height: `${H_ART}%`,
            flexShrink: 0,
            marginLeft: `${MH}%`,
            marginRight: `${MH}%`,
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
                transform: `translate(${offsetX}px,${offsetY}px) scale(${zoom})`,
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
                opacity: 0.35,
              }}
            >
              <svg
                style={{ width: "9%", marginBottom: "2%" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="font-[family-name:var(--font-cinzel)] text-2xl tracking-widest">SIN ILUSTRACIÓN</span>
            </div>
          )}
        </div>

        {/* ── EFECTO ────────────────────────────────────────────── */}
        <div
          style={{
            ...sectionBase,
            ...dbg,
            height: `${H_EFFECT}%`,
            flexShrink: 0,
            marginLeft: `${MH}%`,
            marginRight: `${MH}%`,
            marginTop: "0.8%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "1% 2%",
          }}
        >
          <AutoFitText
            text={card.effect || "Efecto o descripción de la carta..."}
            minFontSize={10}
            maxFontSize={36}
            className="font-[family-name:var(--font-lora)] text-[#f0e6cf] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* ── ATK / DEF (solo monster) ──────────────────────────── */}
        {isMonster && (
          <div
            style={{
              ...sectionBase,
              ...dbg,
              height: `${H_ATKDEF}%`,
              flexShrink: 0,
              marginLeft: `${MH}%`,
              marginRight: `${MH}%`,
              marginBottom: "0.5%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 2%",
            }}
          >
            <AutoFitText
              text={`ATK ${card.atk || "0"}  /  DEF ${card.def || "0"}`}
              singleLine
              minFontSize={14}
              maxFontSize={60}
              className="font-[family-name:var(--font-cinzel)] font-black tracking-wider text-right text-[#f5ebd7] drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]"
            />
          </div>
        )}

        {/* ── Marco decorativo (z-index encima de todo) ─────────── */}
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
