// Titles match the home cards; notes come from the brand's price document where it provides one.
export const categories = [
  { id: 'velas-decorativas', name: 'Sets decorativos', note: 'Pequeños detalles, grandes intenciones' },
  { id: 'wax-melts', name: 'Wax melts', note: 'Aromas premium para tu quemador' },
  { id: 'wax-sachet', name: 'Wax sachet', note: 'Tabletas aromáticas para tus espacios' },
  { id: 'temporada', name: 'Temporada navideña', note: 'Creaciones para celebrar la Navidad' },
  { id: 'detalles-unicos', name: 'Detalles únicos', note: 'Velas florales para regalar y decorar' },
] as const;

export type Category = typeof categories[number]['id'];

// Earlier category links keep filtering after the catalog was regrouped.
const legacyCategories: Record<string, Category> = { 'velas-florales': 'velas-decorativas', 'figuras-en-cera': 'velas-decorativas' };

export function resolveCategory(id: string): Category | '' {
  return categories.find(item => item.id === id)?.id ?? legacyCategories[id] ?? '';
}

export type Variant = { label: string; priceCOP: number };
/** A choice the customer makes; `values: null` means free text. */
export type ProductOption = { id: string; label: string; values: readonly string[] | null };
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  images: { src: string; alt: string; illustrative: boolean }[];
  /** Lowest published price, or null while the brand has not confirmed one. */
  priceCOP: number | null;
  variants: Variant[];
  options: ProductOption[];
  dimensions: string | null;
  fragrances: readonly string[] | null;
  scentless: boolean;
  details: { label: string; value: string }[];
  availability: 'unconfirmed' | 'available' | 'unavailable';
};

// Commercial data below is transcribed from «Información página web - Bendita Gracia.docx».
const fragrances = ['Yogurt de fresa', 'Lavanda', 'Frutos rojos', 'Manzana canela', 'Sueño tropical', 'Bergamota', 'Pino de navidad', 'Verbena rosa', 'Café', 'Sándalo'] as const;
const meltShapes = ['Estrellas', 'Corazones', 'Flores', 'De mar', 'Nubes', 'Cubos'] as const;
const fragranceOption: ProductOption = { id: 'fragancia', label: 'Fragancia', values: fragrances };
const colorOption: ProductOption = { id: 'color', label: 'Color', values: null };

type Commercial = Partial<Pick<Product, 'variants' | 'options' | 'dimensions' | 'fragrances' | 'scentless' | 'details'>>;

