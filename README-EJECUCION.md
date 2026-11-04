# Ejecutar Bendita Gracia

La implementación usa Next.js, TypeScript y fuentes locales. Incluye portada con carrusel automático de imágenes guía, catálogo con búsqueda y categorías, fichas con galería, consultas por WhatsApp y fotografías originales. El carrusel usa escenas ilustrativas de los mockups, identificadas como tales; las fotos reales se conservan en el catálogo y las fichas. Todavía no está aprobada para publicar.

## Inicio local

Requisitos: Node.js 22.13 o superior y npm. El entorno inicial usó Node 24.14.0.

```bash
npm ci
npm run dev -- --port 3107
```

Abrí http://127.0.0.1:3107. Se usa un puerto separado porque otro proyecto del equipo ocupa el 3000.

## Comprobaciones

```bash
npm test
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Los tests de navegador levantan producción en el puerto 3107; detené previamente cualquier servidor de este proyecto que use ese puerto. No reutilizan servidores de otros proyectos. Para ejecutar producción manualmente: `npm run start -- --port 3107`, después del build.

## Relieve y movimiento

En el home, la cera del panel rosa y del menú usa un borde grueso ondulado con gotas redondeadas, volumen y reflejos, basado en los mockups originales. Las gotas se dilatan lentamente y un reflejo recorre el borde sin mover el contenido ni interferir con botones. Con movimiento reducido, las gotas quedan estáticas y el reflejo móvil se oculta. El catálogo y las fichas conservan sus bordes satinados, sin este efecto. No necesita WebGL ni dependencias adicionales. La paleta proviene de `images/WhatsApp Image 2026-11-02 at 4.16.31 PM.jpeg`: rosa `#d8a5a1`, verde `#3b4b31`, vino `#7f2928` y avena `#dacaba`. Las tarjetas y los botones se elevan e inclinan suavemente al pasar el mouse (en dispositivos con puntero preciso) o al recibir foco de teclado. Los títulos de portada y catálogo tienen una entrada breve, sin movimiento constante. En pantallas táctiles no hay inclinación por hover; `prefers-reduced-motion` desactiva las animaciones, las transiciones y el zoom de las imágenes.

«Explora nuestras creaciones» toma únicamente el bloque de tres tarjetas de `Bendita Gracia imagen del home.png`: escena guía arriba, título y nota debajo sobre un panel crema/salvia/lila, con detalles de hojas. Los títulos visibles del home son «Velas Decorativas», «Wax Melts» y «Wax Sachet», como en la referencia. Sus enlaces, identificadores de categoría y notas siguen siendo los existentes; esto no agrega productos ni una categoría nueva al catálogo, ni copia afirmaciones comerciales de la imagen. Las tres ilustraciones son los recortes exactos del bloque de esa imagen raíz, no las escenas de categorías del mockup anterior. Se generan sin pérdida con `python scripts/prepare-home-creations.py` en `public/images/references/home-creation-*.webp` (445 × 232 px), sin modificar el archivo fuente. Conservan su etiqueta impresa, por lo que no se agrega una segunda etiqueta HTML; el texto alternativo las identifica como ilustrativas. Las fotos reales permanecen en el catálogo y las fichas.

El inicio recupera la composición de los mockups: texto sobre rosa a la izquierda y carrusel a la derecha, menú inmediatamente debajo y tres categorías. En móvil el texto se apila sobre el carrusel y después aparece el menú. El menú se vuelve fijo al pasar el hero. «Inicio» y la marca de la navegación vuelven al principio incluso desde la misma página desplazada o un enlace con ancla; Ctrl/Cmd-clic conserva la apertura normal en otra pestaña.

El carrusel muestra escenas guía a panel completo con un fundido de opacidad de 900 ms entre capas, sin desplazamiento, zoom animado, miniaturas ni vistas laterales. Cada escena conserva una etiqueta «Imagen ilustrativa»; las capas inactivas están ocultas a las tecnologías de asistencia. Avanza cada cinco segundos y conserva flechas, teclado y gestos táctiles. Pausa al pasar el mouse, mantener foco dentro del carrusel o esconder la pestaña; al volver comienza un intervalo completo. El botón de pausa mantiene la elección hasta reanudarlo. Con movimiento reducido el avance automático está deshabilitado y las flechas siguen funcionando. La región no anuncia cada cambio automático a lectores de pantalla.

## Contenido y configuración

