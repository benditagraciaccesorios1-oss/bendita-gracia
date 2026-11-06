import { test, expect, type Page } from '@playwright/test';
import { products } from '../../src/data/catalog.ts';

// Every visible image must carry enough pixels for a laptop screen scaled to 150 %, so it is never stretched.
const scale = 1.5;
test.use({ deviceScaleFactor: scale, viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });

async function stretched(page: Page) {
  await page.waitForLoadState('networkidle');
  return page.$$eval('main img, .hero img, .creation-card img', async (elements, factor) => {
    const found = [];
    for (const image of elements as HTMLImageElement[]) {
      const box = image.getBoundingClientRect();
      if (box.width <= 40 || !image.complete) continue;
      // naturalWidth is divided by the srcset density; decode the chosen file to count its real pixels.
      const file = new Image();
      file.src = image.currentSrc;
      await file.decode();
      const ratio = file.naturalWidth / file.naturalHeight;
      // object-fit scale-down/contain may draw the image smaller than its box; measure the drawn width.
      const fit = getComputedStyle(image).objectFit;
      const drawn = fit === 'cover' ? Math.max(box.width, box.height * ratio) : Math.min(box.width, box.height * ratio);
      const needed = Math.round(drawn * factor);
      if (file.naturalWidth < needed * 0.98) found.push({ src: image.currentSrc, natural: file.naturalWidth, needed });
    }
    return found;
  }, scale);
}

test('home images are sharp on scaled screens', async ({ page }) => {
  await page.goto('/');
  expect(await stretched(page)).toEqual([]);
});

test('catalog and every design page show sharp images on scaled screens', async ({ page }) => {
  await page.goto('/catalogo');
  expect(await stretched(page)).toEqual([]);
  for (const product of products) {
    await page.goto(`/catalogo/${product.slug}`);
    expect(await stretched(page), product.slug).toEqual([]);
  }
});
