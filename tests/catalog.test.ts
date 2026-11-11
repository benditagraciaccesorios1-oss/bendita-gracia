import test from 'node:test';
import assert from 'node:assert/strict';
import { originalImageSizes } from '../src/data/image-sizes.ts';
import { categories, filterProducts, formatCOP, orderMessage, priceLabel, products, resolveCategory, whatsappUrl } from '../src/data/catalog.ts';

// Fragrances the updated brand document lists for flowers and sachets (no pine or coffee).
const floralFragrances = ['Yogurt de fresa', 'Lavanda', 'Frutos rojos', 'Manzana canela', 'Sueño tropical', 'Bergamota', 'Verbena rosa', 'Sándalo'];

const bySlug = (slug: string) => {
  const product = products.find(item => item.slug === slug);
  assert.ok(product, `missing ${slug}`);
  return product;
};

test('search ignores accents and combines with category without mutating the catalog', () => {
  const original = JSON.stringify(products);
  assert.deepEqual(filterProducts('PEONÍA', 'velas-decorativas').map(p => p.slug), ['peonia-en-recipiente']);
  assert.equal(filterProducts('peonia', 'wax-sachet').length, 0);
  assert.equal(filterProducts('', 'unknown').length, products.length);
  assert.equal(JSON.stringify(products), original);
});

test('categories follow the home titles and old category links still filter', () => {
  assert.deepEqual(categories.map(item => [item.id, item.name]), [['velas-decorativas', 'Velas decorativas'], ['wax-melts', 'Wax melts'], ['wax-sachet', 'Wax sachet'], ['temporada', 'Temporada navideña']]);
  assert.equal(resolveCategory('velas-florales'), 'velas-decorativas');
  assert.equal(resolveCategory('figuras-en-cera'), 'velas-decorativas');
  assert.equal(resolveCategory('nada'), '');
  assert.deepEqual(filterProducts('', 'velas-florales'), filterProducts('', 'velas-decorativas'));
  assert.deepEqual(filterProducts('', 'wax-melts').map(p => p.slug), ['wax-melts', 'kit-pebetero']);
});

test('document prices, sizes and fragrance rules are published exactly', () => {
  const prices = (slug: string) => bySlug(slug).variants.map(item => [item.label, item.priceCOP]);
  assert.deepEqual(prices('wax-melts'), [['75 gr', 18000], ['100 gr', 30000]]);
  assert.deepEqual(prices('kit-pebetero'), [['Kit completo', 74900]]);
  assert.deepEqual(prices('sachet-botanico'), [['Empaque + tarjeta personalizada', 12900]]);
  assert.deepEqual(prices('sachet-floral'), [['1 unidad', 9900]]);
  assert.deepEqual(prices('sachet-navideno'), [['1 unidad', 11900]]);
  assert.deepEqual(prices('figuras-navidenas'), [['1 unidad', 9990], ['Kit x 2 unidades', 17900], ['Kit x 3 unidades', 26900]]);
  assert.deepEqual(prices('noche-de-velitas'), [['5 unidades', 14900]]);
  assert.deepEqual(prices('velitas-de-peticiones'), [['8 unidades', 18000]]);
  assert.equal(bySlug('figuras-navidenas').dimensions, '7 cm de alto');
  assert.equal(bySlug('noche-de-velitas').dimensions, '7,5 × 1,5 cm');
  assert.equal(bySlug('velitas-de-peticiones').dimensions, '4,5 cm aprox.');
  assert.equal(bySlug('sachet-navideno').dimensions, '8,5 × 5 cm aprox.');
  for (const slug of ['noche-de-velitas', 'velitas-de-peticiones']) assert.equal(bySlug(slug).scentless, true);
  assert.deepEqual(bySlug('velitas-de-peticiones').details, [{ label: 'Peticiones', value: 'Creer, Soñar, Amar, Crear, Fluir, Vivir, Dar, Orar' }]);
  const fragrances = ['Yogurt de fresa', 'Lavanda', 'Frutos rojos', 'Manzana canela', 'Sueño tropical', 'Bergamota', 'Pino de navidad', 'Verbena rosa', 'Café', 'Sándalo'];
  assert.deepEqual(bySlug('wax-melts').fragrances, fragrances);
  assert.deepEqual(bySlug('wax-melts').options.map(item => [item.id, item.values]), [['forma', ['Estrellas', 'Corazones', 'Flores', 'De mar', 'Nubes', 'Cubos']], ['fragancia', fragrances], ['color', null]]);
  assert.deepEqual(bySlug('kit-pebetero').options.map(item => item.label), ['Forma del pebetero', 'Forma de los wax melts', 'Fragancia']);
  assert.deepEqual(bySlug('figuras-navidenas').options.map(item => item.id), ['color', 'fragancia']);
});

