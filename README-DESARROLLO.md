# Implementación técnica

## Base propuesta

Next.js con App Router y TypeScript; estilos con Tailwind o CSS Modules. Es una propuesta de arquitectura, no un repositorio inicializado. Seleccionar versiones estables compatibles al comenzar y fijarlas en el lockfile. Datos locales tipados para la primera versión; no se necesita backend para un catálogo con consultas por WhatsApp.

## Rutas y módulos

| Ruta | Propósito |
| --- | --- |
| `/` | Inicio |
| `/catalogo` | Búsqueda y filtros |
| `/catalogo/[slug]` | Detalle |
| `/#esencia` | Identidad con texto aprobado |
| `/#contacto` | Contacto |

Carpetas propuestas: `src/app`, `src/components/layout`, `src/features/catalog`, `src/features/home`, `src/data`, `src/lib`, `src/styles`, `public/images/products`. Componentes: HeroCarousel, FloatingNavigation, ProductCard, ProductGallery, CatalogFilters, WhatsAppLink, ContactSection y SiteFooter. Separar presentación, datos y generación de enlaces.

## Modelo de contenido

```ts
type Category = 'velas-florales' | 'figuras-en-cera' | 'wax-sachet';
type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  images: { src: string; alt: string; illustrative: boolean }[];
  priceCOP: number | null;
  dimensions: string | null;
  fragrances: string[] | null;
  availability: 'unconfirmed' | 'available' | 'unavailable';
};
```

`null` se muestra como «Por confirmar». No sustituirlo por cero, descuentos o promesas de disponibilidad. Nunca inferir aromas por las flores o especias visibles. Validar slug y devolver página 404 si no existe.

## Catálogo

Búsqueda normalizada sin distinción de mayúsculas o acentos. Categoría y texto se combinan. Conservar filtros en query params (`q` y `categoria`). Ofrecer estado sin resultados y «Limpiar filtros». No inventar número de productos, stock ni precios. Las miniaturas cambian la imagen grande con botón accesible y estado seleccionado.

## WhatsApp

La referencia original muestra el número 3144616230. Confirmar vigencia y país antes de publicación. Para Colombia, el destino propuesto es `https://wa.me/573144616230`; usar un valor configurable. Un enlace de ficha envía solo una consulta, no crea ni confirma un pedido.

```ts
export function whatsappUrl(phone: string, product?: string) {
  const text = product
    ? `Hola, me interesa el diseño ${product}. ¿Me compartes precio, fragancias y disponibilidad?`
    : 'Hola, quisiera conocer los diseños de Bendita Gracia.';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```

No enviar datos automáticamente; la persona confirma el mensaje dentro de WhatsApp. Si se abre otra pestaña, usar rel="noopener noreferrer".

## 3D y rendimiento

Primera versión: recortes individuales de producto en WebP/AVIF y transformaciones CSS; un render plano completo del mockup no debe usarse como fondo de toda la web. Mantener texto y controles en HTML real. Los PNG de este paquete no sustituyen los assets individuales.

Un visor 360 requiere archivos GLB/GLTF y texturas creados y aprobados aparte; fotos por sí solas no garantizan reconstrucción exacta. Solo añadir Three.js o un visor equivalente cuando existan esos modelos. Cargarlo de forma diferida con fallback a imagen. No afirmar que el efecto CSS ofrece rotación libre del objeto.

Usar imágenes con dimensiones explícitas y tamaños responsive. Priorizar solo la imagen principal del hero y diferir las inferiores. Evitar vídeos y librerías pesadas en el arranque.

## Accesibilidad

HTML semántico con header/nav/main/footer y un H1 por página. Foco visible, enlace para saltar contenido, etiquetas en filtros y nombres accesibles en flechas. Carrusel operable con teclado, indicador de diapositiva y sin cambios automáticos inesperados. Menú móvil con aria-expanded, cierre mediante Escape y retorno de foco. No depender del hover. Textos alternativos descriptivos sin exageraciones.

## Validación y publicación

- Probar anchos 360, 390, 768, 1024 y 1440 px sin desbordamiento horizontal.
- Comprobar búsqueda combinada, filtros persistidos, cero resultados y 404.
- Verificar galería, navegación sticky, enlaces de secciones desde rutas internas y menú móvil con teclado.
- Comprobar WhatsApp con tildes y caracteres especiales sin enviar mensajes de prueba.
- Verificar reduced-motion, contraste, foco y textos alternativos.
- Ejecutar comprobación de tipos, lint configurado y build del proyecto; probar rutas en modo producción.
- Añadir metadata, sitemap, robots e imágenes sociales con información aprobada. No crear datos estructurados con precios, dirección o reseñas inventados.
- Desplegar solo después de aprobar contenido; esta entrega no publica ni implementa el sitio.

## Componentes para cera derretida

Crear `WaxEdge`, `WaxFrame` y `WaxButton`, reutilizables y sin dependencia de WebGL. Renderizar el borde como SVG decorativo con curvas Bézier; utilizar `viewBox` y rutas específicas por breakpoint para evitar deformar las gotas. Para extender la composición usar pseudoelementos y sombras discretas. Las imágenes deben recortarse dentro de un contenedor interior; el borde exterior mantiene `overflow: visible` para no cortar gotas. El SVG es `aria-hidden="true"`, `focusable="false"` y `pointer-events: none`; no incluir texto dentro del borde.

Separar la capa de decoración de los enlaces y botones reales. Reservar el margen de goteo en el layout: ninguna gota tapa el siguiente control. Mantener foco visible por fuera del área interactiva. Para el menú sticky, no aplicar transform al contenedor sticky; animar solo la capa decorativa o el producto. No usar filtros SVG de turbulencia a pantalla completa ni animar blur/sombras continuamente.

Variables propuestas: `--wax-depth: 6px`, `--wax-drip: 16px`, `--wax-highlight: rgba(255,255,255,.32)`. En móvil reducir profundidad a 3px y goteo a 8px. Fondo de WaxButton según token; el texto mantiene contraste suficiente. La animación opcional de entrada dura 350–500ms, no cambia el área pulsable y se elimina con reduced-motion.

Verificar adicionalmente que las gotas no se corten, no generen scroll horizontal, no tapen las etiquetas ni el foco; comprobar navegación sticky con el borde visible. Validar los cuatro mockups como referencias de una misma familia visual. Ningún acabado implica que el sitio esté implementado: este paquete sigue siendo diseño y especificación.
