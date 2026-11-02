# Sistema de diseño

## Paleta de implementación

Valores aproximados derivados de la referencia; no son códigos oficiales de marca.

| Token | HEX | Uso |
| --- | --- | --- |
| rose | #D3A09B | Hero, paneles, acentos |
| forest | #394B30 | Navegación, texto y acciones |
| wine | #822C2A | Títulos, contacto y énfasis |
| oat | #DDCEBA | Fondos secundarios |
| ivory | #FAF6EF | Fondo general y texto claro |
| ink | #292820 | Texto principal |

Evitar texto blanco sobre rosa claro. Usar vino o tinta. Comprobar contraste de cada combinación final: 4.5:1 en texto normal y 3:1 en texto grande.

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

Hero dividido: panel rosa con titular propuesto «Detalles que florecen.» y presentación de producto sobre beige. Carrusel con flechas, estado y progreso. La navegación aparece inmediatamente debajo del hero: marca, Inicio, Catálogo, Esencia, Contacto y Consultar. Galería de categorías y bloque vino para WhatsApp.

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

La referencia principal es la imagen seleccionada con bordes de cera en rosa, verde, crema y vino. Este acabado forma parte de la interfaz, sin modificar ni ocultar los productos.

| Elemento | Acabado | Límite |
| --- | --- | --- |
| Panel rosa del hero | Borde inferior fluido y 2 gotas | No cubrir CTA ni imagen |
| Menú forest | Labio inferior y hasta 3 gotas cortas | Texto y foco permanecen rectos |
| Botones principales | Volumen satinado y gota en esquina | Mantener área táctil rectangular |
| Marcos de imágenes | Labio fino rosa, crema o salvia | No cubrir etiquetas ilustrativas |
| Separadores | Línea fina con gota central | Separada de títulos |
| Contacto vino | Transición de cera crema | No invadir WhatsApp |

No aplicar el efecto a letras, campos de búsqueda, tablas de datos ni todos los bordes. El fondo general conserva espacios limpios. Mantener gotas de 8–20 px en desktop y 4–10 px en móvil, con margen exterior reservado de 24 y 16 px respectivamente. Estas medidas son guía, no requieren copiar imperfecciones de un render.

En catálogo aplicar a navegación, algunos marcos y CTA; mantener búsqueda y filtros estables. En detalle aplicar al marco principal, CTA y separador. En móvil reducir las gotas, no encoger el texto. La forma se conserva estática por defecto; animación opcional muy leve solo al entrar o al hover, sin estirar constantemente el menú.
