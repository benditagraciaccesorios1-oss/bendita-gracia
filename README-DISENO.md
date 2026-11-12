# Sistema de diseño

## Paleta de implementación

Paleta pastel pedida por la marca: los tonos pastel son protagonistas y el café desaparece (no hay textos, fondos, bordes ni sombras café, ni fondos oscuros). Se definen en `:root` de `src/app/globals.css`.

| Token | HEX | Uso |
| --- | --- | --- |
| cream | #FAF5EE | Fondo general de la página y pie |
| pink | #F6E3E1 | Panel del hero, encabezado del catálogo, primera tarjeta, fichas rosas |
| pink-powder | #F3DCD8 | Banda de Contacto, botón «Consultar», filtro activo, etiquetas de la tabla, regalo de la campaña |
| lavender | #ECE6F2 | Campaña navideña, tercera tarjeta, pilar «Diseño» |
| sage-light | #E4EADB | Menú, banda de Esencia, segunda tarjeta, filtros, control navideño |
| olive | #7A8450 | Único acento de texto: títulos y texto grande (h1, h2, tarjetas, Contacto) |
| olive-deep | #5E6740 | Texto pequeño de acento (eyebrows, etiquetas, precios, marca del pie, títulos de fichas) y contorno de foco |
| gold-soft | #B8975A | Solo líneas finas, bordes, separadores y adornos (✦, ✧, copos, cinta). Nunca texto |

Derivados para botones y hover (el mismo tono, un poco más intenso): `champagne-light` #F8EEDB, `champagne` #F2E4C6, `champagne-deep` #E8D3A8 y `champagne-hover` #DCC48F (botones principales de cera); `pink-deep` #ECC9C3 y `pink-hover` #E6BFB8 (botones rosas); `sage-deep` #D3DDC4 (hover salvia); `lavender-deep` #DDD3E8. Las sombras usan `--shade` (oliva, `rgb(94 103 64 / x)`) en lugar de café. Se conservan como bordes y adornos `rosewood` #CEA19B, `rosewood-shade`, `rosewood-deep`, `sage` #95AA7F, `gold-rim` #CDB071 y `gold-light` #F5DE90; `slate` #4F5B43 y `slate-deep` #303B28 quedan solo como texto (notas y cuerpo). Alias: `gold` → gold-soft, `wine` → olive, `rose` → pink, `blush` → pink, `mist` → sage-light, `oat` → cream, `forest` → slate-deep. Se retiraron `gold-dark` #57370E y `chestnut` #8E6A0C.

Contraste medido (WCAG): el dorado suave #B8975A no llega a 3:1 sobre ningún pastel (2.1–2.5), por eso no se usa en texto. El oliva #7A8450 da 3.06–3.69:1 (texto grande, ≥ 24 px o ≥ 18.66 px en negrita); el oliva oscuro #5E6740 da 4.6–5.55:1 (texto pequeño); slate-deep da 9–10.9:1 (cuerpo y etiquetas de botones). Los degradados con texto no bajan del tono que mantiene 4.5:1 (texto normal) o 3:1 (texto grande) frente a cada parada; `tests/browser/palette.spec.ts` lo comprueba a 390 y 1440 px y recorre inicio, catálogo, ficha y 404 buscando café (tono 20–50°, luminosidad < 45 %) y fondos oscuros. Excepciones: fotografías, el verde funcional del botón flotante de WhatsApp y los colores navideños de bombillas, pino y bayas.

Secciones del inicio, en orden: hero rosa pastel → menú salvia clara → campaña lavanda → «Explora nuestras creaciones» sobre crema con tarjetas rosa, salvia y lavanda → Esencia en banda salvia clara (pilares rosa, salvia pálida y lavanda) → Contacto rosa empolvado con líneas doradas finas → pie crema. Botones: relleno champaña (dorado suave pastel) o rosa empolvado con texto slate-deep; en hover el mismo color un poco más intenso.

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

Hero dividido: panel rosa con titular propuesto «Detalles que florecen.» y presentación de producto sobre beige. Carrusel con flechas, estado y progreso. La navegación aparece inmediatamente debajo del hero: marca, Inicio, Catálogo, Esencia, Contacto y Consultar. Galería de categorías y bloque vino para WhatsApp. (Propuesta original; los colores vigentes están en la paleta de arriba: el bloque de Contacto es rosa empolvado.)

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

La referencia principal es la imagen seleccionada con bordes de cera. Con la paleta pastel la cera es rosa, salvia clara y champaña. Este acabado forma parte de la interfaz, sin modificar ni ocultar los productos.

| Elemento | Acabado | Límite |
| --- | --- | --- |
| Panel rosa del hero | Borde inferior fluido y 2 gotas | No cubrir CTA ni imagen |
| Menú salvia clara | Labio inferior y hasta 3 gotas cortas | Texto y foco permanecen rectos |
| Botones principales | Volumen satinado champaña y gota en esquina | Mantener área táctil rectangular |
| Marcos de imágenes | Labio fino rosewood, dorado o sage | No cubrir etiquetas ilustrativas |
| Separadores | Línea fina dorada con gota central | Separada de títulos |
| Contacto rosa empolvado | Labio de cera clara con línea dorada fina | No invadir WhatsApp |

No aplicar el efecto a letras, campos de búsqueda, tablas de datos ni todos los bordes. El fondo general conserva espacios limpios. Mantener gotas de 8–20 px en desktop y 4–10 px en móvil, con margen exterior reservado de 24 y 16 px respectivamente. Estas medidas son guía, no requieren copiar imperfecciones de un render.

En catálogo aplicar a navegación, algunos marcos y CTA; mantener búsqueda y filtros estables. En detalle aplicar al marco principal, CTA y separador. En móvil reducir las gotas, no encoger el texto. La forma se conserva estática por defecto; animación opcional muy leve solo al entrar o al hover, sin estirar constantemente el menú.
