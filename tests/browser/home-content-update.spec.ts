import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`home uses catalog photos and simplified essence copy at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.essence-order h3')).toHaveText('Cómo realizar tu pedido');
    await expect(page.getByText('Una propuesta de formas y texturas para descubrir pequeños detalles.', { exact: true })).toHaveCount(0);
    await expect(page.locator('.essence-motto')).toHaveText('Pequeños detalles, grandes intenciones');
    const images = page.locator('.category-grid img');
    await expect(images).toHaveCount(3);
    const files = ['set-florero-margaritas-peonia', 'wax-melts-corazones-quemador', 'sachet-botanico-trio'];
    for (const [index, file] of files.entries()) {
      await expect(images.nth(index)).toHaveAttribute('src', `/images/originals/${file}.webp`);
      await expect(images.nth(index)).toHaveAttribute('alt', /^Fotografía:/);
    }
    await expect(page.locator('.category-grid .illustrative, .category-grid .has-printed-label')).toHaveCount(0);
    await expect(page.locator('.hero-art .illustrative')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.categories-section').screenshot({ path: testInfo.outputPath(`real-creations-${width}.png`) });
  });
}
