import React from "react";
import { Rect } from "@/lib/schema";

interface CardSlotProps {
  rect: Rect;
  calibration?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const CardSlot: React.FC<CardSlotProps> = ({
  rect,
  calibration = false,
  label,
  className = "",
  style = {},
  children,
}) => {
  return (
    <div
      data-slot={label}
      className={`absolute ${calibration ? "outline-2 outline-dashed outline-amber-400 bg-amber-500/20" : ""} ${className}`}
      style={{
        left: `${rect.x}%`,
        top: `${rect.y}%`,
        width: `${rect.w}%`,
        height: `${rect.h}%`,
        ...style,
      }}
    >
      {calibration && label && (
        <span className="absolute -top-5 left-0 z-50 rounded bg-amber-900/90 px-1.5 py-0.5 text-[11px] font-mono font-bold text-amber-200 shadow-sm pointer-events-none whitespace-nowrap">
          {label} ({rect.x.toFixed(1)}%, {rect.y.toFixed(1)}%)
        </span>
      )}
      {children}
    </div>
  );
};