const designs: [string, string, Category, string, Commercial?][] = [
  ['peonia-en-recipiente', 'Peonía en recipiente', 'detalles-unicos', 'Peonía en recipiente con detalles florales y un lazo decorativo.', { variants: [{ label: '1 unidad', priceCOP: 21900 }] }],
  ['set-florero-margaritas-peonia', 'Set florero margaritas + peonía en base de cerámica', 'velas-decorativas', 'Set de florero con margaritas y peonía sobre una base de cerámica.', { variants: [{ label: 'Set completo', priceCOP: 39900 }] }],
  ['wax-melts', 'Wax melts', 'wax-melts', 'Trocitos de cera cargados de aromas premium: al ponerse sobre un quemador destilan todo su aroma. Elige la forma, la cantidad en gramos, el color y la fragancia.', {
    variants: [{ label: '75 gr', priceCOP: 18000 }, { label: '100 gr', priceCOP: 30000 }],
    options: [{ id: 'forma', label: 'Forma', values: meltShapes }, fragranceOption, colorOption], fragrances,
  }],
  ['kit-pebetero', 'Kit de pebetero', 'wax-melts', 'Pebetero, wax melts de 75 gr, 2 velas tealight y cerillos de madera en frasco de vidrio con pegatina de fricción para encender.', {
    variants: [{ label: 'Kit completo', priceCOP: 74900 }],
    options: [{ id: 'forma-pebetero', label: 'Forma del pebetero', values: null }, { id: 'forma', label: 'Forma de los wax melts', values: meltShapes }, fragranceOption], fragrances,
  }],
  ['figuras-navidenas', 'Figuras navideñas', 'temporada', 'Diferentes figuras en cera de soya, solas o en kit. Elige color y fragancia.', {
    variants: [{ label: '1 unidad', priceCOP: 9990 }, { label: 'Kit x 2 unidades', priceCOP: 17900 }, { label: 'Kit x 3 unidades', priceCOP: 26900 }],
    options: [colorOption, fragranceOption], dimensions: '7 cm de alto', fragrances,
  }],
  ['noche-de-velitas', 'Noche de velitas', 'temporada', 'Velitas de colores presentadas en caja para la noche de velitas. No llevan fragancia.', {
    variants: [{ label: '5 unidades', priceCOP: 14900 }], dimensions: '7,5 × 1,5 cm', scentless: true,
    // The star-topped candles on a pearl base (formerly «Figuras con estrella») are a reference look for this line.
    options: [{ id: 'referencia', label: 'Referencia', values: ['Velitas en caja', 'Velitas sobre base de perlas'] }],
  }],
  ['velitas-de-peticiones', 'Velitas de peticiones', 'temporada', 'Velitas en forma de estrella con base en madera, cada una con una petición. No llevan fragancia.', {
    variants: [{ label: '8 unidades', priceCOP: 18000 }], dimensions: '4,5 cm aprox.', scentless: true,
    details: [{ label: 'Peticiones', value: 'Creer, Soñar, Amar, Crear, Fluir, Vivir, Dar, Orar' }],
  }],
  ['sachet-botanico', 'Sachet botánico', 'wax-sachet', 'Tabletas aromáticas botánicas y naturales con semillas secas, para aromatizar tus espacios.', { variants: [{ label: '1 unidad', priceCOP: 12900 }] }],
  ['sachet-floral', 'Sachet minimalista', 'wax-sachet', 'Tabletas aromáticas minimalistas y modernas con elementos 3D: flores, elementos marinos u hojas secas.', { variants: [{ label: '1 unidad', priceCOP: 9900 }] }],
  ['sachet-navideno', 'Sachet de temporada', 'temporada', 'Tabletas aromáticas navideñas para colgar y aromatizar tus espacios.', { variants: [{ label: '1 unidad', priceCOP: 11900 }] }],
];

// Sharper earlier photographs lead where a line has them; the smaller document photos follow.
const photographs: Record<string, [string, string][]> = {
  'peonia-en-recipiente': [['peonia-en-recipiente', 'Peonía marfil en recipiente rosa con flores pequeñas y lazo']],
  'set-florero-margaritas-peonia': [['set-florero-margaritas-peonia', 'Florero de margaritas y peonía morada sobre una base de cerámica']],
  'wax-melts': [['wax-melts-corazones-quemador', 'Wax melts de corazones rojos y rosados junto a un quemador con vela encendida'], ['wax-melts-estrellas', 'Wax melts en forma de estrella en tonos pastel'], ['wax-melts-nubes', 'Wax melts en forma de nube sobre una bandeja'], ['wax-melts-corazones-colores', 'Wax melts de corazones en seis colores'], ['wax-melts-mar', 'Wax melts en formas de mar: conchas y estrellas']],
  'kit-pebetero': [['kit-pebetero-navidad', 'Kit con pebetero, velas tealight, cerillos y wax melts navideños'], ['kit-pebetero-caja', 'Kit de pebetero presentado en caja con wax melts, velas tealight y cerillos']],
  'figuras-navidenas': [['figuras-navidenas', 'Figuras de árbol y reno con lazos color vino'], ['copos-en-caja', 'Copos de nieve en cajas con lazos rojos'], ['figura-arbol-caja', 'Figura de árbol navideño en cera de soya dentro de su caja'], ['figuras-kit-x2', 'Kit de dos figuras navideñas en cera de soya'], ['figuras-kit-x3', 'Kit de tres figuras navideñas en caja: copo, árbol y galleta']],
  'noche-de-velitas': [['noche-de-velitas', 'Velitas de colores encendidas frente a sus cajas'], ['figuras-con-estrella', 'Velitas de estrella con peticiones sobre una base de perlas']],
  'velitas-de-peticiones': [['velitas-peticiones-estrella', 'Velitas de estrella encendidas sobre el césped junto a su caja']],
  'sachet-botanico': [['sachet-botanico-trio', 'Tres sachets botánicos con pétalos, canela y anís, en bolsas con lazos'], ['sachet-botanico', 'Sachets con detalles botánicos en bolsas de tul'], ['sachet-botanico-rosa', 'Sachet con pequeños detalles botánicos rosados'], ['sachet-botanico-especias', 'Sachets botánicos con canela, anís estrellado y pétalos en bolsas de tul']],
  'sachet-navideno': [['sachet-navideno', 'Sachets colgantes con motivos navideños'], ['sachet-en-caja', 'Presentación de sachets en cajas con ventana'], ['sachet-navidad-colgantes', 'Sachets navideños colgantes de estrella, corona y etiqueta']],
  'sachet-floral': [['sachet-flor-azul', 'Sachet con flor azul en relieve'], ['sachet-flor-rosa', 'Sachet con flor rosa en relieve'], ['sachet-flores-conjunto', 'Sachets con flores azul y rosa en bolsas de tul'], ['sachet-flor-empaque', 'Sachet con flor azul y lazo en su empaque'], ['sachet-minimalista-flores', 'Sachets minimalistas con flores en relieve y cintas']],
};

