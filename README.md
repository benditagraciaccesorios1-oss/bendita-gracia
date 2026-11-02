# Bendita Gracia — guía de construcción

Propuesta de sitio de velas y detalles aromáticos. Este paquete contiene cuatro mockups y documentación de implementación; no contiene una aplicación ya construida ni modelos 3D.

## Archivos

- `mockups/01-inicio.png`: portada de escritorio, carrusel, navegación central y categorías.
- `mockups/02-catalogo.png`: búsqueda, filtros y galería de diseños.
- `mockups/03-detalle.png`: ficha de producto y consulta por WhatsApp.
- `mockups/04-movil.png`: adaptación móvil de la portada.
- `README-DISENO.md`: identidad, composición y comportamiento responsive.
- `README-DESARROLLO.md`: arquitectura, datos, interacciones y validación.
- `README-CONTENIDOS.md`: fuentes, pendientes y reglas de publicación.
- `PROMPT-IMPLEMENTACION.md`: instrucciones listas para un asistente de desarrollo.

## Objetivo y alcance

Presentar los diseños de Bendita Gracia y facilitar consultas por WhatsApp. La primera versión será un catálogo, con inicio, catálogo, detalle y secciones de esencia/contacto. Sin pagos, carrito, cuentas ni panel administrativo en este alcance.

## Decisiones visuales

Paleta tomada de la referencia aportada: rosa empolvado, verde bosque, vino y beige. Velas florales, figuras con estrella y sachets como protagonistas. Navegación flotante después de la portada; carrusel con profundidad visual y animación suave. Estética editorial elegante, sobria y cálida. Versión actual: cera derretida selectiva en panel del hero, botones, navegación, marcos de imágenes y separadores. La imagen seleccionada por el usuario es la referencia visual principal; las variantes previas sin este acabado quedan sustituidas.

## Secuencia sugerida

1. Confirmar datos y derechos de uso de las fotografías.
2. Preparar recortes individuales de producto y definir fichas verificadas.
3. Crear estructura Next.js + TypeScript y componentes del sistema visual.
4. Construir inicio, catálogo y detalle con datos locales.
5. Añadir navegación, filtros y enlace de WhatsApp.
6. Implementar movimiento accesible y optimizar imágenes.
7. Verificar escritorio/móvil, teclado, errores y compilación.
8. Aprobar contenido y publicar en el alojamiento elegido.

## Entrega y limitaciones

Las imágenes son referencias visuales, no capturas de una aplicación funcional. Las escenas recreadas están marcadas como ilustrativas. El efecto 3D de los mockups es una imagen renderizada: para girar una vela libremente hacen falta modelos geométricos y texturas reales, que no se incluyen. Las palabras grabadas en las recreaciones pueden diferir del original; transcribirlas desde fotografías antes de publicar.
