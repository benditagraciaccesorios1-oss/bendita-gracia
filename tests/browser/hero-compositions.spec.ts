import { test, expect } from '@playwright/test';

const files = [
  ['peonia-en-recipiente', 'set-tres-velas-flores', 'set-florero-margaritas-peonia'],
  ['kit-pebetero-navidad', 'sachet-botanico-trio', 'sachet-navidad-colgantes'],
  ['figuras-kit-x3', 'chao-ano-viejo', 'velitas-peticiones-estrella'],
];

for (const width of [390, 1024, 1440]) {
  test(`original photo compositions reduce cropping at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const slides = page.locator('.hero-slide');
    await expect(slides).toHaveCount(3);
    await expect(page.locator('.hero-art img')).toHaveCount(9);
    await expect(page.locator('.hero-backdrop, .hero-art .illustrative')).toHaveCount(0);
    expect(await page.locator('.hero-art img').evaluateAll(images => images.map(img => img.getAttribute('src'))))
      .toEqual(files.flat().map(file => `/images/originals/${file}.webp`));
    const panel = (await page.locator('.hero-scene').boundingBox())!;
    for (let index = 0; index < 3; index++) {
      const images = page.locator('.hero-slide.is-active img');
      await expect(images).toHaveCount(3);
      for (let slot = 0; slot < 3; slot++) {
        const image = images.nth(slot);
        await expect(image).toHaveAttribute('alt', /^Fotografía:/);
        const rect = (await image.boundingBox())!;
        expect(Math.abs(rect.width - panel.width / 3)).toBeLessThan(1);
        expect(Math.abs(rect.height - panel.height)).toBeLessThan(1);
        expect(Math.abs(rect.x - panel.x - slot * panel.width / 3)).toBeLessThan(1);
        expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('cover');
      }
      await expect(page.locator('.carousel-status')).toContainText(`0${index + 1} / 03`);
      await page.getByRole('button', { name: 'Diseño siguiente' }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