test('only the lines the brand marks as made to order say so; the rest stay unconfirmed', () => {
  const onRequest = ['peonia-en-recipiente', 'set-florero-margaritas-peonia', 'set-tres-velas-flores', 'sachet-botanico'];
  for (const product of products) {
    assert.equal(product.availability, onRequest.includes(product.slug) ? 'on-request' : 'unconfirmed', product.slug);
    assert.ok(product.images.every(image => typeof image.illustrative === 'boolean' && image.alt));
  }
});

test('document photographs join their lines after the sharper earlier photographs', () => {
  assert.equal(products.length, 12);
  assert.equal(products.some(item => item.slug === 'copos-en-caja'), false);
  assert.deepEqual(bySlug('noche-de-velitas').options, [{ id: 'referencia', label: 'Referencia', values: ['Velitas en caja', 'Velitas sobre base de perlas'] }]);
  const images = (slug: string) => bySlug(slug).images.map(image => image.src.replace('/images/originals/', ''));
  // The star-topped candles on a pearl base are a reference look for the noche de velitas line, not a separate design.
  assert.equal(products.some(item => item.slug === 'figuras-con-estrella'), false);
  assert.deepEqual(images('noche-de-velitas'), ['noche-de-velitas.webp', 'figuras-con-estrella.webp']);
  assert.deepEqual(images('wax-melts'), ['wax-melts-corazones-quemador.webp', 'wax-melts-estrellas.webp', 'wax-melts-nubes.webp', 'wax-melts-corazones-colores.webp', 'wax-melts-mar.webp']);
  assert.deepEqual(images('figuras-navidenas'), ['figuras-navidenas.webp', 'copos-en-caja.webp', 'figura-arbol-caja.webp', 'figuras-kit-x2.webp', 'figuras-kit-x3.webp']);
  assert.deepEqual(images('sachet-navideno'), ['sachet-navideno.webp', 'sachet-en-caja.webp', 'sachet-navidad-colgantes.webp']);
  for (const product of products) assert.equal(product.images[0].illustrative, false, product.slug);
  assert.equal(new Set(products.map(item => item.slug)).size, products.length);
  assert.ok(products.every(item => !/paleta|peppermint|folleto|recordatorio/i.test(item.name)));
});

test('prices are shown in Colombian pesos, from the lowest presentation', () => {
  assert.equal(formatCOP(18000), new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(18000));
  assert.equal(priceLabel(bySlug('wax-melts')), `Desde ${formatCOP(18000)}`);
  assert.equal(priceLabel(bySlug('kit-pebetero')), formatCOP(74900));
  assert.equal(bySlug('figuras-navidenas').priceCOP, 9990);
});

test('the order message lists the chosen presentation and options only', () => {
  const melts = bySlug('wax-melts');
  assert.equal(orderMessage(melts, { variant: 1, options: { forma: 'Estrellas', fragancia: 'Lavanda', color: ' rosa pastel ' } }),
    `Hola, me interesa el diseño Wax melts. Presentación: 100 gr (${formatCOP(30000)}). Forma: Estrellas. Fragancia: Lavanda. Color: rosa pastel. ¿Me confirmas disponibilidad?`);
  assert.equal(orderMessage(melts, { variant: 0, options: { color: '  ' } }),
    `Hola, me interesa el diseño Wax melts. Presentación: 75 gr (${formatCOP(18000)}). ¿Me confirmas disponibilidad?`);
  assert.equal(orderMessage(bySlug('noche-de-velitas')),
    `Hola, me interesa el diseño Noche de velitas. Presentación: 5 unidades (${formatCOP(14900)}). ¿Me confirmas disponibilidad?`);
  assert.equal(orderMessage(bySlug('noche-de-velitas'), { options: { referencia: 'Velitas sobre base de perlas' } }),
    `Hola, me interesa el diseño Noche de velitas. Presentación: 5 unidades (${formatCOP(14900)}). Referencia: Velitas sobre base de perlas. ¿Me confirmas disponibilidad?`);
  assert.equal(orderMessage(bySlug('peonia-en-recipiente')),
    `Hola, me interesa el diseño Peonía en recipiente. Presentación: Flor diseño peonía + recipiente en concreto + lazo + yitzu + empaque (${formatCOP(14900)}). El precio final depende del empaque. ¿Me confirmas disponibilidad?`);
  // Values outside the published lists are ignored instead of being sent as a choice.
  assert.equal(orderMessage(melts, { variant: 9, options: { forma: 'Rombos' } }),
    `Hola, me interesa el diseño Wax melts. Presentación: 75 gr (${formatCOP(18000)}). ¿Me confirmas disponibilidad?`);
});

