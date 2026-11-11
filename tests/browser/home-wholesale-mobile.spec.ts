import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`retail and wholesale message is visible near home categories at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const section = page.locator('.categories-section');
    await expect(section.getByText('Adquiere cualquier producto al detal y al por mayor', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('mobile shows each of the six selected photos individually and restores desktop compositions on resize', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const scene = page.locator('.hero-scene');
  await expect(page.locator('.hero-slide')).toHaveCount(6);
  const sources = new Set<string>();
  for (let i = 0; i < 6; i++) {
    const photo = page.locator('.hero-slide.is-active img');
    await expect(photo).toHaveCount(1);
    const imageBox = (await photo.boundingBox())!;
    const stage = (await scene.boundingBox())!;
    expect(imageBox.width).toBeGreaterThanOrEqual(389);
    expect(stage.height).toBeGreaterThanOrEqual(150);
    expect(stage.height).toBeLessThanOrEqual(260);
    sources.add((await photo.getAttribute('src'))!);
    await expect(page.locator('.carousel-status')).toContainText(`0${i + 1} / 06`);
    await page.getByRole('button', { name: 'Diseño siguiente' }).click();
  }
  expect(sources.size).toBe(6);
  // Changing the viewport while a later photo is active must not leave the carousel blank.
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Diseño siguiente' }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.hero-slide')).toHaveCount(3);
  await expect(page.locator('.hero-slide.is-active img')).toHaveCount(3);
  const stage = (await scene.boundingBox())!;
  expect(stage.height).toBeLessThan(340);
  await expect(page.locator('.carousel-status')).toContainText('/ 03');
});
