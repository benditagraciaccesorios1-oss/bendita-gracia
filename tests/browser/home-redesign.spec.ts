import { test, expect, type Locator, type Page } from '@playwright/test';

const scrollTop = (page: Page) => page.evaluate(() => Math.round(window.scrollY));
// The menu now sits below the hero, so locator.click() scrolls its sticky links into view itself; doing that during
// an anchor's smooth scroll interrupts the page. Wait for the anchor scroll to finish first, as a reader would.
const scrollSettled = (page: Page) => expect.poll(() => page.evaluate(() => new Promise<boolean>(resolve => {
  const y = window.scrollY;
  setTimeout(() => resolve(window.scrollY === y), 150);
}))).toBe(true);

const box = async (locator: Locator) => (await locator.boundingBox())!;
const sourceOf = (src: string) => decodeURIComponent(new URL(src, 'http://local').searchParams.get('url') ?? new URL(src, 'http://local').pathname);

// The visible carousel layer: its guide scene must fill the whole panel like the mockup, with its HTML label.
async function activeScene(page: Page) {
  const layer = page.locator('.hero-slide:not([aria-hidden="true"])');
  const image = layer.locator('img');
  await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const info = await image.evaluate(async (el: HTMLImageElement) => {
    // naturalWidth is density-corrected by srcset/sizes; decode the served file alone to read its real pixels.
    const served = new Image();
    served.src = el.currentSrc || el.src;
    await served.decode();
    return { src: el.currentSrc || el.src, natural: [served.naturalWidth, served.naturalHeight], rect: el.getBoundingClientRect().toJSON(), fit: getComputedStyle(el).objectFit, transform: getComputedStyle(el).transform };
  });
  return { ...info, source: sourceOf(info.src), label: layer.getByText('Imagen ilustrativa', { exact: true }) };
}

