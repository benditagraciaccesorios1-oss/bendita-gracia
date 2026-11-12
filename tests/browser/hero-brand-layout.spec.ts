import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`hero brand hierarchy and approved decoration remain intact at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const hero = page.locator('.hero-copy');
    const kicker = hero.locator('.brand-kicker');
    const title = hero.getByRole('heading', { level: 1 });
    const motto = hero.locator('.hero-description');
    await expect(kicker).toHaveText('Luz, aroma y diseño');
    await expect(title).toHaveText('Bendita Gracia');
    await expect(motto).toHaveText('Pequeños detalles, grandes intenciones');
    expect(await kicker.evaluate(el => getComputedStyle(el).color)).toBe('rgb(48, 59, 40)');
    expect(await motto.evaluate(el => getComputedStyle(el).color)).toBe('rgb(48, 59, 40)');
    expect(await title.evaluate(el => getComputedStyle(el).color)).toBe('rgb(122, 132, 80)');
    expect(await title.evaluate(el => getComputedStyle(el).textAlign)).toBe('center');
    const size = async (locator: typeof title) => locator.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(await size(title)).toBeGreaterThan(await size(kicker) * 2);
    const k = (await kicker.boundingBox())!;
    const t = (await title.boundingBox())!;
    const m = (await motto.boundingBox())!;
    const panel = (await hero.boundingBox())!;
    expect(k.y + k.height).toBeLessThanOrEqual(t.y + 1);
    expect(t.y + t.height).toBeLessThanOrEqual(m.y + 1);
    expect(Math.abs(t.x + t.width / 2 - panel.x - panel.width / 2)).toBeLessThan(2);
    await expect(hero.getByRole('link', { name: 'Explorar creaciones' })).toHaveAttribute('href', '/catalogo');
    await expect(hero.locator('.wax-edge.is-melt')).toHaveCount(1);
    await expect(page.getByRole('region', { name: 'Diseños destacados' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.hero').screenshot({ path: testInfo.outputPath(`hero-brand-${width}.png`) });
  });
}
