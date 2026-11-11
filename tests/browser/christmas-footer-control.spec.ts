import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`compact Christmas pause control lives in the footer, never over the content at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/catalogo', '/catalogo/peonia-en-recipiente', '/catalogo/no-existe']) {
      await page.goto(route);
      const control = page.locator('.site-footer .christmas-motion-toggle');
      await expect(control).toHaveCount(1);
      await expect(page.locator('.christmas-motion-toggle')).toHaveCount(1);
      const style = await control.evaluate(el => ({ position: getComputedStyle(el).position, fontSize: parseFloat(getComputedStyle(el).fontSize) }));
      expect(style.position).not.toBe('fixed');
      expect(style.position).not.toBe('absolute');
      expect(style.fontSize).toBeLessThanOrEqual(11);
      await control.click();
      await expect(page.locator('.christmas-site')).toHaveAttribute('data-christmas-paused', 'true');
      await expect(control).toHaveAttribute('aria-label', 'Reanudar ambiente navideño');
      await control.click();
      await expect(page.locator('.christmas-site')).toHaveAttribute('data-christmas-paused', 'false');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
