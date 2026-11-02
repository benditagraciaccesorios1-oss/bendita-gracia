# Prompt para construir la página

Actúa como desarrollador frontend y diseñador de interfaces. Construye un catálogo web responsive para Bendita Gracia con Next.js, TypeScript y estructura modular por funcionalidad. Lee primero todos los README de este paquete y examina los cuatro mockups. Usa los mockups como guía visual; implementa cada texto, botón y sección con HTML y componentes reales, sin convertir el sitio en una imagen gigante.

Mantén la paleta rosa #D3A09B, verde #394B30, vino #822C2A y beige #DDCEBA; apariencia editorial elegante; tipografía serif en titulares y sans en interfaz. En inicio, crea portada con carrusel de producto y navegación forest flotante situada después del hero, que se vuelve sticky al alcanzarla. En móvil apila contenido, conserva controles claros y usa menú accesible. En páginas internas usa navegación compacta. La referencia final es el diseño seleccionado con efectos de cera derretida, no las variantes planas anteriores.

Implementa `/`, `/catalogo`, `/catalogo/[slug]`, esencia y contacto. Modela productos tipados con campos pendientes null. Crea catálogo con búsqueda y filtro de categoría combinados, query params, estado vacío y limpieza de filtros. Implementa galería de producto, datos pendientes y botón de consulta por WhatsApp. Sin carrito, pagos, cuentas ni panel de administración.

Usa los nuevos diseños de velas florales, figuras alargadas con estrella y sachets de las referencias. No inventes precios, stock, aromas, medidas, reseñas, historia o servicios. Imágenes recreadas deben conservar etiqueta ilustrativa. Si no hay assets individuales, señala el pendiente y usa placeholders explícitos; no descargues imágenes ajenas ni simules disponer de modelos geométricos.

Para apariencia 3D usa imágenes recortadas y CSS con profundidad y transiciones suaves. No describas esto como visor 360. Si posteriormente se proporcionan modelos GLB, integra visor diferido con fallback. Respeta reduced-motion, navegación por teclado, contraste y foco visible.

Implementa enlace WhatsApp configurable; referencia original 3144616230, país Colombia pendiente de confirmar antes de publicar. El enlace solo prepara una consulta. No envíes mensajes ni confirmes pedidos automáticamente.

Al terminar verifica tipos, lint y build; revisa escritorio y móvil, filtros, rutas inexistentes, menú con teclado, sticky y WhatsApp. Informa qué quedó implementado y qué datos o recursos faltan. No publiques sin instrucción del propietario.

Implementa el acabado derretido mediante WaxEdge, WaxFrame y WaxButton según README-DISENO y README-DESARROLLO. Usa SVG decorativo escalable y capas CSS: labio fluido con gotas cortas en el hero, menú, botones, marcos y transiciones; conserva espacios limpios. No conviertas textos, filtros ni datos en formas deformadas. Reserva margen para las gotas, evita recortes y solapamientos, usa pointer-events:none y aria-hidden en las decoraciones. La navegación central sigue estable y accesible; reduced-motion elimina movimiento sin quitar la identidad visual.
