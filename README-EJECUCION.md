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

En el home, la cera del panel rosa y del menú usa un borde grueso ondulado con gotas redondeadas, volumen y reflejos, basado en los mockups originales. Las gotas se dilatan lentamente y un reflejo recorre el borde sin mover el contenido ni interferir con botones. Con movimiento reducido, las gotas quedan estáticas y el reflejo móvil se oculta. El catálogo, las fichas de cada diseño y la página de error usan el mismo menú derretido con gotas y reflejos animados (`src/app/melt-header.css`); el catálogo los suma también en los bordes de las tarjetas, sin deformar fotografías. No necesita WebGL ni dependencias adicionales. La paleta proviene de `images/WhatsApp Image 2026-11-02 at 4.16.31 PM.jpeg`: rosa `#d8a5a1`, verde `#3b4b31`, vino `#7f2928` y avena `#dacaba`. Las tarjetas y los botones se elevan e inclinan suavemente al pasar el mouse (en dispositivos con puntero preciso) o al recibir foco de teclado. Los títulos de portada y catálogo tienen una entrada breve, sin movimiento constante. En pantallas táctiles no hay inclinación por hover; `prefers-reduced-motion` desactiva las animaciones, las transiciones y el zoom de las imágenes.

«Explora nuestras creaciones» conserva las tres tarjetas de la referencia (panel crema/salvia/lila, títulos y hojas), pero ahora usa las fotografías reales del catálogo: set de margaritas y peonía, wax melts de corazones con quemador y sachet botánico. Se toman directamente de `products` en `src/data/catalog.ts`, con sus textos alternativos y sin etiquetas ilustrativas. Las fotos se muestran completas, sin recortar ni estirar. El carrusel principal mantiene las escenas guía identificadas como ilustrativas.

El inicio recupera la composición de los mockups: texto sobre rosa a la izquierda y carrusel a la derecha, menú inmediatamente debajo y tres categorías. En móvil el texto se apila sobre el carrusel y después aparece el menú. El menú se vuelve fijo al pasar el hero. «Inicio» y la marca de la navegación vuelven al principio incluso desde la misma página desplazada o un enlace con ancla; Ctrl/Cmd-clic conserva la apertura normal en otra pestaña.

El carrusel muestra escenas guía a panel completo con un fundido de opacidad de 900 ms entre capas, sin desplazamiento, zoom animado, miniaturas ni vistas laterales. Cada escena conserva una etiqueta «Imagen ilustrativa»; las capas inactivas están ocultas a las tecnologías de asistencia. Avanza cada cinco segundos y conserva flechas, teclado y gestos táctiles. Pausa al pasar el mouse, mantener foco dentro del carrusel o esconder la pestaña; al volver comienza un intervalo completo. El botón de pausa mantiene la elección hasta reanudarlo. Con movimiento reducido el avance automático está deshabilitado y las flechas siguen funcionando. La región no anuncia cada cambio automático a lectores de pantalla.

En el catálogo, las fichas y la página de error, el menú está arriba en el flujo normal: al bajar se desplaza fuera de la pantalla en vez de tapar contenido. Se reserva espacio para su borde de cera; abrir el menú móvil empuja el contenido. Las gotas de las tarjetas tienen separación suficiente respecto de la siguiente fila.

## Contenido y configuración

El hero conserva el panel rosa, el carrusel, el botón verde y el borde derretido. Su jerarquía aprobada es: «Luz, aroma y diseño» pequeño en verde oliva; «Bendita Gracia» grande, centrado y en rojo oscuro; «Pequeños detalles, grandes intenciones» debajo en verde oliva. Se adapta a escritorio y móvil.

