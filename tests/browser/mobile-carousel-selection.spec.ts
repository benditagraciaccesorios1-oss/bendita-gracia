import { test, expect } from '@playwright/test';

const excluded = ['set-florero-margaritas-peonia', 'sachet-navidad-colgantes', 'kit-pebetero-navidad'];
const mobile = ['peonia-en-recipiente', 'set-tres-velas-flores', 'sachet-botanico-trio', 'figuras-kit-x3', 'chao-ano-viejo', 'velitas-peticiones-estrella'];

test('florero, Christmas sachet and pebetero leave only the mobile carousel', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 768, 900, 1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const images = page.locator('.hero-art img');
    await expect(images).toHaveCount(width < 900 ? 6 : 9);
    const sources = await images.evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
    if (width < 900) {
      expect(sources).toEqual(mobile.map(file => `/images/originals/${file}.webp`));
      await expect(page.locator('.carousel-status')).toContainText('/ 06');
    } else {
      for (const file of excluded) expect(sources).toContain(`/images/originals/${file}.webp`);
      await expect(page.locator('.hero-slide')).toHaveCount(3);
    }
  }
  // The catalogue and the original product pages must not lose these products or photographs.
  for (const [slug, file] of [['set-florero-margaritas-peonia', excluded[0]], ['sachet-navideno', excluded[1]], ['kit-pebetero', excluded[2]]]) {
    const response = await page.goto(`/catalogo/${slug}`);
    expect(response!.status()).toBe(200);
    // Gallery thumbnails use Next's optimizer; selecting one exposes the unchanged original photograph.
    await page.locator('.gallery-options button').filter({ has: page.locator(`img[src*="${file}.webp"]`) }).click();
    await expect(page.locator('.product-gallery .wax-frame img')).toHaveAttribute('src', `/images/originals/${file}.webp`);
  }
});