test('WhatsApp encodes a consultation and refuses malformed destinations', () => {
  const url = new URL(whatsappUrl('573144616230', 'Peonía & rosas'));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/573144616230');
  assert.equal(url.searchParams.get('text'), 'Hola, me interesa el diseño Peonía & rosas. ¿Me compartes precio, fragancias y disponibilidad?');
  assert.equal(new URL(whatsappUrl('573144616230')).searchParams.get('text'), 'Hola, quisiera conocer los diseños de Bendita Gracia.');
  const message = orderMessage(bySlug('wax-melts'), { variant: 0 });
  assert.equal(new URL(whatsappUrl('573144616230', undefined, message)).searchParams.get('text'), message);
  assert.throws(() => whatsappUrl('invalid'), /international/);
});

test('every product photograph has enough pixels to look sharp on scaled screens', () => {
  for (const product of products) {
    for (const image of product.images.filter(item => !item.illustrative)) {
      const size = originalImageSizes[image.src];
      assert.ok(size, `missing size for ${image.src}`);
      assert.ok(size[0] >= 800, `${image.src} is only ${size[0]} px wide`);
      assert.ok(Math.max(...size) <= 1600, `${image.src} is larger than needed`);
    }
  }
});


test('only priced designs remain and the two new peony products use confirmed prices', () => {
  assert.ok(products.every(product => product.priceCOP !== null && product.priceCOP > 0));
  for (const slug of ['rosas-rosa', 'rosas-marfil', 'peonia-en-domo', 'peonia-morada']) {
    assert.equal(products.some(product => product.slug === slug), false, slug);
  }
  assert.equal(bySlug('peonia-en-recipiente').priceCOP, 14900);
  assert.equal(bySlug('set-florero-margaritas-peonia').priceCOP, 39900);
  assert.deepEqual(bySlug('peonia-en-recipiente').images.map(image => image.src), ['/images/originals/peonia-en-recipiente.webp']);
  assert.deepEqual(bySlug('set-florero-margaritas-peonia').images.map(image => image.src), ['/images/originals/set-florero-margaritas-peonia.webp']);
});

test('Christmas designs belong to the separate seasonal line with prices preserved', () => {
  assert.ok(categories.some(category => category.id === 'temporada' && category.name === 'Temporada navideña'));
  assert.deepEqual(filterProducts('', 'temporada').map(product => product.slug), ['figuras-navidenas', 'noche-de-velitas', 'velitas-de-peticiones', 'sachet-navideno', 'chao-ano-viejo']);
  assert.equal(bySlug('figuras-navidenas').priceCOP, 9990);
  assert.equal(bySlug('sachet-navideno').priceCOP, 11900);
  assert.equal(bySlug('wax-melts').category, 'wax-melts');
  assert.equal(bySlug('sachet-botanico').category, 'wax-sachet');
});


test('all flowers share decorativas and the removed unique-details link keeps working', () => {
  assert.deepEqual(filterProducts('', 'velas-decorativas').map(p => p.slug), ['peonia-en-recipiente', 'set-florero-margaritas-peonia', 'set-tres-velas-flores']);
  assert.deepEqual(filterProducts('', 'detalles-unicos'), filterProducts('', 'velas-decorativas'));
  assert.equal(bySlug('figuras-navidenas').name, 'Figuras navideñas');
  assert.equal(bySlug('noche-de-velitas').priceCOP, 14900);
  assert.equal(bySlug('velitas-de-peticiones').priceCOP, 18000);
  assert.equal(products.length, 12);
});


test('flower prices are starting references and packaging remains a consultation without invented choices', () => {
  for (const slug of ['peonia-en-recipiente', 'set-florero-margaritas-peonia']) {
    const product = bySlug(slug);
    assert.equal(product.category, 'velas-decorativas');
    assert.deepEqual(product.options.map(option => [option.id, option.values]), [['color', null], ['fragancia', floralFragrances], ['empaque', null], ['tarjeta', null]]);
    assert.equal(priceLabel(product), `Desde ${formatCOP(product.priceCOP!)}`);
    assert.ok(product.details.some(detail => /detalles únicos/.test(detail.value) && /empaques/.test(detail.value)));
    assert.match(orderMessage(product, { options: { empaque: 'Consultar opciones para regalo' } }), /Empaque: Consultar opciones para regalo\. El precio final depende del empaque\./);
  }
  assert.equal(bySlug('peonia-en-recipiente').priceCOP, 14900);
  assert.equal(bySlug('set-florero-margaritas-peonia').priceCOP, 39900);
});


