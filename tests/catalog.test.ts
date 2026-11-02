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
    assert.ok(product.images.every(image => image.illustrative && image.alt));
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
