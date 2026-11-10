import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data/catalog.ts';

test('botanical sachet uses the owner photo first and preserves existing gallery and price', () => {
  const product = products.find(item => item.slug === 'sachet-botanico')!;
  assert.equal(product.images[0].src, '/images/originals/sachet-botanico-trio.webp');
  assert.deepEqual(product.images.slice(1).map(image => image.src), [
    '/images/originals/sachet-botanico.webp',
    '/images/originals/sachet-botanico-rosa.webp',
    '/images/originals/sachet-botanico-especias.webp',
  ]);
  assert.equal(product.priceCOP, 12900);
  assert.equal(product.images[0].illustrative, false);
});
