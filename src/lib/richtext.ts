/**
 * Parser de texto enriquecido estilo WhatsApp.
 *
 * Reglas:
 * - `*texto*`  → negrita (<strong>)
 * - `_texto_`  → cursiva (<em>)
 * - Se pueden anidar: `*_texto_*` → negrita + cursiva
 * - Los delimitadores deben estar pegados al texto (sin espacios internos).
 */

export type RichSegmentStyle = "bold" | "italic";

export interface RichSegment {
  text: string;
  styles: RichSegmentStyle[];
}

/**
 * Parsea una cadena con marcadores `*...*` (negrita) y `_..._` (cursiva)
 * y devuelve un array de segmentos con sus estilos aplicados.
 */
export function parseRichText(input: string): RichSegment[] {
  if (!input) return [];

  const segments: RichSegment[] = [];
  // Regex que captura *...* y _..._ de forma no ávida
  // Captura anidamiento en un solo nivel (ej. *_texto_* o _*texto*_)
  const TOKEN_RE = /(\*([^*]+)\*)|(_([^_]+)_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(input)) !== null) {
    // Texto plano antes de este match
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index), styles: [] });
    }

    if (match[1] !== undefined) {
      // Match de *...* (negrita)
      const innerText = match[2];
      // Buscar cursiva anidada dentro de la negrita
      const innerSegments = parseInnerStyle(innerText, "_", "italic");
      for (const seg of innerSegments) {
        segments.push({
          text: seg.text,
          styles: ["bold", ...seg.styles],
        });
      }
    } else if (match[3] !== undefined) {
      // Match de _..._ (cursiva)
      const innerText = match[4];
      // Buscar negrita anidada dentro de la cursiva
      const innerSegments = parseInnerStyle(innerText, "*", "bold");
      for (const seg of innerSegments) {
        segments.push({
          text: seg.text,
          styles: ["italic", ...seg.styles],
        });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Texto plano restante después del último match
  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), styles: [] });
  }

  // Si no hubo ningún match, devolver el texto plano completo
  if (segments.length === 0) {
    segments.push({ text: input, styles: [] });
  }

  return segments;
}

/**
 * Busca un nivel de anidamiento dentro de un segmento ya estilizado.
 * Por ejemplo, dentro de un bloque negrita busca `_..._` para cursiva.
 */
function parseInnerStyle(
  text: string,
  delimiter: string,
  style: RichSegmentStyle
): RichSegment[] {
  const escaped = delimiter === "*" ? "\\*" : delimiter;
  const re = new RegExp(`${escaped}([^${escaped}]+)${escaped}`, "g");

  const segments: RichSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), styles: [] });
    }
    segments.push({ text: match[1], styles: [style] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), styles: [] });
  }

  if (segments.length === 0) {
    segments.push({ text, styles: [] });
  }

  return segments;
}
