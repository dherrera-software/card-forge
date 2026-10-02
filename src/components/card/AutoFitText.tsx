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

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const content = textRef.current;
    if (!container || !content) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW <= 0 || cH <= 0) return;

    let lo = minFontSize;
    let hi = maxFontSize;
    let best = minFontSize;

    const fits = (size: number): boolean => {
      content.style.fontSize = `${size}px`;
      if (singleLine) {
        return content.scrollWidth <= cW && content.scrollHeight <= cH;
      }
      return content.scrollHeight <= cH && content.scrollWidth <= cW + 2;
    };

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(mid)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    content.style.fontSize = `${best}px`;
    setFontSize((prev) => (prev === best ? prev : best));
  }, [text, minFontSize, maxFontSize, singleLine]);

  useIsomorphicLayoutEffect(() => {
    calculateFit();
    const raf = requestAnimationFrame(() => calculateFit());
    return () => cancelAnimationFrame(raf);
  }, [calculateFit]);

  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        calculateFit();
      });
    }
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
      className={`w-full h-full overflow-hidden ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: 0,
        ...style,
      }}
    >
      <div
        ref={textRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: singleLine ? 1.15 : 1.25,
          whiteSpace: singleLine ? "nowrap" : "pre-wrap",
          wordBreak: singleLine ? "normal" : "break-word",
          overflowWrap: singleLine ? "normal" : "anywhere",
          overflow: "hidden",
          textAlign: singleLine ? "center" : "left",
        }}
      >
        {text}
      </div>
    </div>
  );
};
