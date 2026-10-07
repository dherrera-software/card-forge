"use client";

import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { parseRichText, RichSegment } from "@/lib/richtext";

interface AutoFitTextProps {
  text: string;
  minFontSize?: number;
  maxFontSize?: number;
  singleLine?: boolean;
  enableRichText?: boolean;
  className?: string;
  style?: React.CSSProperties;
  bottomRightCutout?: { width: number; height: number };
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Renderiza un segmento de texto enriquecido aplicando estilos de negrita/cursiva.
 */
function RichSpan({ segment, index }: { segment: RichSegment; index: number }) {
  const isBold = segment.styles.includes("bold");
  const isItalic = segment.styles.includes("italic");

  if (!isBold && !isItalic) {
    return <>{segment.text}</>;
  }

  const inlineStyle: React.CSSProperties = {
    ...(isBold ? { fontWeight: 700 } : {}),
    ...(isItalic ? { fontStyle: "italic" } : {}),
  };

  if (isBold && isItalic) {
    return <strong key={index} style={inlineStyle}><em>{segment.text}</em></strong>;
  }
  if (isBold) {
    return <strong key={index} style={inlineStyle}>{segment.text}</strong>;
  }
  return <em key={index} style={inlineStyle}>{segment.text}</em>;
}

/**
 * Renderiza texto completo con soporte de *negrita* y _cursiva_ estilo WhatsApp.
 * Preserva los saltos de línea del texto original.
 */
function RichTextContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = parseRichText(line);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && "\n"}
            {segments.map((seg, segIdx) => (
              <RichSpan key={`${lineIdx}-${segIdx}`} segment={seg} index={segIdx} />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
}

export const AutoFitText: React.FC<AutoFitTextProps> = ({
  text,
  minFontSize = 10,
  maxFontSize = 36,
  singleLine = false,
  enableRichText = false,
  className = "",
  style = {},
  bottomRightCutout,
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
  }, [minFontSize, maxFontSize, singleLine]);

  useIsomorphicLayoutEffect(() => {
    calculateFit();
    const raf = requestAnimationFrame(() => calculateFit());
    return () => cancelAnimationFrame(raf);
  }, [calculateFit, text]);

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
        justifyContent: singleLine ? "center" : "flex-start",
        alignItems: singleLine ? "center" : undefined,
        minHeight: 0,
        position: "relative",
        ...style,
      }}
    >
      <div
        ref={textRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: singleLine ? 1 : 1.25,
          whiteSpace: singleLine ? "nowrap" : "pre-wrap",
          wordBreak: singleLine ? "normal" : "break-word",
          overflowWrap: singleLine ? "normal" : "anywhere",
          overflow: "hidden",
          textAlign: singleLine ? "center" : "left",
          width: "100%",
          height: singleLine ? undefined : "100%",
          display: singleLine ? "flex" : "block",
          alignItems: singleLine ? "center" : undefined,
          justifyContent: singleLine ? "center" : undefined,
        }}
      >
        {bottomRightCutout && (
          <>
            <div
              aria-hidden="true"
              style={{
                float: "right",
                height: `calc(100% - ${bottomRightCutout.height}px)`,
                width: 0,
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                float: "right",
                clear: "right",
                width: `${bottomRightCutout.width}px`,
                height: `${bottomRightCutout.height}px`,
                pointerEvents: "none",
              }}
            />
          </>
        )}
        {enableRichText ? <RichTextContent text={text} /> : text}
      </div>
    </div>
  );
};