- Diseños y datos: `src/data/catalog.ts`. Diez diseños, todos con precio, en cinco categorías: Sets decorativos, Wax melts, Wax sachet, Temporada navideña y Detalles únicos. Los sets combinados van en Sets decorativos y las velas florales individuales en Detalles únicos. Temporada navideña agrupa Figuras navideñas, Noche de velitas, Velitas de peticiones y Sachet de temporada. El inicio conserva las tres tarjetas principales y ofrece enlaces separados a Detalles únicos y Temporada navideña. Los enlaces anteriores `?categoria=velas-florales` y `?categoria=figuras-en-cera` conservan sus destinos bajo Sets decorativos. Las rosas y peonías sin precio se retiraron; sus direcciones (`/catalogo/rosas-rosa`, `rosas-marfil`, `peonia-en-domo`, `peonia-morada`) redirigen a velas decorativas.
- Precios: se transcriben de `Información página web - Bendita Gracia.docx` (raíz). Wax melts 75 gr $18.000 / 100 gr $30.000; kit de pebetero $74.900; wax sachet botánico $12.900, minimalista $9.900 y de temporada $11.900; figuras decorativas de temporada 1 por $9.990, kit x 2 $17.900 y kit x 3 $26.900; noche de velitas x 5 $14.900; velitas de peticiones x 8 $18.000. Las fotos anteriores de sachets y figuras navideñas se suman a la línea equivalente del documento y, por tener más resolución, se muestran primero; las del documento quedan como vistas siguientes. Wax melts, kit, noche de velitas y peticiones abren con la foto del documento; «Copos en caja» quedó dentro de las figuras de temporada y `/catalogo/copos-en-caja` redirige allí. «Figuras con estrella» (velitas de estrella sobre base de perlas) pasó a ser una referencia de «Noche de velitas»: su foto está en esa galería, el pedido ofrece la opción «Referencia» (en caja o sobre base de perlas) y `/catalogo/figuras-con-estrella` redirige allí. Precios agregados por la marca: «Peonía en recipiente» $21.900 y «Set florero margaritas + peonía en base de cerámica» $39.900 (fotos en `images/`). La disponibilidad sigue por confirmar en todos los diseños. La sección «Decorativas / Recordatorios para toda ocasión» del documento está vacía y no se publica.
- Pedido: en la ficha, el cliente elige presentación, forma, fragancia y color (texto libre, porque el documento no lista colores ni formas de pebetero). Eso arma el mensaje de WhatsApp con el precio de la presentación; no hay carrito ni pago. La lista de fragancias del documento se usa también en las figuras de temporada («Elige color y fragancia»).
- Fotografías: trece originales de `images/` y las quince fotos del documento se optimizan con `python scripts/prepare-original-images.py` en `public/images/originals/`, sin modificar las subidas ni el documento, ni conservar metadatos EXIF. Las fotos de menos de 1000 px de ancho (las 15 del documento, de 216 a 700 px, y 7 de `images/`) se mejoran con IA: `python scripts/upscale-photos.py RUTA/realesrgan-ncnn-vulkan.exe` las amplía 4× con Real-ESRGAN (`realesrgan-x4plus`, ejecutable oficial de https://github.com/xinntao/Real-ESRGAN/releases) y guarda el resultado en `images/ai/` como WebP de hasta 1600 px. Después, `prepare-original-images.py` usa esas versiones. La IA reconstruye detalle que no está en la foto original: se revisaron las 22 comparando con el original (los textos de las velitas se conservan; el detalle de la vela de rosas marfil queda más suave). Si llegan los archivos originales en alta resolución, reemplazan a las versiones con IA. Un test exige que toda foto publicada tenga al menos 800 px de ancho. La paleta y el folleto no se convierten en productos. Las rosas abren con la foto amplia de ambas velas y su base; solo se retira fondo vacío superior. Los recortes pequeños se ofrecen como vistas secundarias, sin ampliarlos automáticamente. El script conserva la resolución de cada encuadre y genera `src/data/image-sizes.ts` con sus dimensiones reales. Los WebP se guardan a calidad 96 y se sirven directamente, sin una segunda compresión de Next.
- Las escenas del carrusel se generan con `python scripts/prepare-reference-images.py` en `public/images/references/hero-*.webp`, sin extraer controles ni etiquetas impresas. Se sirven directamente para evitar una segunda compresión. La primera mide 984 × 290 px; las otras rondan 574 × 200 px, por lo que se ven más suaves en pantallas anchas. Se usa `cover` solo para estas escenas guía, según el encuadre solicitado; las fotos originales conservan `scale-down`.
- La peonía morada conserva una referencia ilustrativa hasta contar con una fotografía individual equivalente. Esos recortes están en `public/images/references`, generados con `python scripts/prepare-reference-images.py`. Después de regenerar un archivo con el mismo nombre, borrá `.next/cache/images` para evitar versiones anteriores.
- Las fotografías se ajustan con `scale-down`: se ve el encuadre completo, sin estirarlo ni superar su resolución. Las tomas verticales pueden dejar márgenes cálidos dentro de los marcos horizontales. Las galerías usan miniaturas; el botón de acercamiento abre un visor a tamaño original. Podés arrastrar la foto con mouse o táctil y moverla con las flechas del teclado (Shift aumenta el paso). El movimiento se limita a los bordes de la imagen; si la foto es más pequeña que el visor, queda centrada. «Centrar fotografía» o la tecla Home restablecen el centro; Escape vuelve a la vista completa y devuelve el foco al botón. Cambiar de miniatura también restablece la vista. Fuera del modo ampliado, el gesto vertical sigue desplazando la página. No se inventa detalle ni se simula otra vista o un visor 360°.
- `NEXT_PUBLIC_WHATSAPP_PHONE`: número internacional, solo dígitos. Valor por defecto: `573144616230` (+57 314 4616230), confirmado por la marca. Se incorpora al compilar. Contacto muestra el número como enlace a WhatsApp y un botón flotante verde abre el mismo chat en todas las páginas (en móvil queda solo el ícono).
- Esencia (`/#esencia`, antes de Contacto): frase de marca y textos de Luz, Aroma y Diseño proporcionados por la propietaria. Se eliminó el párrafo de letra pequeña bajo «Pequeños detalles, grandes intenciones». «Cómo realizar tu pedido» conserva los tres pasos y los precios «desde» calculados del catálogo.
- Favicon: `src/app/favicon.ico`, `icon.png` y `apple-icon.png`, derivados de la «B» del logo del folleto original. Vista previa al compartir: `public/social-card.jpg` (1200 × 630), captura del inicio, declarada en Open Graph y Twitter en `src/app/layout.tsx`. Al cambiar el inicio, actualizá esta captura. Las redes pueden conservar la vista previa anterior en caché.
- `SITE_URL`: origen canónico. En producción debe contener el dominio público definitivo para que las redes puedan descargar la imagen; una dirección localhost no es accesible desde WhatsApp. El valor de desarrollo es `http://localhost:3000`; para este puerto configurá `http://127.0.0.1:3107` en el entorno del proceso.
- La demo está marcada `noindex` y bloqueada en `robots.txt`. No quitar estas protecciones hasta aprobar contenido y dominio.
- No se envían mensajes automáticamente ni se confirman pedidos. No hay pagos, carrito, cuentas ni administración.

## Estado de verificación

La corrección de menú y cera del catálogo observó RED con tres fallos (header sticky y efecto ausente) y luego GREEN con 3/3 escenarios dirigidos en móvil/escritorio. La corrida integrada final aprobó 5/5 pruebas de catálogo, TypeScript, ESLint y 31 pruebas de navegador de 32. Se verificaron el menú sin superposición, su expansión móvil, los filtros y enlaces, la separación entre gotas y filas, las fotos intactas y la animación con su alternativa estática.

Se excluyó deliberadamente la comprobación anterior de inicio a 1024 px: el usuario eligió «Dejar esa comprobación pendiente» tras `ERR_NETWORK_IO_SUSPENDED`. No se reintentó ni se declara una corrida de 32/32.

La verificación incluye las tarjetas, enlaces/foco, guías ilustrativas del home, fotos reales de catálogo y fichas, animación decorativa sin cambios de layout y su alternativa estática con movimiento reducido. Se revisaron capturas de escritorio y móvil comparando el bloque con la imagen raíz y el derretido con los mockups originales. Los escenarios de carrusel y visor con arrastre también pasaron.

La vista de desarrollo es http://127.0.0.1:3110. No se repitió el build de producción para preservar el preview anterior de 3108. No hay despliegue ni aprobación nativa: el assessment no estuvo disponible. La cera animada se activa de forma optativa en home y listado de catálogo; las fichas individuales conservan su comportamiento anterior. El ajuste del catálogo está local en `fix/catalog-header-wax`, todavía sin commit ni push.

El historial detallado está en `odd/tasks/catalogo-web.md`. Auditoría de la base: cero vulnerabilidades de producción y 16 avisos moderados en herramientas de desarrollo derivados de `minimatch`; no se aplicaron downgrades forzados ni se agregaron dependencias para los efectos visuales.

## Repositorio

Destino de publicación del código autorizado por la propietaria: https://github.com/Maleja-Ortiz12/bendita-gracia (rama `main`). Subir el repositorio no despliega la web ni elimina el pendiente de verificación de 1024 px. Los commits de código de esta entrega son `37eca61` (fotografías y galería) y `cbc11cc` (home, referencias y animaciones).


## Campaña navideña

El inicio incluye «Encuentra tu detalle favorito para esta Navidad» y un enlace a Temporada navideña. Las luces y copos son decorativos, sin sonido ni bloqueo de controles. El botón «Pausar animaciones navideñas» detiene ambos efectos; con movimiento reducido se muestran estáticos y se oculta ese control. Los efectos están contenidos en el bloque navideño y no se cargan bibliotecas externas. La campaña no anuncia descuentos, fechas límite ni precios nuevos: requieren confirmación de la propietaria. Referencia visual: https://elementor.com/blog/christmas-kit/ (luces, copos elegantes y protagonismo de los regalos; sin copiar sus recursos).

La ambientación navideña se comparte en todas las rutas mediante `ChristmasTheme` en el layout: ramas con esferas en las esquinas, copos laterales, guirnaldas solo en el pie de página (el menú queda sin luces) y acentos dorados en tarjetas. El control fijo «Pausar ambiente navideño» pausa luces/copos globales y los del bloque promocional; el botón de ese bloque controla el mismo estado. La elección se conserva al navegar internamente (se reinicia al recargar). Se conserva el comportamiento propio de pausa del carrusel y de las decoraciones de cera. Con movimiento reducido, las guirnaldas quedan estáticas y se ocultan copos y botones de pausa navideña. La decoración no recibe eventos de puntero y queda fuera del árbol accesible.

Las ramas de las esquinas usan agujas vectoriales superpuestas, sombras, frutos y esferas con reflejos radiales (`christmas-branch.tsx`). Las luces del pie y la campaña tienen casquillos, cristal con brillo y halo cálido mediante CSS; no requieren WebGL, imágenes externas ni otra biblioteca. La pausa compartida y el movimiento reducido siguen funcionando igual.

Las luces alternan cristal rojo, verde, azul y dorado tanto en guirnaldas como en la campaña. El acceso a la colección navideña se presenta como un regalo rojo con borde, cinta y lazo dorados; conserva su enlace, nombre accesible y foco de teclado.
