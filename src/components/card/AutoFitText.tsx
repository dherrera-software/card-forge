"use client";

import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";

interface AutoFitTextProps {
  text: string;
  minFontSize?: number;
  maxFontSize?: number;
  singleLine?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AutoFitText: React.FC<AutoFitTextProps> = ({
  text,
  minFontSize = 10,
  maxFontSize = 36,
  singleLine = false,
  className = "",
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const content = textRef.current;
    if (!container || !content) return;

    const targetWidth = container.clientWidth;
    const targetHeight = container.clientHeight;

    if (targetWidth <= 0 || targetHeight <= 0) return;

    // Búsqueda binaria para encontrar el tamaño óptimo de fuente
    let low = minFontSize;
    let high = maxFontSize;
    let bestSize = minFontSize;

    // Helper para verificar desbordamiento
    const overflows = (size: number): boolean => {
      content.style.fontSize = `${size}px`;
      content.style.lineHeight = singleLine ? "1.15" : `${Math.max(1.15, 1.25 - (36 - size) * 0.003)}`;

      if (singleLine) {
        return (
          content.scrollWidth > targetWidth ||
          content.scrollHeight > targetHeight
        );
      }
      return (
        content.scrollHeight > targetHeight ||
        content.scrollWidth > targetWidth
      );
    };

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (overflows(mid)) {
        high = mid - 1; // Demasiado grande, probamos menor
      } else {
        bestSize = mid; // Cabe bien, intentamos un tamaño mayor
        low = mid + 1;
      }
    }

    setFontSize(bestSize);
    content.style.fontSize = `${bestSize}px`;
  }, [text, minFontSize, maxFontSize, singleLine]);

  useIsomorphicLayoutEffect(() => {
    calculateFit();
  }, [calculateFit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      calculateFit();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [calculateFit]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col justify-center overflow-hidden ${className}`}
      style={style}
    >
      <div
        ref={textRef}
        className={
          singleLine
            ? "truncate whitespace-nowrap text-center"
            : "whitespace-pre-wrap break-words text-left hyphens-auto"
        }
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: singleLine ? 1.15 : 1.2,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {text}
      </div>
    </div>
  );
};
