import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`every full product title stays inside its card at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/catalogo');
    await expect(page.locator('.product-card')).toHaveCount(10);
    const measurements = await page.locator('.product-card').evaluateAll(cards => cards.map(card => {
      const title = card.querySelector('h2')!;
      const range = document.createRange();
      range.selectNodeContents(title);
      const text = range.getBoundingClientRect();
      const info = card.querySelector('.card-info')!.getBoundingClientRect();
      const bounds = card.getBoundingClientRect();
      const bottom = card.querySelector('.card-bottom')!.getBoundingClientRect();
      const style = getComputedStyle(title);
      return { name: title.textContent, text: { left: text.left, right: text.right, bottom: text.bottom }, info: { left: info.left, right: info.right }, bounds: { bottom: bounds.bottom }, bottom: { top: bottom.top }, font: parseFloat(style.fontSize), clipped: style.textOverflow === 'ellipsis' || style.overflow === 'hidden' };
    }));
    for (const item of measurements) {
      expect(item.text.left, item.name!).toBeGreaterThanOrEqual(item.info.left - 1);
      expect(item.text.right, item.name!).toBeLessThanOrEqual(item.info.right + 1);
      expect(item.text.bottom, item.name!).toBeLessThanOrEqual(item.bounds.bottom + 1);
      expect(item.text.bottom, item.name!).toBeLessThanOrEqual(item.bottom.top + 1);
      expect(item.font, item.name!).toBeGreaterThanOrEqual(18);
      expect(item.clipped, item.name!).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`catalog-titles-${width}.png`), fullPage: true });
  });
}
