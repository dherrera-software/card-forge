# Generador de cartas (card-forge)

Aplicación web para crear cartas de un videojuego de cartas propio, al estilo de pokecardgenerator.com: el usuario rellena una plantilla (tipo, nombre, coste, efecto, ATK/DEF, ilustración) y exporta la carta como imagen.

Idioma de la interfaz: **español**. Identificadores de código, nombres de archivos y commits: **inglés**.

## Reglas para el agente

- Antes de escribir código, propón un plan corto y espera confirmación en cada fase.
- Trabaja en pasos pequeños y verificables. Un tema por commit.
- **No cambies el stack ni añadas dependencias fuera de la lista** sin preguntar antes.
- Si algo es ambiguo (medidas, comportamiento, diseño), pregunta en vez de inventar.
- TypeScript estricto (`strict: true`). Sin `any`. Sin código muerto.
- Cada componente hace una sola cosa. Los datos de plantillas viven en configuración, nunca hardcodeados dentro de los componentes.

## Stack (fijo)

| Capa | Herramienta |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Estilos / UI | Tailwind CSS + shadcn/ui |
| Render de la carta | Componentes React con HTML/CSS (no canvas) |
| Exportación a imagen | `html-to-image` |
| Estado | Zustand |
| Validación | Zod |
| Guardado local | IndexedDB con `idb-keyval` (imágenes como Blob) |
| Ajuste de ilustración | `react-easy-crop` (o arrastre + zoom propios con pointer events) |
| Fuentes | `next/font` con Cinzel (títulos) y una serif legible (efectos) |
| Despliegue | Vercel |

No hay backend en la fase 1. Todo funciona en el navegador. Usa Client Components donde haga falta (`'use client'`).

## Tipos de carta y reglas de campos

Hay tres tipos. Cada uno muestra campos distintos. Las casillas que no aplican **no se dibujan**.

| Tipo (`CardType`) | Nombre | Coste | Efecto | ATK / DEF |
|---|---|---|---|---|
| `monster` | sí | sí | sí | sí |
| `general` (las demás cartas) | sí | sí | sí | no |
| `arcano` | sí | **no** | sí | **no** |

Reglas adicionales:

- Las cartas **no muestran** ningún número ni nombre del tarot (nada de "0" ni "THE FOOL").
- El marco es igual para toda la colección; solo cambian las casillas visibles.
- En `monster`, ATK y DEF van en una **franja pequeña y discreta dentro del cuadro de efectos, en su esquina inferior derecha**, como en las cartas de Yu-Gi-Oh. Solo se muestran los valores, no etiquetas grandes. ATK/DEF son texto (permiten valores como `?`).
- En `monster`, el texto del efecto no debe solaparse con la franja de ATK/DEF: reduce el área útil del efecto en ese tipo.

## Modelo de datos

```ts
export type CardType = 'monster' | 'general' | 'arcano';

export interface CardData {
  id: string;
  type: CardType;
  name: string;
  cost?: string;      // solo monster y general, máx. 3 caracteres
  atk?: string;       // solo monster, máx. 5 caracteres
  def?: string;       // solo monster, máx. 5 caracteres
  effect: string;     // admite saltos de línea
  art: {
    imageId?: string; // clave del Blob en IndexedDB
    zoom: number;     // 1 = cubre la ventana
    offsetX: number;  // px sobre el lienzo de 1024x1536
    offsetY: number;
  };
  createdAt: number;
  updatedAt: number;
}
```

Define el esquema equivalente en Zod y úsalo para validar al cargar y al importar/exportar JSON.

## Sistema de plantillas (la pieza central)

Cada tipo de carta se describe con un archivo de configuración. Las posiciones están en **porcentaje del marco**, así se puede cambiar un marco sin tocar los componentes.

```ts
export interface Rect { x: number; y: number; w: number; h: number } // en %

export interface CardTemplate {
  type: CardType;
  frameSrc: string; // p. ej. /frames/monster.png
  slots: {
    name: Rect;
    art: Rect;
    effect: Rect;
    cost?: Rect;    // ausente en arcano
    atkdef?: Rect;  // solo en monster
  };
}
```

Valores iniciales (calculados sobre un marco de 1024×1536; son aproximados y hay que calibrarlos con los marcos reales):

| Slot | x % | y % | w % | h % |
|---|---|---|---|---|
| name | 20.0 | 2.7 | 75.2 | 5.7 |
| cost (círculo) | 3.8 | 2.1 | 12.9 | 8.6 |
| art | 7.0 | 9.1 | 86.2 | 72.8 |
| effect | 7.6 | 83.0 | 85.0 | 12.7 |
| atkdef (franja, mitad izquierda ATK, mitad derecha DEF) | 67.4 | 92.3 | 23.4 | 2.9 |

