export const categories = [
  { id: 'velas-florales', name: 'Velas florales', note: 'La delicadeza de cada pétalo', image: 'category-floral' },
  { id: 'figuras-en-cera', name: 'Figuras en cera', note: 'Pequeños detalles, formas especiales', image: 'category-figures' },
  { id: 'wax-sachet', name: 'Wax sachet', note: 'Botánica en pequeños detalles', image: 'category-sachet' },
] as const;

export type Category = typeof categories[number]['id'];
export type Product = {
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

const designs: [string, string, Category, string][] = [
  ['rosas-rosa', 'Vela de rosas rosa', 'velas-florales', 'Una silueta esférica con delicados relieves de rosas, en un suave tono rosa.'],
  ['rosas-marfil', 'Vela de rosas marfil', 'velas-florales', 'Pétalos en relieve y una silueta redonda en tonos marfil.'],
  ['peonia-en-domo', 'Peonía bajo domo', 'velas-florales', 'Una composición floral en tonos marfil y lavanda bajo una cúpula transparente.'],
  ['peonia-morada', 'Peonía morada', 'velas-florales', 'Capas de pétalos abiertos en una delicada composición de color lavanda.'],
  ['figuras-con-estrella', 'Figuras con estrella', 'figuras-en-cera', 'Figuras alargadas en tonos cálidos, coronadas con una pequeña estrella.'],
  ['sachet-botanico', 'Wax sachet botánico', 'wax-sachet', 'Detalles botánicos en piezas redondas y rectangulares, presentadas en bolsas de tul.'],
  ['figuras-navidenas', 'Figuras navideñas', 'figuras-en-cera', 'Figuras de árbol y reno en tonos marfil, con lazos color vino.'],
  ['copos-en-caja', 'Copos en caja', 'figuras-en-cera', 'Figuras de copos de nieve con cintas rojas y presentación en cajas individuales.'],
  ['sachet-navideno', 'Sachet navideño', 'wax-sachet', 'Piezas colgantes con detalles de hojas, lazos y motivos navideños.'],
  ['sachet-floral', 'Sachet con flor', 'wax-sachet', 'Piezas decoradas con flores en relieve, en tonos rosa y azul.'],
];

const photographs: Record<string, [string, string][]> = {
  'rosas-rosa': [['rosas-conjunto', 'Conjunto de velas de rosas rosa y marfil sobre una base de madera'], ['rosas-rosa', 'Detalle de la vela rosa con relieves de rosas']],
  'rosas-marfil': [['rosas-conjunto', 'Conjunto de velas de rosas marfil y rosa'], ['rosas-marfil', 'Detalle de la vela marfil con relieves de rosas']],
  'peonia-en-domo': [['peonia-en-domo', 'Peonía marfil bajo domo con flores en tonos morados al fondo']],
  'figuras-con-estrella': [['figuras-con-estrella', 'Figuras alargadas con estrella sobre una base con perlas decorativas']],
  'sachet-botanico': [['sachet-botanico', 'Sachets con detalles botánicos en bolsas de tul'], ['sachet-botanico-rosa', 'Sachet con pequeños detalles botánicos rosados']],
  'figuras-navidenas': [['figuras-navidenas', 'Figuras de árbol y reno con lazos color vino']],
  'copos-en-caja': [['copos-en-caja', 'Copos de nieve en cajas con lazos rojos']],
  'sachet-navideno': [['sachet-navideno', 'Sachets colgantes con motivos navideños'], ['sachet-en-caja', 'Presentación de sachets en cajas con ventana']],
  'sachet-floral': [['sachet-flor-azul', 'Sachet con flor azul en relieve'], ['sachet-flor-rosa', 'Sachet con flor rosa en relieve'], ['sachet-flores-conjunto', 'Sachets con flores azul y rosa en bolsas de tul'], ['sachet-flor-empaque', 'Sachet con flor azul y lazo en su empaque']],
};

export const products: Product[] = designs.map(([slug, name, category, description]) => ({
  id: slug, slug, name, category, description,
  images: photographs[slug]
    ? photographs[slug].map(([file, label]) => ({ src: `/images/originals/${file}.webp`, alt: `Fotografía: ${label.toLowerCase()}`, illustrative: false }))
    : [{ src: `/images/references/${slug}.webp`, alt: `Imagen ilustrativa de referencia: ${name.toLowerCase()}`, illustrative: true }],
  priceCOP: null, dimensions: null, fragrances: null, availability: 'unconfirmed',
}));


export function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function filterProducts(query = '', category = '') {
  const validCategory = categories.some(item => item.id === category);
  return products.filter(product =>
    (!validCategory || product.category === category) &&
    normalize(product.name).includes(normalize(query)),
  );
}

export function whatsappUrl(phone: string, product?: string) {
  if (!/^[1-9]\d{7,14}$/.test(phone)) throw new Error('Use a valid international phone number, digits only.');
  const text = product
    ? `Hola, me interesa el diseño ${product}. ¿Me compartes precio, fragancias y disponibilidad?`
    : 'Hola, quisiera conocer los diseños de Bendita Gracia.';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '573144616230';