export const products: Product[] = designs.map(([slug, name, category, description, commercial = {}]) => {
  const variants = commercial.variants ?? [];
  return {
    id: slug, slug, name, category, description,
    images: photographs[slug]
      ? photographs[slug].map(([file, label]) => ({ src: `/images/originals/${file}.webp`, alt: `Fotografía: ${label.toLowerCase()}`, illustrative: false }))
      : [{ src: `/images/references/${slug}.webp`, alt: `Imagen ilustrativa de referencia: ${name.toLowerCase()}`, illustrative: true }],
    priceCOP: variants.length ? Math.min(...variants.map(item => item.priceCOP)) : null,
    variants, options: commercial.options ?? [], dimensions: commercial.dimensions ?? null,
    fragrances: commercial.fragrances ?? null, scentless: commercial.scentless ?? false, details: commercial.details ?? [],
    // The document gives prices, not stock.
    availability: 'unconfirmed',
  };
});

export function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

export function priceLabel(product: Product) {
  if (product.priceCOP === null) return 'Por confirmar';
  return product.variants.length > 1 ? `Desde ${formatCOP(product.priceCOP)}` : formatCOP(product.priceCOP);
}

export type OrderChoice = { variant?: number; options?: Record<string, string> };

/** WhatsApp text for a design; only published presentations and listed values are included. */
export function orderMessage(product: Product, { variant = 0, options = {} }: OrderChoice = {}) {
  if (!product.variants.length) return `Hola, me interesa el diseño ${product.name}. ¿Me compartes precio, fragancias y disponibilidad?`;
  const chosen = product.variants[variant] ?? product.variants[0];
  const lines = [`Presentación: ${chosen.label} (${formatCOP(chosen.priceCOP)})`];
  for (const option of product.options) {
    const value = options[option.id]?.trim().slice(0, 60);
    if (value && (option.values === null || option.values.includes(value))) lines.push(`${option.label}: ${value}`);
  }
  return `Hola, me interesa el diseño ${product.name}. ${lines.join('. ')}. ¿Me confirmas disponibilidad?`;
}


export function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function filterProducts(query = '', category = '') {
  const validCategory = resolveCategory(category);
  return products.filter(product =>
    (!validCategory || product.category === validCategory) &&
    normalize(product.name).includes(normalize(query)),
  );
}

export function whatsappUrl(phone: string, product?: string, message?: string) {
  if (!/^[1-9]\d{7,14}$/.test(phone)) throw new Error('Use a valid international phone number, digits only.');
  const text = message ?? (product
    ? `Hola, me interesa el diseño ${product}. ¿Me compartes precio, fragancias y disponibilidad?`
    : 'Hola, quisiera conocer los diseños de Bendita Gracia.');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '573144616230';

/** Readable form of the WhatsApp number, e.g. «+57 314 4616230» for a Colombian mobile. */
export function displayPhone(phone: string) {
  const colombian = /^57(\d{3})(\d{7})$/.exec(phone);
  return colombian ? `+57 ${colombian[1]} ${colombian[2]}` : `+${phone}`;
}
