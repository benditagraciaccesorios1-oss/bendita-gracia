# Ejecutar Bendita Gracia

La implementación usa Next.js, TypeScript y fuentes locales. Incluye portada, catálogo con búsqueda y categorías, fichas, consultas por WhatsApp e imágenes ilustrativas recortadas de los mockups, identificadas como tales. Todavía no está aprobada para publicar.

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

## Contenido y configuración

- Diseños y datos: `src/data/catalog.ts`. Los seis diseños son referencias ilustrativas, no inventario confirmado.
- Imágenes: `public/images/references`. Se generan desde `mockups/` con `python scripts/prepare-reference-images.py` (solo escenas de producto, sin la etiqueta impresa). Después de regenerarlas, borrá `.next/cache/images` para que Next no sirva las versiones anteriores. Reemplazalas por fotografías autorizadas y actualizá `images`, `alt` e `illustrative` en los datos.
- Las imágenes frontal y lateral reales están pendientes. El acercamiento actual amplía la misma ilustración, no simula una segunda fotografía ni un visor 360°.
- `NEXT_PUBLIC_WHATSAPP_PHONE`: número internacional, solo dígitos. Valor de referencia: `573144616230`; confirmá vigencia y país antes de usarlo públicamente. Se incorpora al compilar.
- `SITE_URL`: origen canónico. El valor de desarrollo es `http://localhost:3000`; para este puerto configurá `http://127.0.0.1:3107` en el entorno del proceso.
- La demo está marcada `noindex` y bloqueada en `robots.txt`. No quitar estas protecciones hasta aprobar contenido y dominio.
- No se envían mensajes automáticamente ni se confirman pedidos. No hay pagos, carrito, cuentas ni administración.

## Estado de verificación

En la reanudación pasaron las pruebas de reglas del catálogo (3/3), TypeScript, ESLint y la compilación completa de producción, incluidas las seis fichas, el catálogo, sitemap y robots. La vista local quedó disponible en http://127.0.0.1:3108 y se abrió en el navegador del sistema. Se capturaron y revisaron la portada de escritorio (1440 px) y móvil (390 px).

La primera corrida de navegador falló por reutilizar otro sitio en el puerto 3000: no constituye evidencia de fallos de Bendita Gracia. La configuración se cambió a 3107 sin reutilización. En esa corrida pasaron tres escenarios y fallaron cinco por errores en los tests (selector del menú después de cambiar de nombre y scroll insuficiente para activar sticky). Corregidos esos tests sin cambiar la aplicación, los cinco casos pasaron en una recomprobación dirigida. Los ocho escenarios tienen evidencia aprobada entre ambas corridas; el detalle está en `odd/tasks/catalogo-web.md`.

Auditoría inicial: cero vulnerabilidades de producción; 16 avisos moderados en herramientas de desarrollo, derivados de `minimatch`. No se aplicaron downgrades forzados.

La sesión que inicializó este repositorio quedó asociada a la identidad Git padre. El arnés rechazó el agente de cierre y el verificador por cambio de identidad; ninguno ejecutó tareas. La vista local y las comprobaciones funcionales ya se completaron. Para cerrar la verificación independiente pendiente, abrí una nueva sesión directamente en esta carpeta y retomá `odd/tasks/catalogo-web.md`. No hay publicación ni aprobación independiente final.
