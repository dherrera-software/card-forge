"use client";

import React, { forwardRef } from "react";
import { CardData, CardTemplate } from "@/lib/schema";
import { CARD_TEMPLATES } from "@/lib/templates";
import { AutoFitText } from "./AutoFitText";
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
    const { frameSrc, slots } = template;

    const isMonster = card.type === "monster";
    const isArcano = card.type === "arcano";
    const showCost = !isArcano && !!slots.cost;

    const { zoom = 1, offsetX = 0, offsetY = 0 } = card.art;
    const artUrl = card.art.imageUrl;

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
        {/* ── 1. VENTANA DE ILUSTRACIÓN (zIndex: 1) ────────────────────── */}
        <div
          data-slot="art"
          style={{
            position: "absolute",
            left: `${slots.art.x}%`,
            top: `${slots.art.y}%`,
            width: `${slots.art.w}%`,
            height: `${slots.art.h}%`,
            overflow: "hidden",
            zIndex: 1,
            background: "#080a0f",
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
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  maxWidth: "none",
                }}
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

        {/* ── 2. MARCO DECORATIVO PNG (zIndex: 2) ────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
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
                className="font-[family-name:var(--font-cinzel)] font-black text-center text-[#f7eedc] drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]"
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
              justifyContent: isArcano ? "center" : "flex-start",
              paddingLeft: isArcano ? "2%" : "3%",
              paddingRight: isArcano ? "2%" : "3%",
            }}
          >
            <AutoFitText
              text={card.name || "NOMBRE DE LA CARTA"}
              singleLine
              minFontSize={16}
              maxFontSize={42}
              className={`font-[family-name:var(--font-cinzel)] font-bold tracking-wider text-[#f5ebd7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                isArcano ? "text-center" : "text-left"
              }`}
            />
          </div>

          {/* C) CUADRO DE EFECTOS (y ATK/DEF) */}
          <div
            data-slot="effect"
            style={{
              position: "absolute",
              left: `${slots.effect.x}%`,
              top: `${slots.effect.y}%`,
              width: `${slots.effect.w}%`,
              height: `${slots.effect.h}%`,
              padding: "1.2% 1.8%",
              overflow: "hidden",
            }}
          >
            {isMonster ? (
              /* En MONSTER: CSS Grid de 2 filas para que el texto y el badge nunca choquen */
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: "1fr auto",
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                  overflow: "hidden",
                  gap: "0.8%",
                }}
              >
                {/* Fila 1: Texto del efecto (responsive, autofit garantizado) */}
                <div
                  style={{
                    minHeight: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    paddingBottom: "2px",
                  }}
                >
                  <AutoFitText
                    text={card.effect || "Escribe el efecto de la carta aquí..."}
                    minFontSize={11}
                    maxFontSize={30}
                    className="font-[family-name:var(--font-lora)] text-[#f0e6cf] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                  />
                </div>

                {/* Fila 2: Franja de stats ATK/DEF en la esquina inferior derecha */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="grid grid-cols-2 items-center bg-[#0c1017]/95 border-2 border-amber-500/80 rounded-md px-3.5 py-1 shadow-lg shadow-black/80"
                    style={{ minWidth: "210px", height: "42px" }}
                  >
                    {/* ATK */}
                    <div className="flex items-center justify-center gap-1.5 pr-2.5">
                      <span className="font-[family-name:var(--font-cinzel)] text-[12px] font-bold text-amber-400/90 tracking-widest">
                        ATK
                      </span>
                      <span className="font-[family-name:var(--font-cinzel)] text-[22px] font-black text-[#f5ebd7] leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {card.atk || "0"}
                      </span>
                    </div>

                    {/* DEF */}
                    <div className="flex items-center justify-center gap-1.5 pl-2.5 border-l border-amber-500/50">
                      <span className="font-[family-name:var(--font-cinzel)] text-[12px] font-bold text-cyan-400/90 tracking-widest">
                        DEF
                      </span>
                      <span className="font-[family-name:var(--font-cinzel)] text-[22px] font-black text-[#f5ebd7] leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {card.def || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* En GENERAL y ARCANO: Todo el cuadro reservado para el efecto */
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <AutoFitText
                  text={card.effect || "Escribe el efecto de la carta aquí..."}
                  minFontSize={12}
                  maxFontSize={34}
                  className="font-[family-name:var(--font-lora)] text-[#f0e6cf] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                />
              </div>
            )}
          </div>
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
