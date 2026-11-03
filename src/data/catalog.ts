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
  ['sachet-botanico', 'Wax sachet botánico', 'wax-sachet', 'Formas de cera con detalles botánicos. La composición definitiva está por confirmar.'],
];

export const products: Product[] = designs.map(([slug, name, category, description]) => ({
  id: slug, slug, name, category, description,
  images: [{ src: `/images/references/${slug}.webp`, alt: `Imagen ilustrativa de referencia: ${name.toLowerCase()}`, illustrative: true }],
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