- Diseños y datos: `src/data/catalog.ts`. Hay diez diseños con información comercial por confirmar; no representan inventario disponible.
- Fotografías: trece originales de `images/` se optimizan con `python scripts/prepare-original-images.py` en `public/images/originals/`, sin modificar las subidas ni conservar metadatos EXIF. La paleta y el folleto no se convierten en productos. Las rosas abren con la foto amplia de ambas velas y su base; solo se retira fondo vacío superior. Los recortes pequeños se ofrecen como vistas secundarias, sin ampliarlos automáticamente. El script conserva la resolución de cada encuadre y genera `src/data/image-sizes.ts` con sus dimensiones reales. Los WebP se guardan a calidad 96 y se sirven directamente, sin una segunda compresión de Next.
- Las escenas del carrusel se generan con `python scripts/prepare-reference-images.py` en `public/images/references/hero-*.webp`, sin extraer controles ni etiquetas impresas. Se sirven directamente para evitar una segunda compresión. La primera mide 984 × 290 px; las otras rondan 574 × 200 px, por lo que se ven más suaves en pantallas anchas. Se usa `cover` solo para estas escenas guía, según el encuadre solicitado; las fotos originales conservan `scale-down`.
- La peonía morada conserva una referencia ilustrativa hasta contar con una fotografía individual equivalente. Esos recortes están en `public/images/references`, generados con `python scripts/prepare-reference-images.py`. Después de regenerar un archivo con el mismo nombre, borrá `.next/cache/images` para evitar versiones anteriores.
- Las fotografías se ajustan con `scale-down`: se ve el encuadre completo, sin estirarlo ni superar su resolución. Las tomas verticales pueden dejar márgenes cálidos dentro de los marcos horizontales. Las galerías usan miniaturas; el botón de acercamiento abre un visor a tamaño original. Podés arrastrar la foto con mouse o táctil y moverla con las flechas del teclado (Shift aumenta el paso). El movimiento se limita a los bordes de la imagen; si la foto es más pequeña que el visor, queda centrada. «Centrar fotografía» o la tecla Home restablecen el centro; Escape vuelve a la vista completa y devuelve el foco al botón. Cambiar de miniatura también restablece la vista. Fuera del modo ampliado, el gesto vertical sigue desplazando la página. No se inventa detalle ni se simula otra vista o un visor 360°.
- `NEXT_PUBLIC_WHATSAPP_PHONE`: número internacional, solo dígitos. Valor de referencia: `573144616230`; confirmá vigencia y país antes de usarlo públicamente. Se incorpora al compilar.
- `SITE_URL`: origen canónico. El valor de desarrollo es `http://localhost:3000`; para este puerto configurá `http://127.0.0.1:3107` en el entorno del proceso.
- La demo está marcada `noindex` y bloqueada en `robots.txt`. No quitar estas protecciones hasta aprobar contenido y dominio.
- No se envían mensajes automáticamente ni se confirman pedidos. No hay pagos, carrito, cuentas ni administración.

## Estado de verificación

La corrección de las ilustraciones exactas de la imagen raíz pasó primero RED (2 casos aún mostraban las guías anteriores) y luego GREEN (2/2). La corrida integrada final aprobó 5/5 pruebas de catálogo, TypeScript, ESLint y 28 pruebas de navegador de 29. Se inspeccionaron los tres recortes y las capturas nuevas de escritorio y móvil para comprobar que muestran las mismas escenas de la referencia. Se excluyó deliberadamente la comprobación anterior de inicio a 1024 px: el usuario eligió «Dejar esa comprobación pendiente» tras `ERR_NETWORK_IO_SUSPENDED` al cargar esa página. No se reintentó ni se declara una corrida completa de 29/29.

La verificación incluye las tarjetas, enlaces/foco, guías ilustrativas del home, fotos reales de catálogo y fichas, animación decorativa sin cambios de layout y su alternativa estática con movimiento reducido. Se revisaron capturas de escritorio y móvil comparando el bloque con la imagen raíz y el derretido con los mockups originales. Los escenarios de carrusel y visor con arrastre también pasaron.

La vista de desarrollo es http://127.0.0.1:3110. No se repitió el build de producción para preservar el preview anterior de 3108. No hay despliegue ni aprobación nativa: el assessment no estuvo disponible. El cambio de cera es optativo y solo se activa en el home; las superficies de catálogo y detalle no reciben sus gotas ni animaciones.

El historial detallado está en `odd/tasks/catalogo-web.md`. Auditoría de la base: cero vulnerabilidades de producción y 16 avisos moderados en herramientas de desarrollo derivados de `minimatch`; no se aplicaron downgrades forzados ni se agregaron dependencias para los efectos visuales.

## Repositorio

Destino de publicación del código autorizado por la propietaria: https://github.com/Maleja-Ortiz12/bendita-gracia (rama `main`). Subir el repositorio no despliega la web ni elimina el pendiente de verificación de 1024 px. Los commits de código de esta entrega son `37eca61` (fotografías y galería) y `cbc11cc` (home, referencias y animaciones).