Los marcos son imágenes PNG ya generadas con IA. Se guardan en `public/frames/`:

- `monster.png`, `general.png`, `arcano.png`
- Proporción **2:3** (referencia 1024×1536).
- Las casillas del marco están **vacías**; el generador pinta el texto encima.
- La ilustración se dibuja en la ventana central, recortada dentro de ella, con un pequeño margen interior para no tapar el borde dorado.

Incluye un **modo calibración** (activable con un interruptor) que dibuja los rectángulos de cada slot sobre el marco, para poder ajustar los porcentajes a simple vista.

## Render de la carta

- El componente `<Card />` se renderiza siempre a un tamaño lógico fijo de **1024×1536 px**.
- La vista previa se escala con CSS (`transform: scale()`) según el ancho disponible. Así los tamaños de fuente son iguales en la vista previa y en la exportación.
- Orden de capas: marco (imagen) → ilustración (recortada a la ventana) → textos.
- Texto del **nombre**: una línea, centrado, con reducción automática de tamaño para que quepa.
- Texto del **efecto**: justificado a la izquierda, con saltos de línea, y reducción automática del tamaño hasta que quepa en su rectángulo (tamaño mínimo razonable).
- Coste: centrado en el medallón circular, tamaño grande.
- Estilo de texto: color crema (`#f0e6cf`), sombra oscura suave, títulos en Cinzel.

## Exportación

- Botón "Descargar" con selector de formato: **PNG, JPG, WEBP**.
- Usa `html-to-image`. Antes de exportar espera `document.fonts.ready` y a que la ilustración esté cargada.
- Exporta siempre a escala 1 sobre el nodo de 1024×1536 (sin el `scale()` de la vista previa). Opción de calidad 2× como mejora posterior.
- JPG necesita fondo opaco.
- Nombre de archivo: nombre de la carta saneado (sin caracteres especiales).
- También permite exportar e importar los datos de la carta en **JSON**.

## Interfaz

- Una sola pantalla. En escritorio: formulario a la izquierda, vista previa de la carta a la derecha. En móvil: vista previa arriba, formulario debajo.
- Controles: selector de tipo, nombre, coste, ATK, DEF, efecto (textarea), subida de ilustración, zoom y desplazamiento de la ilustración, formato de exportación.
- Los campos que no aplican al tipo elegido se ocultan (no solo se desactivan).
- Estilo visual: tema oscuro (azul noche) con acentos dorados, coherente con las cartas.
- Accesible: etiquetas en todos los campos, foco visible, contraste suficiente.

## Persistencia

- Guarda la carta en edición y la lista de cartas creadas.
- Los datos van en IndexedDB; las ilustraciones como Blob, referenciadas por `imageId`.
- Zustand maneja el estado en memoria; la persistencia es una capa aparte.

## Estructura de carpetas sugerida

```
src/
  app/                  # layout.tsx, page.tsx
  components/
    card/               # Card.tsx, CardSlot.tsx, AutoFitText.tsx
    editor/             # CardForm.tsx, ArtAdjuster.tsx, ExportPanel.tsx
    ui/                 # componentes shadcn
  lib/
    templates.ts        # configuración de CardTemplate por tipo
    schema.ts           # Zod + tipos
    export.ts           # exportación con html-to-image
    storage.ts          # IndexedDB
  store/
    useCardStore.ts     # Zustand
public/
  frames/               # monster.png, general.png, arcano.png
```

## Fase 1 (MVP): criterios de aceptación

1. Puedo elegir el tipo de carta y solo veo los campos que le corresponden.
2. La vista previa se actualiza en vivo mientras escribo.
3. Puedo subir una ilustración y ajustar zoom y posición dentro de la ventana.
4. El texto del nombre y del efecto se ajusta automáticamente sin desbordar su caja.
5. Puedo descargar la carta en PNG, JPG y WEBP, y el resultado coincide con la vista previa.
6. Al recargar la página no pierdo la carta en edición.
7. El modo calibración muestra los slots sobre el marco.

## Fuera de alcance (fase 2)

Exportar un mazo completo en ZIP, hoja de impresión en PDF, cuentas de usuario y guardado en la nube (Supabase), galería pública, plantillas de marco editables desde la interfaz.

## Primer encargo para el agente

1. Crea el proyecto Next.js con TypeScript, Tailwind y shadcn/ui, y configura las demás dependencias del stack.
2. Crea `lib/schema.ts` y `lib/templates.ts` con los tipos, el esquema Zod y la configuración de los tres tipos de carta.
3. Crea el componente `<Card />` a 1024×1536 con marco, ilustración y textos, usando marcos provisionales si todavía no están en `public/frames/`.
4. Muestra un plan de los pasos siguientes y espera confirmación antes de continuar con el formulario y la exportación.
