"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";

interface AutoFitTextProps {
  text: string;
  minFontSize?: number;
  maxFontSize?: number;
  step?: number;
  singleLine?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AutoFitText: React.FC<AutoFitTextProps> = ({
  text,
  minFontSize = 16,
  maxFontSize = 48,
  step = 1,
  singleLine = false,
  className = "",
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);

  // Use layout effect for synchronous calculation before paint
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const content = textRef.current;
    if (!container || !content) return;

    let currentSize = maxFontSize;
    content.style.fontSize = `${currentSize}px`;

    const isOverflowing = () => {
      if (singleLine) {
        return (
          content.scrollWidth > container.clientWidth ||
          content.scrollHeight > container.clientHeight
        );
      }
      return content.scrollHeight > container.clientHeight;
    };

    while (isOverflowing() && currentSize > minFontSize) {
      currentSize -= step;
      content.style.fontSize = `${currentSize}px`;
    }

    setFontSize(currentSize);
  }, [text, minFontSize, maxFontSize, step, singleLine]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col justify-center overflow-hidden ${className}`}
      style={style}
    >
      <div
        ref={textRef}
        className={singleLine ? "truncate whitespace-nowrap text-center" : "whitespace-pre-wrap break-words"}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: singleLine ? 1.15 : 1.25,
        }}
      >
        {text}
      </div>
    </div>
  );
};