test('updated document: flower sets, new products and sizes are published as written', () => {
  const peony = bySlug('peonia-en-recipiente');
  assert.deepEqual(peony.variants, [{ label: 'Flor diseño peonía + recipiente en concreto + lazo + yitzu + empaque', priceCOP: 14900 }]);
  assert.equal(peony.dimensions, '5,5 cm de diámetro × 7 cm de alto aprox.');
  assert.deepEqual(peony.fragrances, floralFragrances);

  const vase = bySlug('set-florero-margaritas-peonia');
  assert.equal(vase.name, 'Set florero margaritas');
  assert.deepEqual(vase.variants, [{ label: '3 margaritas + 1 peonía + base en concreto + florero en concreto + lazo + empaque', priceCOP: 39900 }]);
  assert.equal(vase.dimensions, 'Flores de 5,5 cm de diámetro');
  assert.ok(products.every(product => !/cerámica/i.test(product.name + product.description)));

  const trio = bySlug('set-tres-velas-flores');
  assert.equal(trio.name, 'Set de 3 velas aromáticas');
  assert.equal(trio.category, 'velas-decorativas');
  assert.deepEqual(trio.variants, [{ label: '3 flores a tu elección + caja + lazo + tarjeta personalizada', priceCOP: 11900 }]);
  assert.equal(trio.priceMaxCOP, 18900);
  assert.equal(priceLabel(trio), `Desde ${formatCOP(11900)} hasta ${formatCOP(18900)}`);
  assert.equal(trio.dimensions, '5,5 cm de diámetro');
  assert.deepEqual(trio.options.map(option => [option.id, option.values]), [['flores', ['Rosa', 'Margarita', 'Peonía']], ['color', null], ['fragancia', floralFragrances], ['tarjeta', null]]);
  assert.equal(orderMessage(trio, { options: { flores: 'Margarita', tarjeta: 'Feliz Navidad, mamá' } }),
    `Hola, me interesa el diseño Set de 3 velas aromáticas. Presentación: 3 flores a tu elección + caja + lazo + tarjeta personalizada (desde ${formatCOP(11900)} hasta ${formatCOP(18900)}). Flores: Margarita. Texto de la tarjeta: Feliz Navidad, mamá. ¿Me confirmas disponibilidad?`);
  assert.deepEqual(trio.images.map(image => image.src), ['/images/originals/set-tres-velas-flores.webp']);

  const oldYear = bySlug('chao-ano-viejo');
  assert.equal(oldYear.name, 'Chao año viejo');
  assert.equal(oldYear.category, 'temporada');
  assert.deepEqual(oldYear.variants, [{ label: 'Año viejo + cerillos + caja', priceCOP: 19900 }]);
  assert.equal(priceLabel(oldYear), formatCOP(19900));
  assert.equal(oldYear.dimensions, '10 cm');
  assert.deepEqual(oldYear.details, [{ label: 'Material', value: 'Cera de soya' }]);
  assert.equal(oldYear.fragrances, null);
  assert.deepEqual(oldYear.images.map(image => image.src), ['/images/originals/chao-ano-viejo.webp']);

  const sachet = bySlug('sachet-botanico');
  assert.match(sachet.description, /closets, cajones, baños y vehículos/);
  assert.deepEqual(sachet.variants, [{ label: 'Empaque + tarjeta personalizada', priceCOP: 12900 }]);
  assert.equal(sachet.dimensions, '8,5 × 5 cm');
  assert.deepEqual(sachet.fragrances, floralFragrances);
  // The sachet price is fixed: packaging type is part of the WhatsApp personalization, not a price option.
  assert.deepEqual(sachet.options.map(option => option.id), ['color', 'fragancia', 'tarjeta']);
  assert.equal(priceLabel(sachet), formatCOP(12900));

  assert.equal(bySlug('wax-melts').dimensions, 'Entre 1 y 3 cm');
  assert.equal(bySlug('kit-pebetero').dimensions, 'Entre 1 y 3 cm, según las figuras');
  for (const slug of ['peonia-en-recipiente', 'set-florero-margaritas-peonia', 'set-tres-velas-flores', 'sachet-botanico']) {
    assert.ok(bySlug(slug).details.some(detail => detail.label === 'Personalización' && /WhatsApp/.test(detail.value)), slug);
  }
});

test('a card message keeps up to 120 characters while other free text stays at 60', () => {
  const text = 'x'.repeat(150);
  const message = orderMessage(bySlug('set-tres-velas-flores'), { options: { tarjeta: text, color: text } });
  assert.match(message, new RegExp(`Texto de la tarjeta: x{120}\.`));
  assert.match(message, new RegExp(`Color: x{60}\.`));
});
