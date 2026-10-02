"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import { CardData, CardTemplate } from "@/lib/schema";
import { CARD_TEMPLATES } from "@/lib/templates";
import { CardSlot } from "./CardSlot";
import { AutoFitText } from "./AutoFitText";

export interface CardProps {
  card: CardData;
  template?: CardTemplate;
  calibration?: boolean;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, template: customTemplate, calibration = false, className = "" }, ref) => {
    const template = customTemplate || CARD_TEMPLATES[card.type] || CARD_TEMPLATES.monster;
    const { slots, frameSrc } = template;

    const isMonster = card.type === "monster";
    const isArcano = card.type === "arcano";
    const showCost = !isArcano && slots.cost && card.cost !== undefined;
    const showAtkDef = isMonster && slots.atkdef;

    const artUrl = card.art.imageUrl;
    const { zoom = 1, offsetX = 0, offsetY = 0 } = card.art;

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
        }}
      >
        {/* Layer 1: Art (Clipped to Art Slot) */}
        <CardSlot
          rect={slots.art}
          calibration={calibration}
          label="Art"
          className="z-10 overflow-hidden bg-black/40 flex items-center justify-center"
        >
          {artUrl ? (
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artUrl}
                alt={card.name || "Card Art"}
                className="max-w-none pointer-events-none object-cover"
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 opacity-40">
              <svg
                className="w-24 h-24 mb-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="font-serif text-2xl tracking-widest uppercase">
                Sin Ilustración
              </span>
            </div>
          )}
        </CardSlot>

        {/* Layer 2: Frame PNG Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameSrc}
            alt={`${card.type} frame`}
            className="w-full h-full object-fill pointer-events-none"
            crossOrigin="anonymous"
          />
        </div>

        {/* Layer 3: Text & Elements Slots */}
        {/* Name Slot */}
        <CardSlot
          rect={slots.name}
          calibration={calibration}
          label="Name"
          className="z-30 flex items-center justify-center px-4"
        >
          <AutoFitText
            text={card.name || "NOMBRE DE LA CARTA"}
            singleLine
            minFontSize={20}
            maxFontSize={50}
            className="font-[family-name:var(--font-cinzel)] font-bold tracking-wider text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] text-[#f0e6cf]"
          />
        </CardSlot>

        {/* Cost Slot (Hidden in Arcano) */}
        {showCost && slots.cost && (
          <CardSlot
            rect={slots.cost}
            calibration={calibration}
            label="Cost"
            className="z-30 flex items-center justify-center"
          >
            <span className="font-[family-name:var(--font-cinzel)] font-black text-6xl leading-none text-[#f5ebd7] drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
              {card.cost || "0"}
            </span>
          </CardSlot>
        )}

        {/* Effect Slot */}
        <CardSlot
          rect={slots.effect}
          calibration={calibration}
          label="Effect"
          className="z-30 px-6 py-4 flex flex-col justify-start"
        >
          <div className="relative w-full h-full flex flex-col justify-between">
            <AutoFitText
              text={card.effect || "Efecto o descripción de la carta..."}
              minFontSize={18}
              maxFontSize={34}
              className={`font-[family-name:var(--font-lora)] text-[#f0e6cf] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
                isMonster ? "pb-9" : ""
              }`}
            />
          </div>
        </CardSlot>

        {/* ATK / DEF Slot (Monster only) */}
        {showAtkDef && slots.atkdef && (
          <CardSlot
            rect={slots.atkdef}
            calibration={calibration}
            label="ATK / DEF"
            className="z-40 flex items-center justify-end font-[family-name:var(--font-cinzel)] font-black text-2xl tracking-wider text-[#f5ebd7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-3"
          >
            <div className="flex items-center space-x-3 bg-black/60 px-3 py-1 rounded border border-amber-500/40">
              <span className="text-amber-400 text-lg">ATK</span>
              <span>{card.atk || "0"}</span>
              <span className="text-zinc-500">/</span>
              <span className="text-blue-400 text-lg">DEF</span>
              <span>{card.def || "0"}</span>
            </div>
          </CardSlot>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
