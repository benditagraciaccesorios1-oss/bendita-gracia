# Sistema de diseño

## Paleta de implementación

Paleta actualizada de `paleta de colores actualizada.jpeg` (raíz). La imagen no trae códigos: los valores se midieron en el centro de cada muestra y son aproximados, no códigos oficiales de marca. Se definen en `:root` de `src/app/globals.css`.

| Token | HEX | Uso |
| --- | --- | --- |
| gold-light | #F5DE90 | Título de Contacto, moño de la campaña, foco sobre fondos oscuros |
| gold | #A5884E | Bordes, separadores y adornos (✦, ✧, copos) |
| gold-dark | #57370E | Títulos (h1, h2, tarjetas), banda de Contacto |
| chestnut | #8E6A0C | Foco, selección activa, cinta del regalo, números de pasos |
| slate | #4F5B43 | Menú y botones de cera; texto secundario sobre fondos claros |
| rosewood | #CEA19B | Panel del hero, encabezado del catálogo, botón «Consultar», marcos |
| sage | #95AA7F | Bordes y reflejos de cera verde |
| blush | #E4D1CD | Fondos de tarjetas, campaña y tablas |
| mist | #D5DDCE | Filtros y tarjetas verdes |

Derivados: `slate-deep` #303B28 (texto pequeño sobre rosewood, sage y blush, y lado oscuro de la cera), `rosewood-shade` #C89A94 y `rosewood-deep` #A97A74 (degradados y bordes del rosa), `gold-rim` #CDB071 (bordes dorados de tarjetas). Se conservan `ivory` #FAF6EF (fondo claro y texto sobre oscuro) e `ink` #292820. Los nombres anteriores siguen como alias: `rose` → rosewood, `forest` → slate-deep, `wine` → gold-dark, `oat` → blush.

Evitar texto claro sobre sage o blush. El texto pequeño va en slate-deep o gold-dark; los títulos grandes en gold-dark. Los degradados con texto no bajan del tono que mantiene 4.5:1 (texto normal) o 3:1 (texto grande) frente a cada parada; `tests/browser/palette.spec.ts` lo comprueba a 390 y 1440 px. Excepciones: el verde funcional del botón flotante de WhatsApp y los colores navideños de bombillas, pino y bayas.

## Tipografía y ritmo

Propuesta: Cormorant Garamond para títulos y marca provisional; Inter para navegación y texto. Usar archivos de fuentes con licencia válida, alojados por el proyecto. No presentar la marca tipográfica propuesta como logo oficial.

- Contenedor máximo: 1280 px; márgenes desktop: 48–72 px; móvil: 20 px.
- Espaciado: múltiplos de 8 px; secciones 80–112 px desktop, 48–64 px móvil.
- H1: clamp(2.5rem, 5vw, 5.5rem), interlineado cercano a 1.05.
- Texto base: 16–18 px, interlineado 1.5–1.65.
- Botones de al menos 44 px de alto; bordes discretos y radios de 4–8 px.
- Evitar formas de cera caricaturescas, adornos excesivos y sombras pesadas.

## Los cuatro mockups

### 01 — Inicio escritorio

Hero dividido: panel rosa con titular propuesto «Detalles que florecen.» y presentación de producto sobre beige. Carrusel con flechas, estado y progreso. La navegación aparece inmediatamente debajo del hero: marca, Inicio, Catálogo, Esencia, Contacto y Consultar. Galería de categorías y bloque vino para WhatsApp. (Propuesta original; los colores vigentes están en la paleta de arriba: el bloque de Contacto es dorado oscuro.)

### 02 — Catálogo escritorio

Navegación compacta coherente, búsqueda por nombre, filtros y seis fichas de referencia. Usar solo datos aprobados; la cantidad de fichas del mockup no es un inventario confirmado. Precios pendientes visibles sin inventar importes.

### 03 — Detalle escritorio

Galería amplia, miniaturas, nombre descriptivo y datos técnicos. Acción principal: consultar el diseño por WhatsApp. No ofrecer variantes que aún no estén confirmadas. Relacionados únicamente de categorías y fichas reales.

### 04 — Inicio móvil

Hero apilado, producto con protagonismo y navegación compacta tras la portada. Categorías en una columna. Mantener controles visibles sin superponer texto e imagen. No trasladar la cuadrícula desktop completa a un ancho reducido.

## Navegación central y movimiento

El menú de inicio debe estar en el flujo después del hero. Al llegar a él durante el scroll, pasa a `position: sticky; top: 12px`, con fondo opaco y z-index suficiente. En páginas internas, navegación compacta arriba para facilitar orientación. En móvil, barra reducida y menú desplegable accesible, sin enlaces cortados.

- Carrusel: transición de 450–650 ms, escala y desplazamiento moderados para sugerir profundidad.
- Por defecto, cambio manual; permitir arrastrar en pantallas táctiles sin bloquear scroll vertical.
- Flotación opcional del producto: 4–6 px, periodo de 5–7 s; animar solo transformación y opacidad.
- Interacción de puntero opcional: inclinación máxima 3 grados, solo en dispositivos con puntero preciso.
- `prefers-reduced-motion: reduce`: eliminar flotación, inclinación y transiciones espaciales.
- La navegación permanece estable al pulsar; no debe perseguir el cursor ni moverse continuamente.

Las animaciones descritas son especificaciones para construir: los PNG no tienen movimiento.

## Acabado de cera derretida — versión vigente

La referencia principal es la imagen seleccionada con bordes de cera. Con la paleta actualizada la cera es rosewood, slate/sage y dorada. Este acabado forma parte de la interfaz, sin modificar ni ocultar los productos.

| Elemento | Acabado | Límite |
| --- | --- | --- |
| Panel rosewood del hero | Borde inferior fluido y 2 gotas | No cubrir CTA ni imagen |
| Menú slate | Labio inferior y hasta 3 gotas cortas | Texto y foco permanecen rectos |
| Botones principales | Volumen satinado slate y gota en esquina | Mantener área táctil rectangular |
| Marcos de imágenes | Labio fino rosewood, dorado o sage | No cubrir etiquetas ilustrativas |
| Separadores | Línea fina dorada con gota central | Separada de títulos |
| Contacto dorado oscuro | Transición de cera clara | No invadir WhatsApp |

No aplicar el efecto a letras, campos de búsqueda, tablas de datos ni todos los bordes. El fondo general conserva espacios limpios. Mantener gotas de 8–20 px en desktop y 4–10 px en móvil, con margen exterior reservado de 24 y 16 px respectivamente. Estas medidas son guía, no requieren copiar imperfecciones de un render.

En catálogo aplicar a navegación, algunos marcos y CTA; mantener búsqueda y filtros estables. En detalle aplicar al marco principal, CTA y separador. En móvil reducir las gotas, no encoger el texto. La forma se conserva estática por defecto; animación opcional muy leve solo al entrar o al hover, sin estirar constantemente el menú.
