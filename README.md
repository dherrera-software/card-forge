# Card Forge

Generador de cartas para un videojuego de cartas coleccionables propio, con previsualización en tiempo real y exportación de alta calidad a imagen.

---

## Vista previa

![Vista previa de Card Forge](docs/preview.png)

> **Nota:** Añade la captura de pantalla de la aplicación en la ruta `docs/preview.png`.

---

## Características

- **Tres tipos de cartas personalizables:**
  - **Monstruo:** Incluye nombre, coste, caja de efecto con reducción de área y franja de estadísticas de **ATK / DEF** en la esquina inferior derecha.
  - **Evento (General):** Incluye nombre, coste y texto de efecto completo.
  - **Líder (Arcano):** Incluye nombre y texto de efecto, sin coste numérico ni estadísticas de combate.
- **Personalización de marco:** 9 paletas de color disponibles (Azul, Rojo, Verde, Naranja, Amarillo, Celeste, Negro, Blanco y Gris) renderizadas dinámicamente mediante gráficos vectoriales SVG.
- **Ajuste multicapa de ilustración:**
  - Capa de fondo y capa de personaje independiente con soporte para transparencias PNG.
  - Modos de encaje: *Completa (contain)*, *Cubrir (cover)* y *Estirar (fill)*.
  - Modo 3D Pop-out (*Sobresalir del marco*) para que el personaje traspase los límites del marco decorativo.
  - Pad táctil y de ratón para desplazamiento libre (X/Y) y control de zoom continuo (0.10x a 4.00x).
- **Formateo de texto enriquecido y auto-ajuste:**
  - Marcado directo en el efecto: `*palabra*` para **negrita** y `_palabra_` para _cursiva_.
  - Algoritmo de auto-ajuste (`AutoFitText`) que calcula el tamaño óptimo de fuente en tiempo real para evitar desbordamientos.
- **Exportación fotográfica:**
  - Descarga de cartas en resolución nativa de **1024×1536 px** en formatos **PNG** y **JPG** (con fondo sólido).
  - Exportación e importación completa de cartas en formato estructurado **JSON**.
- **Persistencia en el navegador:**
  - Guardado local automático de la carta activa y gestión de colecciones mediante **IndexedDB** (`idb-keyval`), almacenando las imágenes localmente como `Blob`.
- **Modo calibración:** Visualización superpuesta de los rectángulos y coordenadas de cada slot para verificación milimétrica.

---

## Stack tecnológico

| Capa / Herramienta | Tecnología | Propósito |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 | Estructura de la aplicación web y renderizado de componentes. |
| **Lenguaje** | TypeScript 5 (Modo estricto) | Tipado estático y prevención de errores en tiempo de compilación. |
| **Estilos** | Tailwind CSS 4 | Sistema de diseño, diseño adaptable y tema oscuro. |
| **Render de carta** | HTML5 / CSS Grid / SVG inline | Renderizado preciso a resolución lógica de 1024×1536 px. |
| **Exportación** | `html-to-image` | Conversión del nodo DOM a imágenes descargables PNG y JPG. |
| **Gestión de estado** | Zustand 5 | Estado global reactivo para la carta en edición y colecciones. |
| **Validación** | Zod 4 | Validación y esquemas de datos para exportación/importación JSON. |
| **Persistencia** | IndexedDB (`idb-keyval`) | Almacenamiento local de cartas y blobs de imágenes en el cliente. |
| **Iconografía** | Lucide React | Iconos de la interfaz de usuario. |
| **Tipografía** | `next/font` (Cinzel y Lora) | Cinzel para títulos y Lora para textos de efectos. |

---

## Requisitos previos

- **Node.js**: Versión `20.x` o superior (se recomienda `20.9.0` o superior).
- **Gestor de paquetes**: `pnpm` (recomendado), `npm` o `yarn`.

---

## Instalación y ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/dherrera-software/card-forge.git
   cd card-forge
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   # o bien: npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   pnpm run dev
   # o bien: npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

4. **Compilar para producción:**
   ```bash
   pnpm run build
   pnpm run start
   ```

---

## Scripts disponibles

Los comandos definidos en `package.json` son:

| Comando | Acción |
|---|---|
| `pnpm run dev` | Inicia el servidor de desarrollo con Next.js. |
| `pnpm run build` | Compila la aplicación optimizada para producción con Turbopack. |
| `pnpm run start` | Inicia el servidor de producción tras la compilación. |
| `pnpm run lint` | Ejecuta ESLint sobre el código fuente para comprobar reglas de estilo y errores. |

---

## Estructura del proyecto

```
card-forge/
├── public/
│   └── frames/              # Archivos vectoriales SVG de los marcos para cada tipo y color
├── src/
│   ├── app/                 # Rutas y páginas de Next.js (App Router), layout global y fuentes
│   ├── components/
│   │   ├── card/            # Componentes de renderizado de la carta (Card, CardArtView, CardFrameSvg, AutoFitText)
│   │   └── editor/          # Paneles del formulario, ajuste de arte, exportación y modal de colección
│   ├── lib/
│   │   ├── export.ts        # Lógica de renderizado y descarga de imágenes con html-to-image
│   │   ├── richtext.ts      # Parser y renderizador de texto enriquecido (*negrita*, _cursiva_)
│   │   ├── schema.ts        # Esquemas Zod y tipos de datos TypeScript
│   │   ├── storage.ts       # Capa de persistencia en IndexedDB mediante idb-keyval
│   │   └── templates.ts     # Configuración de coordenadas de slots y opciones de color de marco
│   └── store/
│       └── useCardStore.ts  # Store centralizado de Zustand
├── scripts/                 # Scripts auxiliares para procesamiento y mantenimiento de recursos
├── AGENTS.md                # Reglas y especificaciones arquitectónicas del proyecto
└── package.json             # Dependencias, scripts y metadatos del proyecto
```

---

## Configuración y extensión de plantillas

La disposición de los elementos en la carta no está codificada dentro de los componentes visuales; se gestiona desde el sistema de coordenadas relativas en `src/lib/templates.ts`.

Cada tipo de carta se define en el mapa `CARD_TEMPLATES`:

```ts
export interface Rect { 
  x: number; // Porcentaje horizontal desde la esquina superior izquierda (0 a 100)
  y: number; // Porcentaje vertical desde la esquina superior izquierda (0 a 100)
  w: number; // Ancho del contenedor en porcentaje (0 a 100)
  h: number; // Alto del contenedor en porcentaje (0 a 100)
}
```

### Para modificar o añadir una plantilla:
1. Añade el nuevo tipo en el esquema de `src/lib/schema.ts` (`CardType`).
2. Define los rectángulos de cada slot (`name`, `cost`, `art`, `effect`, `atkdef`) en `CARD_TEMPLATES` dentro de `src/lib/templates.ts`.
3. Añade el archivo vectorial del marco en `public/frames/` siguiendo la convención de nombres.
4. Activa el **Modo Calibración** desde la interfaz superior para visualizar y ajustar los rectángulos en vivo sobre el lienzo de 1024×1536 px.

---

## Roadmap

- [ ] Exportación de mazos completos comprimidos en archivo ZIP.
- [ ] Generación de hojas de impresión en formato PDF con guías de corte.
- [ ] Autenticación de usuarios y guardado en la nube (Supabase / PostgreSQL).
- [ ] Galería comunitaria de cartas creadas.

---

## Licencia

*Pendiente de definición por el autor.*
