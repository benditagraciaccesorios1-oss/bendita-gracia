import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`home is usable without horizontal overflow at ${width}px`, async ({ page }) => {
    // The home is compact like the mockup; a short viewport leaves room to scroll past the sticky point.
    await page.setViewportSize({ width, height: 600 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Detalles queflorecen.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Diseño siguiente' }).click();
    await expect(page.locator('.carousel-status')).toContainText('02');
    await page.getByRole('button', { name: 'Diseño anterior' }).click();
    await expect(page.locator('.carousel-status')).toContainText('01');
    if (width < 768) {
      const menu = page.getByRole('button', { name: /Menú|Cerrar/ });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toBeFocused();
    }
    // Scroll past the hero: the heading may already be visible before sticky activates.
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.locator('.home-nav').evaluate(el => el.getBoundingClientRect().top)).toBeLessThanOrEqual(13);
    await expect(page.locator('.navigation')).toBeInViewport();
    const stickyTop = await page.locator('.home-nav').evaluate(el => el.getBoundingClientRect().top);
    expect(stickyTop).toBeGreaterThanOrEqual(0);
  });
}

test('catalog search combines filters, persists on reload and clears empty results', async ({ page }) => {
  await page.goto('/catalogo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nuestras creaciones');
  await expect(page.locator('.product-card')).toHaveCount(10);
  await page.getByRole('searchbox').fill('PEONÍA');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByRole('link', { name: 'Velas florales', exact: true }).click();
  await expect(page).toHaveURL(/categoria=velas-florales/);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('PEONÍA');
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByRole('link', { name: 'Wax sachet', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No encontramos ese detalle' })).toBeVisible();
  await page.getByRole('link', { name: 'Limpiar filtros', exact: true }).first().click();
  await expect(page.locator('.product-card')).toHaveCount(10);
});

test('detail gallery, consultation, internal links and 404 work', async ({ page }) => {
  await page.goto('/catalogo/rosas-rosa');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vela de rosas rosa');
  await expect(page.locator('.product-facts')).toContainText('Por confirmar');
  await page.getByRole('button', { name: 'Acercar fotografía' }).click();
  await expect(page.getByRole('button', { name: 'Acercar fotografía' })).toHaveAttribute('aria-pressed', 'true');
  const consultation = page.locator('.detail-copy').getByRole('link', { name: /Consultar por WhatsApp/ });
  const url = new URL((await consultation.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.searchParams.get('text')).toContain('Vela de rosas rosa');
  await expect(consultation).toHaveAttribute('rel', 'noopener noreferrer');
  await page.getByRole('link', { name: 'Esencia', exact: true }).click();
  await expect(page).toHaveURL(/\/#esencia$/);
  await expect(page.getByRole('heading', { name: 'Luz, aroma y diseño.' })).toBeInViewport();
  const response = await page.goto('/catalogo/no-existe');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Este detalle no está en el catálogo' })).toBeVisible();
});

test('reduced motion and keyboard focus remain accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  const duration = await page.locator('.hero-art').evaluate(el => getComputedStyle(el).animationName);
  expect(duration).toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator('#contenido')).toBeFocused();
});