function expectFills(rect: { x: number; y: number; width: number; height: number }, scene: { x: number; y: number; width: number; height: number }) {
  expect(Math.abs(rect.x - scene.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(rect.y - scene.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(rect.width - scene.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(rect.height - scene.height)).toBeLessThanOrEqual(1);
}

test('desktop home follows the mockup: pink copy left, filled guide scene right, menu below and three category cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto('/');
  const copy = page.locator('.hero-copy');
  const scene = page.locator('.hero-scene');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const heading = page.getByRole('heading', { level: 1 });
  const categoriesHeading = page.getByRole('heading', { name: 'Explora nuestras creaciones' });
  await expect(heading).toHaveText('Detalles que florecen.');
  // Document order matches the visual order: hero copy and carousel, then the menu, then the categories.
  expect(await page.evaluate(() => {
    const [h, c, n, k] = ['h1', '[aria-roledescription="carrusel"]', 'nav', '#categories-heading'].map(selector => document.querySelector(selector)!);
    const before = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return before(h, c) && before(c, n) && before(n, k);
  })).toBe(true);
  const [copyBox, sceneBox, navBox, headingBox, kBox] = [await box(copy), await box(scene), await box(nav), await box(heading), await box(categoriesHeading)];
  // Split hero: copy ~36% from the left edge, photograph panel ~64% to the right edge.
  expect(copyBox.x).toBeLessThanOrEqual(1);
  expect(Math.abs(copyBox.width - 1536 * .36)).toBeLessThanOrEqual(40);
  expect(Math.abs(sceneBox.x - (copyBox.x + copyBox.width))).toBeLessThanOrEqual(2);
  expect(Math.abs(sceneBox.x + sceneBox.width - 1536)).toBeLessThanOrEqual(1);
  expect(sceneBox.y).toBeLessThanOrEqual(1);
  expect(Math.abs(sceneBox.y - copyBox.y)).toBeLessThanOrEqual(1);
  expect(sceneBox.height).toBeGreaterThanOrEqual(330);
  expect(sceneBox.height).toBeLessThanOrEqual(440);
  // The reference hero scene fills the panel edge to edge (no matte or letterbox) with only mild enlargement.
  const guide = await activeScene(page);
  expect(guide.source).toBe('/images/references/hero-floral.webp');
  expect(guide.fit).toBe('cover');
  expectFills(guide.rect, sceneBox);
  expect(Math.max(sceneBox.width / guide.natural[0], sceneBox.height / guide.natural[1])).toBeLessThanOrEqual(1.3);
  await expect(guide.label).toBeVisible();
  const labelBox = await box(guide.label);
  expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(sceneBox.x + sceneBox.width);
  expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(navBox.y);
  expect(await copy.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(216, 165, 161)');
  // Left-aligned wine title in the mockup's proportions, with the description and CTA inside the pink panel.
  expect(headingBox.x).toBeGreaterThanOrEqual(copyBox.x + 40);
  expect(headingBox.x + headingBox.width).toBeLessThanOrEqual(copyBox.x + copyBox.width);
  expect(await heading.evaluate(el => getComputedStyle(el).textAlign)).toMatch(/^(left|start)$/);
  expect(await heading.evaluate(el => getComputedStyle(el).color)).toBe('rgb(127, 41, 40)');
  const fontSize = await heading.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(56);
  expect(fontSize).toBeLessThanOrEqual(84);
  const cta = copy.getByRole('link', { name: 'Explorar creaciones' });
  const ctaBox = await box(cta);
  expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(copyBox.y + copyBox.height);
  expect(Math.abs(ctaBox.x - headingBox.x)).toBeLessThanOrEqual(4);
  // Menu directly below the hero, overlapping only its lower edge, before the category heading.
  expect(navBox.y).toBeGreaterThanOrEqual(copyBox.y + copyBox.height - 4);
  expect(navBox.y).toBeGreaterThanOrEqual(sceneBox.y + sceneBox.height - 40);
  expect(navBox.y).toBeLessThanOrEqual(sceneBox.y + sceneBox.height + 4);
  expect(navBox.y + navBox.height).toBeLessThan(kBox.y);
  // Category heading and the three cards (wider than tall, like the new home guide) share one row inside the first screen.
  const cards = page.locator('.category-card');
  await expect(cards).toHaveCount(3);
  const cardBoxes = await Promise.all((await cards.all()).map(box));
  for (const [index, card] of cardBoxes.entries()) {
    expect(Math.abs(card.y - cardBoxes[0].y)).toBeLessThanOrEqual(1);
    expect(card.width).toBeGreaterThan(card.height);
    if (index) expect(card.x).toBeGreaterThan(cardBoxes[index - 1].x + cardBoxes[index - 1].width);
    expect(card.y + card.height).toBeLessThanOrEqual(1024);
  }
  await expect(heading).toBeInViewport();
  await expect(nav).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // The menu becomes sticky once the hero scrolls away; the compact page needs a short viewport to scroll that far.
  await page.setViewportSize({ width: 1536, height: 600 });
  await page.mouse.wheel(0, 700);
  await expect.poll(async () => (await box(nav)).y).toBeLessThanOrEqual(24);
  expect((await box(nav)).y).toBeGreaterThanOrEqual(0);
});

test('mobile home stacks pink copy above the guide scene, then the menu and stacked categories', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const copy = page.locator('.hero-copy');
  const scene = page.locator('.hero-scene');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const heading = page.getByRole('heading', { level: 1 });
  const [copyBox, sceneBox, navBox, headingBox] = [await box(copy), await box(scene), await box(nav), await box(heading)];
  expect(copyBox.y).toBeLessThanOrEqual(1);
  expect(Math.abs(copyBox.width - 390)).toBeLessThanOrEqual(1);
  expect(Math.abs(sceneBox.width - 390)).toBeLessThanOrEqual(1);
  expect(sceneBox.y).toBeGreaterThanOrEqual(copyBox.y + copyBox.height - 20);
  expect(await copy.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(216, 165, 161)');
  expect(await heading.evaluate(el => getComputedStyle(el).textAlign)).toBe('center');
  expect(Math.abs(headingBox.x + headingBox.width / 2 - 195)).toBeLessThanOrEqual(2);
  expect(await heading.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(44);
  expect(sceneBox.height).toBeGreaterThanOrEqual(150);
  const guide = await activeScene(page);
  expect(guide.source).toBe('/images/references/hero-floral.webp');
  expect(guide.fit).toBe('cover');
  expectFills(guide.rect, sceneBox);
  await expect(guide.label).toBeVisible();
  const labelBox = await box(guide.label);
  expect(labelBox.y).toBeGreaterThanOrEqual(sceneBox.y);
  expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(navBox.y);
  expect(navBox.y).toBeGreaterThanOrEqual(sceneBox.y + sceneBox.height - 30);
  const cardBoxes = await Promise.all((await page.locator('.category-card').all()).map(box));
  expect(cardBoxes).toHaveLength(3);
  expect(cardBoxes[0].y).toBeGreaterThan(navBox.y + navBox.height);
  for (const [index, card] of cardBoxes.entries()) {
    if (index) expect(card.y).toBeGreaterThan(cardBoxes[index - 1].y + cardBoxes[index - 1].height);
    expect(Math.abs(card.x - cardBoxes[0].x)).toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('carousel fades between filled illustrative guide scenes and categories show the labeled guide cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Diseños destacados' });
  const slide = carousel.getByRole('group');
  await expect(slide).toHaveCount(1);
  await expect(slide).toHaveAttribute('aria-label', '1 de 4: Velas de rosas y peonía bajo domo');
  // Inactive layers stay in place for the crossfade but are hidden from assistive technology and focus.
  const layers = carousel.locator('.hero-slide');
  await expect(layers).toHaveCount(4);
  for (const layer of (await layers.all()).slice(1)) {
    await expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(await layer.evaluate(el => (el as HTMLElement).inert)).toBe(true);
  }
  // No side previews, dots or thumbnail strip: one scene per layer and three controls.
  await expect(carousel.locator('img')).toHaveCount(4);
  await expect(carousel.locator('.hero-peek, .carousel-dots')).toHaveCount(0);
  expect(await carousel.getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label'))))
    .toEqual(['Diseño anterior', 'Diseño siguiente', 'Reanudar carrusel']);
  await expect(carousel.getByRole('link')).toHaveCount(0);
  // The carousel uses the guide renders from the mockups; the real photographs are kept for the catalog.
  expect((await carousel.locator('img').evaluateAll(images => images.map(image => (image as HTMLImageElement).src))).map(sourceOf))
    .toEqual(['hero-floral', 'hero-velas-florales', 'hero-figuras', 'hero-sachet'].map(name => `/images/references/${name}.webp`));
  const sceneBox = await box(page.locator('.hero-scene'));
  const names = ['Velas de rosas y peonía bajo domo', 'Velas florales', 'Figuras en cera', 'Wax sachet'];
  for (const [index, name] of names.entries()) {
    await expect(slide).toHaveAttribute('aria-label', `${index + 1} de 4: ${name}`);
    await expect(page.locator('.carousel-status')).toContainText(`0${index + 1}`);
    await expect(slide.locator('img')).toHaveAttribute('alt', /^Imagen ilustrativa de referencia: /);
    // Guide crops are already encoded for the site; avoid an additional lossy optimizer pass.
    await expect(slide.locator('img')).toHaveAttribute('src', /^\/images\/references\/hero-/);
    const guide = await activeScene(page);
    expect(guide.fit).toBe('cover');
    expect(guide.transform).toBe('none');
    expectFills(guide.rect, sceneBox);
    await expect(guide.label).toBeVisible();
    await carousel.getByRole('button', { name: 'Diseño siguiente' }).click();
  }
  await expect(slide).toHaveAttribute('aria-label', '1 de 4: Velas de rosas y peonía bajo domo');
  // Category cards show the three illustrations of the new home guide's creation block (S15-S16), with their printed
  // illustrative label; the uploaded photographs stay in the catalog and details. The frame follows the illustration
  // proportions, so it is neither cropped nor enlarged.
  for (const card of await page.locator('.category-card').all()) {
    const image = card.locator('img');
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    const info = await image.evaluate((el: HTMLImageElement) => ({ src: el.currentSrc || el.src, width: el.getBoundingClientRect().width, transform: getComputedStyle(el).transform }));
    expect(sourceOf(info.src)).toMatch(/^\/images\/references\/home-creation-(velas-regalo|figuras-pebetero|sachets-colgantes)\.webp$/);
    expect(info.width).toBeLessThanOrEqual(445 * 1.05);
    expect(info.transform).toBe('none');
    await expect(image).toHaveAttribute('alt', /^Imagen ilustrativa: /);
    await expect(card.locator('.has-printed-label')).toHaveCount(1);
  }
});

test('Inicio always returns to the beginning of home without breaking modified clicks', async ({ page, context }) => {
  // A short viewport leaves the compact mockup home enough room to scroll past the sticky point.
  await page.setViewportSize({ width: 1440, height: 600 });
  const inicio = page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true });
  const heading = page.getByRole('heading', { level: 1 });

  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(200);
  await scrollSettled(page);
  await inicio.click();
  await expect.poll(() => scrollTop(page)).toBe(0);
  await expect(heading).toBeInViewport();

  await page.getByRole('link', { name: 'Contacto', exact: true }).click();
  await expect(page).toHaveURL(/\/#contacto$/);
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(200);
  await scrollSettled(page);
  await inicio.click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect.poll(() => scrollTop(page)).toBe(0);

  await page.goto('/#esencia');
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(200);
  await scrollSettled(page);
  await inicio.click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect.poll(() => scrollTop(page)).toBe(0);
  // Anchors still work after returning.
  await page.getByRole('link', { name: 'Esencia', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Luz, aroma y diseño.' })).toBeInViewport();

  await page.goto('/catalogo');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(200);
  await scrollSettled(page);
  await inicio.click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect(heading).toHaveText('Detalles que florecen.');
  await expect.poll(() => scrollTop(page)).toBe(0);

  // Modified clicks keep the native new-tab behavior and leave this page alone.
  // A raw pointer click: locator.click() would first scroll the sticky link into view itself.
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
  await expect.poll(() => scrollTop(page)).toBe(400);
  const box = (await inicio.boundingBox())!;
  await page.keyboard.down('ControlOrMeta');
  const [popup] = await Promise.all([context.waitForEvent('page'), page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)]);
  await page.keyboard.up('ControlOrMeta');
  await popup.waitForURL(/127\.0\.0\.1:\d+\/$/);
  await popup.close();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  expect(await scrollTop(page)).toBe(400);
  await expect(inicio).toHaveAttribute('href', '/');
});

test('mobile Inicio closes the menu and returns to the top', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#contacto');
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(200);
  await scrollSettled(page);
  const menu = page.getByRole('button', { name: /Menú|Cerrar/ });
  await menu.click();
  await page.getByRole('link', { name: 'Inicio', exact: true }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect.poll(() => scrollTop(page)).toBe(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
});
