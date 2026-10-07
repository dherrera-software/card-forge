"use client";

import React, { forwardRef } from "react";
import { CardData, CardTemplate } from "@/lib/schema";
import { CARD_TEMPLATES } from "@/lib/templates";
import { AutoFitText } from "./AutoFitText";
import { CardArtView } from "./CardArtView";
import { CardFrameSvg } from "./CardFrameSvg";
import { CardSlot } from "./CardSlot";

export interface CardProps {
  card: CardData;
  template?: CardTemplate;
  calibration?: boolean;
  className?: string;
}

/**
 * Render de Carta a 1024×1536 px lógicos nativos.
 *
 * Capas:
 * 1. Base oscura (#0c1017)
 * 2. Ilustración recortada en la ventana de arte (zIndex: 1)
 * 3. Marco decorativo PNG con ventana de arte transparente (zIndex: 2)
 * 4. Textos y badges con CSS Grid responsive (zIndex: 10, NUNCA tapados por el marco)
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, template: customTemplate, calibration = false, className = "" }, ref) => {
    const template = customTemplate || CARD_TEMPLATES[card.type] || CARD_TEMPLATES.monster;
    const { slots } = template;

    const isMonster = card.type === "monster";
    const isArcano = card.type === "arcano";
    const showCost = !isArcano && !!slots.cost;

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
          position: "relative",
          overflow: "hidden",
          background: "#0c1017",
        }}
      >
        {/* ── 1 & 2. VENTANA DE ILUSTRACIÓN Y POP-OUT 3D ──────────────── */}
        <CardArtView card={card} artSlot={slots.art} />

        {/* ── 2. MARCO VECTORIAL SVG DINÁMICO (zIndex: 2) ───────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <CardFrameSvg
            cardType={card.type}
            frameColor={card.frameColor || "blue"}
          />
        </div>

        {/* ── 3. CAPA DE CONTENIDO Y TEXTOS (zIndex: 10) ──────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {/* A) COSTE (Medallón superior izquierdo) */}
          {showCost && slots.cost && (
            <div
              data-slot="cost"
              style={{
                position: "absolute",
                left: `${slots.cost.x}%`,
                top: `${slots.cost.y}%`,
                width: `${slots.cost.w}%`,
                height: `${slots.cost.h}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoFitText
                text={card.cost || "0"}
                singleLine
                minFontSize={28}
                maxFontSize={66}
                className="font-[family-name:var(--font-cinzel)] font-black text-center text-[#f7eedc] leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]"
              />
            </div>
          )}

          {/* B) NOMBRE DE LA CARTA */}
          <div
            data-slot="name"
            style={{
              position: "absolute",
              left: `${slots.name.x}%`,
              top: `${slots.name.y}%`,
              width: `${slots.name.w}%`,
              height: `${slots.name.h}%`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "2%",
              paddingRight: "2%",
            }}
          >
            <AutoFitText
              text={card.name || "NOMBRE DE LA CARTA"}
              singleLine
              minFontSize={16}
              maxFontSize={42}
              className="font-[family-name:var(--font-cinzel)] font-bold tracking-wider text-[#f5ebd7] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] translate-y-[2px]"
            />
          </div>

          {/* C) CUADRO DE EFECTOS */}
          <div
            data-slot="effect"
            style={{
              position: "absolute",
              left: `${slots.effect.x}%`,
              top: `${slots.effect.y}%`,
              width: `${slots.effect.w}%`,
              height: `${slots.effect.h}%`,
              padding: "16px 22px",
              overflow: "hidden",
            }}
          >
            <AutoFitText
              text={card.effect || "Escribe el efecto de la carta aquí..."}
              enableRichText
              minFontSize={11}
              maxFontSize={32}
              bottomRightCutout={isMonster ? { width: 265, height: 62 } : undefined}
              className="font-[family-name:var(--font-lora)] text-[#f0e6cf] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* D) FRANJA ATK / DEF (Solo Monstruo - ubicado sobre el badge del marco) */}
          {isMonster && slots.atkdef && (
            <div
              data-slot="atkdef"
              style={{
                position: "absolute",
                left: `${slots.atkdef.x}%`,
                top: `${slots.atkdef.y}%`,
                width: `${slots.atkdef.w}%`,
                height: `${slots.atkdef.h}%`,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                alignItems: "center",
              }}
            >
              {/* ATK */}
              <div className="flex items-center justify-end pr-3 gap-2">
                <span className="font-[family-name:var(--font-cinzel)] text-[22px] font-bold text-amber-300 tracking-wider">
                  ATK
                </span>
                <span className="font-[family-name:var(--font-cinzel)] text-[22px] font-black text-[#fff5db] leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {card.atk || "0"}
                </span>
              </div>

              {/* DEF */}
              <div className="flex items-center justify-start pl-3 gap-2">
                <span className="font-[family-name:var(--font-cinzel)] text-[22px] font-bold text-cyan-300 tracking-wider">
                  DEF
                </span>
                <span className="font-[family-name:var(--font-cinzel)] text-[22px] font-black text-[#fff5db] leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {card.def || "0"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. MODO CALIBRACIÓN (Visualización interactiva de slots) ── */}
        {calibration && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            <CardSlot rect={slots.name} calibration label="Name" />
            <CardSlot rect={slots.art} calibration label="Art" />
            <CardSlot rect={slots.effect} calibration label="Effect" />
            {slots.cost && <CardSlot rect={slots.cost} calibration label="Cost" />}
            {slots.atkdef && isMonster && (
              <CardSlot rect={slots.atkdef} calibration label="ATK/DEF" />
            )}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
