import { test, expect } from '@playwright/test';

for (const [width, height] of [[320, 568], [360, 640], [390, 667], [390, 844], [430, 740]]) {
  test(`mobile carousel leaves the menu visible without scrolling at ${width}x${height}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.locator('.hero-slide')).toHaveCount(6);
    const scene = (await page.locator('.hero-scene').boundingBox())!;
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    const menu = nav.getByRole('button', { name: 'Menú' });
    const bounds = (await nav.boundingBox())!;
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height - 8);
    expect(scene.height).toBeGreaterThanOrEqual(150);
    expect(scene.height).toBeLessThanOrEqual(260);
    // A little more photo area than the previous compact layout, while keeping the menu on screen.
    if (width === 390) expect(scene.height).toBeGreaterThanOrEqual(238);
    await expect(menu).toBeInViewport({ ratio: 1 });
    await menu.click();
    await expect(nav.getByRole('link', { name: 'Catálogo', exact: true })).toBeVisible();
  });
}
