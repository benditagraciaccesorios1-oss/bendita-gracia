import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  for (const route of ['/', '/catalogo', '/catalogo/peonia-en-recipiente']) {
    test(`Christmas atmosphere decorates ${route} without obscuring content at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const theme = page.locator('.christmas-site');
      await expect(theme).toHaveCount(1);
      const decor = page.locator('.christmas-atmosphere');
      await expect(decor).toHaveAttribute('aria-hidden', 'true');
      expect(await decor.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
      await expect(page.locator('.navigation .christmas-garland')).toHaveCount(0);
      await expect(page.locator('.site-footer .christmas-garland')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`christmas-site-${width}.png`) });
    });
  }
}

test('one Christmas pause control stops the site and campaign and survives internal navigation', async ({ page }) => {
  await page.goto('/');
  const globalPause = page.getByRole('button', { name: 'Pausar ambiente navideño', exact: true });
  await globalPause.click();
  await expect(page.locator('.christmas-site')).toHaveAttribute('data-christmas-paused', 'true');
  const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
  await expect(campaign).toHaveAttribute('data-paused', 'true');
  expect(await page.locator('[data-ambient-flake]').first().evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  expect(await page.locator('.site-footer [data-christmas-light]').first().evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  await campaign.getByRole('link', { name: 'Explorar colección navideña' }).click();
  await expect(page).toHaveURL(/categoria=temporada$/);
  await expect(page.getByRole('button', { name: 'Reanudar ambiente navideño', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Reanudar ambiente navideño', exact: true }).click();
  await expect(page.locator('.christmas-site')).toHaveAttribute('data-christmas-paused', 'false');
});

test('sitewide Christmas motion is static with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/catalogo');
  const decorations = page.locator('[data-ambient-flake], [data-christmas-light]');
  expect(await decorations.count()).toBeGreaterThan(0);
  for (const element of await decorations.all()) {
    expect(await element.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  }
  await expect(page.getByRole('button', { name: 'Pausar ambiente navideño', exact: true })).toBeHidden();
});
