import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProducts, products, whatsappUrl } from '../src/data/catalog.ts';

test('search ignores accents and combines with category without mutating the catalog', () => {
  const original = JSON.stringify(products);
  assert.deepEqual(filterProducts('PEONÍA', 'velas-florales').map(p => p.slug), ['peonia-en-domo', 'peonia-morada']);
  assert.equal(filterProducts('peonia', 'wax-sachet').length, 0);
  assert.equal(filterProducts('', 'unknown').length, products.length);
  assert.equal(JSON.stringify(products), original);
});

test('demonstration designs never claim unconfirmed commercial data', () => {
  for (const product of products) {
    assert.equal(product.priceCOP, null);
    assert.equal(product.dimensions, null);
    assert.equal(product.fragrances, null);
    assert.equal(product.availability, 'unconfirmed');
    assert.ok(product.images.every(image => typeof image.illustrative === 'boolean' && image.alt));
  }
});

test('uploaded photographs join matching designs without turning the palette or flyer into products', () => {
  assert.equal(products.length, 10);
  for (const slug of ['rosas-rosa', 'rosas-marfil', 'peonia-en-domo', 'figuras-con-estrella', 'sachet-botanico']) {
    const product = products.find(item => item.slug === slug)!;
    assert.ok(product.images[0].src.startsWith('/images/originals/'));
    assert.equal(product.images[0].illustrative, false);
  }
  assert.equal(products.find(item => item.slug === 'peonia-morada')!.images[0].illustrative, true);
  assert.equal(new Set(products.map(item => item.slug)).size, products.length);
  assert.ok(products.every(item => !/paleta|peppermint|folleto/i.test(item.name)));
});

test('rose designs open the uncropped photograph rather than a small enlarged crop', () => {
  for (const slug of ['rosas-rosa', 'rosas-marfil']) {
    const product = products.find(item => item.slug === slug)!;
    assert.equal(product.images[0].src, '/images/originals/rosas-conjunto.webp');
    assert.match(product.images[0].alt, /conjunto|rosa y marfil|marfil y rosa/i);
  }
});

test('WhatsApp encodes a consultation and refuses malformed destinations', () => {
  const url = new URL(whatsappUrl('573144616230', 'Peonía & rosas'));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/573144616230');
  assert.equal(url.searchParams.get('text'), 'Hola, me interesa el diseño Peonía & rosas. ¿Me compartes precio, fragancias y disponibilidad?');
  assert.equal(new URL(whatsappUrl('573144616230')).searchParams.get('text'), 'Hola, quisiera conocer los diseños de Bendita Gracia.');
  assert.throws(() => whatsappUrl('invalid'), /international/);
});
