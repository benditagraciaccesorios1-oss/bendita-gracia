import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`catalog header stays above content without overlaying products at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/catalogo');
    const header = page.locator('.internal-header');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    const heading = page.getByRole('heading', { name: 'Nuestras creaciones' });
    expect(await header.evaluate(el => getComputedStyle(el).position)).toBe('static');
    const bounds = (await nav.boundingBox())!;
    expect((await heading.boundingBox())!.y).toBeGreaterThan(bounds.y + bounds.height + 25);
    if (width < 768) {
      const menu = page.getByRole('button', { name: /Menú|Cerrar/ });
      const previousTop = (await heading.boundingBox())!.y;
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      expect((await heading.boundingBox())!.y).toBeGreaterThan(previousTop + 100);
      const expanded = (await nav.boundingBox())!;
      expect((await heading.boundingBox())!.y).toBeGreaterThan(expanded.y + expanded.height + 25);
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    }
    await page.mouse.wheel(0, 700);
    await expect.poll(() => header.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(0);
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(12);
    await cards.nth(3).scrollIntoViewIfNeeded();
    const card = (await cards.nth(3).boundingBox())!;
    const edge = (await cards.nth(3).locator('.is-melt').boundingBox())!;
    const following = (await cards.nth(width < 768 ? 4 : 6).boundingBox())!;
    expect(edge.y + edge.height).toBeLessThan(following.y);
    expect(card.height).toBeLessThanOrEqual(280);
    await page.screenshot({ path: testInfo.outputPath(`catalog-scroll-${width}.png`) });
    await page.getByRole('searchbox').fill('rosas');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(cards).toHaveCount(2);
    await cards.first().getByRole('link', { name: /Ver detalle/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vela de rosas rosa');
    // S26: after client navigation the detail page keeps the same melting, in-flow menu as the listing.
    await expect(page.locator('.internal-header .navigation > .wax-edge.is-melt')).toHaveCount(1);
    expect(await page.locator('.internal-header').evaluate(el => getComputedStyle(el).position)).toBe('static');
  });
}

test('catalog wax animates decoratively and respects reduced motion without changing photos or layout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/catalogo');
  const edges = page.locator('.catalog-page .wax-edge.is-melt');
  await expect(edges).toHaveCount(13);
  const parts = page.locator('.catalog-page .wax-drop, .catalog-page .wax-sheen');
  expect(await parts.count()).toBeGreaterThan(13);
  for (const part of await parts.all()) {
    expect(await part.evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');
    expect(await part.evaluate(el => el.getAnimations().some(animation => animation.playState === 'running'))).toBe(true);
  }
  for (const edge of await edges.all()) {
    await expect(edge).toHaveAttribute('aria-hidden', 'true');
    expect(await edge.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
  }
  expect(await page.locator('.product-card .is-photograph img').first().evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const part of await parts.all()) {
    expect(await part.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  }
  const geometry = () => page.locator('.product-card').evaluateAll(cards => cards.map(el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return [x, y, width, height];
  }));
  const before = await geometry();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(1200);
  expect(await geometry()).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
