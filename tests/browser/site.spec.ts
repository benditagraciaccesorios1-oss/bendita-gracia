import { test, expect } from '@playwright/test';

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`home is usable without horizontal overflow at ${width}px`, async ({ page }) => {
    // The home is compact like the mockup; a short viewport leaves room to scroll past the sticky point.
    await page.setViewportSize({ width, height: 600 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bendita Gracia');
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
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByRole('searchbox').fill('PEONÍA');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Velas decorativas', exact: true }).click();
  await expect(page).toHaveURL(/categoria=velas-decorativas/);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('PEONÍA');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Wax sachet', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No encontramos ese detalle' })).toBeVisible();
  await page.getByRole('link', { name: 'Limpiar filtros', exact: true }).first().click();
  await expect(page.locator('.product-card')).toHaveCount(12);
});

test('detail gallery, consultation, internal links and 404 work', async ({ page }) => {
  await page.goto('/catalogo/peonia-en-recipiente');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Peonía en recipiente');
  await expect(page.locator('.product-facts')).toContainText('Bajo pedido');
  await page.getByRole('button', { name: 'Acercar fotografía' }).click();
  await expect(page.getByRole('button', { name: 'Acercar fotografía' })).toHaveAttribute('aria-pressed', 'true');
  const consultation = page.locator('.detail-copy').getByRole('link', { name: /Pedir por WhatsApp/ });
  const url = new URL((await consultation.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.searchParams.get('text')).toContain('Peonía en recipiente');
  await expect(consultation).toHaveAttribute('rel', 'noopener noreferrer');
  await page.getByRole('link', { name: 'Esencia', exact: true }).click();
  await expect(page).toHaveURL(/\/#esencia$/);
  await expect(page.getByRole('heading', { name: 'Luz, aroma y diseño.' })).toBeInViewport();
  const response = await page.goto('/catalogo/no-existe');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Este detalle no está en el catálogo' })).toBeVisible();
});

test('carousel advances automatically and pauses for interaction and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Pausar carrusel' })).toBeVisible();
  const status = page.locator('.carousel-status');
  await page.clock.fastForward(5100);
  await expect(status).toContainText('02');
  await page.locator('.hero-scene').hover();
  await page.clock.fastForward(10000);
  await expect(status).toContainText('02');
  await page.mouse.move(0, 890);
  await page.clock.fastForward(5100);
  await expect(status).toContainText('03');
  // Simulate the browser visibility API, not application state.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(10000);
  await expect(status).toContainText('03');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.getByRole('button', { name: 'Pausar carrusel' }).click();
  await page.mouse.move(0, 890);
  await page.locator('#contenido').focus();
  await page.clock.fastForward(10000);
  await expect(status).toContainText('03');
  await page.getByRole('button', { name: 'Reanudar carrusel' }).click();
  await page.mouse.move(0, 890);
  await page.locator('#contenido').focus();
  await page.clock.fastForward(5100);
  await expect(status).toContainText('01');
  await page.getByRole('button', { name: 'Diseño siguiente' }).focus();
  await page.clock.fastForward(10000);
  await expect(status).toContainText('01');
  await page.keyboard.press('ArrowRight');
  await expect(status).toContainText('02 / 03');
  await page.keyboard.press('ArrowLeft');
  await expect(status).toContainText('01 / 03');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(0, 890);
  await page.locator('#contenido').focus();
  await page.clock.fastForward(10000);
  await expect(status).toContainText('01');
  await expect(page.getByRole('button', { name: 'Reanudar carrusel' })).toBeDisabled();
});

test('home carousel and cards use catalog photographs while detail photographs retain full framing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const photos = page.locator('.hero-art img');
    await expect(photos).toHaveCount(width < 900 ? 6 : 9);
    // The carousel shows unlabelled product photographs (S29), as do the category cards.
    await expect(page.locator('.hero-art .illustrative')).toHaveCount(0);
    await expect(page.locator('.hero-art .is-photograph')).toHaveCount(width < 900 ? 6 : 9);
    await expect(page.locator('.category-card .has-printed-label')).toHaveCount(0);
    await expect(page.locator('.category-card .is-photograph')).toHaveCount(3);
    for (const photo of await photos.all()) {
      await expect(photo).toHaveAttribute('src', /^\/images\/originals\/[a-z0-9-]+\.webp$/);
      await expect(photo).toHaveAttribute('alt', /^Fotografía: /);
    }
    await page.goto('/catalogo/noche-de-velitas');
    const image = page.locator('.product-gallery .wax-frame img');
    await expect(image).toHaveAttribute('src', '/images/originals/noche-de-velitas.webp');
    expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
    await page.getByRole('button', { name: 'Imagen 2', exact: true }).click();
    await expect(image).toHaveAttribute('src', '/images/originals/figuras-con-estrella.webp');
    expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
  }
});

test('real product photos render without illustrative labels and gallery views remain usable', async ({ page }) => {
  await page.goto('/catalogo/noche-de-velitas');
  await expect(page.locator('.product-gallery .illustrative')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Imagen 2', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Imagen 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Imagen 2', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.product-gallery .wax-frame img')).toHaveAttribute('alt', /Fotografía/);
  expect(await page.locator('.product-gallery .wax-frame img').evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
  await page.setViewportSize({ width: 360, height: 800 });
  for (const row of await page.locator('.product-facts > div').all()) {
    const label = await row.locator('dt').boundingBox();
    const value = await row.locator('dd').boundingBox();
    expect(label!.x + label!.width).toBeLessThanOrEqual(value!.x + 1);
    expect(await row.locator('dt').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
  await page.goto('/catalogo');
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const card of await page.locator('.product-card').all()) {
      const bounds = (await card.boundingBox())!;
      expect(bounds.height).toBeLessThanOrEqual(280);
      for (const child of await card.locator('.product-image, .card-info, .card-bottom .wax-button').all()) {
        const box = (await child.boundingBox())!;
        expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
      }
    }
  }
  // Every catalog design now uses a real photograph.
  await expect(page.locator('.product-card .illustrative')).toHaveCount(0);
});

test('wax depth responds to hover and focus but stays still with reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.category-card').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  const button = page.locator('.hero-copy .wax-button');
  await button.focus();
  await expect.poll(() => button.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await page.goto('/catalogo');
  const raisedProduct = page.locator('.product-card').first();
  await raisedProduct.hover();
  await expect.poll(() => raisedProduct.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await raisedProduct.getByRole('link').first().focus();
  await page.mouse.move(0, 0);
  await expect.poll(() => raisedProduct.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await raisedProduct.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.goto('/');
  await button.focus();
  await expect(button).toBeFocused();
  expect(await button.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await card.hover();
  expect(await card.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.goto('/catalogo');
  const product = page.locator('.product-card').first();
  await product.hover();
  expect(await product.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  expect(await product.locator('img').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('wax-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('wax-mobile.png'), fullPage: true });
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
