import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`Christmas campaign is readable, pausable and links to the seasonal collection at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
    await expect(campaign.getByRole('heading', { name: 'Descubre la magia de nuestra colección navideña', exact: true })).toBeVisible();
    const snow = campaign.locator('[data-snowflake]').first();
    await expect(snow).toHaveAttribute('aria-hidden', 'true');
    expect(await snow.evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');
    const pause = campaign.getByRole('button', { name: 'Pausar animaciones navideñas' });
    await pause.click();
    await expect(campaign.getByRole('button', { name: 'Reanudar animaciones navideñas' })).toHaveAttribute('aria-pressed', 'true');
    expect(await snow.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
    await campaign.getByRole('button', { name: 'Reanudar animaciones navideñas' }).click();
    expect(await snow.evaluate(el => getComputedStyle(el).animationPlayState)).toBe('running');
    expect(await snow.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    await expect(campaign).not.toContainText(/descuento|%|oferta por tiempo limitado/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await campaign.screenshot({ path: testInfo.outputPath(`christmas-${width}.png`) });
    await campaign.getByRole('link', { name: 'Explorar colección navideña' }).click();
    await expect(page).toHaveURL(/categoria=temporada$/);
    await expect(page.locator('.product-card h2')).toHaveText(['Figuras navideñas', 'Noche de velitas', 'Velitas de peticiones', 'Sachet de temporada', 'Chao año viejo']);
  });
}

test('Christmas decoration stays static for reduced motion without losing the collection link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
  await expect(campaign.getByRole('link', { name: 'Explorar colección navideña' })).toBeVisible();
  for (const element of await campaign.locator('[data-snowflake], [data-light]').all()) {
    expect(await element.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  }
  await expect(campaign.getByRole('button', { name: 'Pausar animaciones navideñas' })).toBeHidden();
});


test('Christmas lights use four glass colors and the gift-shaped collection link stays keyboard accessible', async ({ page }) => {
  await page.goto('/');
  const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
  for (const bulbs of [campaign.locator('[data-light]'), page.locator('.site-footer [data-christmas-light]')]) {
    const colors = await bulbs.evaluateAll(elements => elements.slice(0, 4).map(element => getComputedStyle(element).backgroundImage));
    expect(colors).toHaveLength(4);
    expect(new Set(colors).size).toBe(4);
    expect(colors.every(color => color.includes('radial-gradient'))).toBe(true);
  }
  const gift = campaign.getByRole('link', { name: 'Explorar colección navideña' });
  await expect(gift.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await gift.focus();
  await expect(gift).toBeFocused();
  expect(await gift.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/categoria=temporada$/);
});
