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

type Rect = { x: number; y: number; width: number; height: number };

// Original catalog photos arranged in three equal portrait columns per carousel layer (S31).
const heroPhotos = [
  [['peonia-en-recipiente', 'set-tres-velas-flores', 'set-florero-margaritas-peonia'], 'Peonía, set de flores y florero'],
  [['kit-pebetero-navidad', 'sachet-botanico-trio', 'sachet-navidad-colgantes'], 'Aromas y detalles para regalar'],
  [['figuras-kit-x3', 'chao-ano-viejo', 'velitas-peticiones-estrella'], 'Luz para celebrar'],
] as const;

// The first photograph in the active three-column composition.
async function activeScene(page: Page) {
  const layer = page.locator('.hero-slide:not([aria-hidden="true"])');
  const image = layer.locator('img').first();
  await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const info = await image.evaluate(async (el: HTMLImageElement) => {
    // naturalWidth is density-corrected by srcset/sizes; decode the served file alone to read its real pixels.
    const served = new Image();
    served.src = el.currentSrc || el.src;
    await served.decode();
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      src: el.currentSrc || el.src, rect: rect.toJSON() as Rect,
      // object-fit: cover scales the photograph until it fills both sides of its box.
      scale: Math.max(rect.width / served.naturalWidth, rect.height / served.naturalHeight),
      fit: style.objectFit, transform: style.transform,
    };
  });
  return { ...info, source: sourceOf(info.src), label: layer.getByText('Imagen ilustrativa', { exact: true }), backdrop: layer.locator('.hero-backdrop') };
}

// Each photograph fills a portrait third, without a matte, blurred background, distortion or enlargement.
async function expectCoversPanel(page: Page, scene: Rect) {
  const photo = await activeScene(page);
  expect(photo.fit).toBe('cover');
  expect(photo.transform).toBe('none');
  for (const side of ['x', 'y', 'height'] as const) expect(Math.abs(photo.rect[side] - scene[side])).toBeLessThanOrEqual(1);
  expect(Math.abs(photo.rect.width - scene.width / (page.viewportSize()!.width < 900 ? 1 : 3))).toBeLessThanOrEqual(1);
  expect(photo.scale).toBeLessThanOrEqual(1);
  await expect(photo.backdrop).toHaveCount(0);
  await expect(photo.label).toHaveCount(0);
  return photo;
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
  await expect(heading).toHaveText('Bendita Gracia');
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
  // The first product photograph fills its own third of the composition.
  const photo = await expectCoversPanel(page, sceneBox);
  expect(photo.source).toBe('/images/originals/peonia-en-recipiente.webp');
  expect(await copy.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(246, 227, 225)');
  // Centered olive title in the mockup's proportions, with the description and CTA inside the pink panel.
  expect(headingBox.x).toBeGreaterThanOrEqual(copyBox.x + 40);
  expect(headingBox.x + headingBox.width).toBeLessThanOrEqual(copyBox.x + copyBox.width);
  expect(await heading.evaluate(el => getComputedStyle(el).textAlign)).toBe('center');
  expect(await heading.evaluate(el => getComputedStyle(el).color)).toBe('rgb(122, 132, 80)');
  const fontSize = await heading.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(56);
  expect(fontSize).toBeLessThanOrEqual(84);
  const cta = copy.getByRole('link', { name: 'Explorar creaciones' });
  const ctaBox = await box(cta);
  expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(copyBox.y + copyBox.height);
  expect(Math.abs(ctaBox.x + ctaBox.width / 2 - headingBox.x - headingBox.width / 2)).toBeLessThanOrEqual(4);
  // Menu directly below the hero, overlapping only its lower edge, before the category heading.
  expect(navBox.y).toBeGreaterThanOrEqual(copyBox.y + copyBox.height - 4);
  expect(navBox.y).toBeGreaterThanOrEqual(sceneBox.y + sceneBox.height - 40);
  expect(navBox.y).toBeLessThanOrEqual(sceneBox.y + sceneBox.height + 4);
  expect(navBox.y + navBox.height).toBeLessThan(kBox.y);
  // The new Christmas campaign follows the menu; the three cards remain aligned below it.
  const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
  const campaignBox = await box(campaign);
  expect(campaignBox.y).toBeGreaterThanOrEqual(navBox.y + navBox.height);
  expect(kBox.y).toBeGreaterThanOrEqual(campaignBox.y + campaignBox.height);
  const cards = page.locator('.category-card');
  await expect(cards).toHaveCount(3);
  const cardBoxes = await Promise.all((await cards.all()).map(box));
  for (const [index, card] of cardBoxes.entries()) {
    expect(Math.abs(card.y - cardBoxes[0].y)).toBeLessThanOrEqual(1);
    expect(card.width).toBeGreaterThan(card.height);
    if (index) expect(card.x).toBeGreaterThan(cardBoxes[index - 1].x + cardBoxes[index - 1].width);
    expect(card.y).toBeGreaterThanOrEqual(campaignBox.y + campaignBox.height);
  }
  await heading.scrollIntoViewIfNeeded();
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
  expect(await copy.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(246, 227, 225)');
  expect(await heading.evaluate(el => getComputedStyle(el).textAlign)).toBe('center');
  expect(Math.abs(headingBox.x + headingBox.width / 2 - 195)).toBeLessThanOrEqual(2);
  expect(await heading.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(44);
  expect(sceneBox.height).toBeGreaterThanOrEqual(150);
  const photo = await expectCoversPanel(page, sceneBox);
  expect(photo.source).toBe('/images/originals/peonia-en-recipiente.webp');
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

for (const [width, height] of [[1536, 1024], [1440, 900], [1024, 768], [390, 844]]) {
  test(`every carousel composition fills the panel in portrait thirds at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const carousel = page.getByRole('region', { name: 'Diseños destacados' });
    const sceneBox = await box(page.locator('.hero-scene'));
    const expectedFiles = width < 900 ? heroPhotos.flatMap(([files]) => [...files]).filter(file => !['set-florero-margaritas-peonia', 'sachet-navidad-colgantes', 'kit-pebetero-navidad'].includes(file)) : heroPhotos.map(([files]) => files[0]);
    for (const file of expectedFiles) {
      expect((await expectCoversPanel(page, sceneBox)).source).toBe(`/images/originals/${file}.webp`);
      await carousel.getByRole('button', { name: 'Diseño siguiente' }).click();
    }
  });
}

test('carousel fades between three original photo compositions and categories show the photo cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Diseños destacados' });
  const slide = carousel.getByRole('group');
  await expect(slide).toHaveCount(1);
  await expect(slide).toHaveAttribute('aria-label', '1 de 3: Peonía, set de flores y florero');
  await expect(page.locator('.carousel-status')).toContainText('01 / 03');
  // Inactive layers stay in place for the crossfade but are hidden from assistive technology and focus.
  const layers = carousel.locator('.hero-slide');
  await expect(layers).toHaveCount(3);
  for (const layer of (await layers.all()).slice(1)) {
    await expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(await layer.evaluate(el => (el as HTMLElement).inert)).toBe(true);
  }
  // No side previews, dots or thumbnail strip: three photographs per layer and the existing controls.
  await expect(carousel.locator('img')).toHaveCount(9);
  await expect(carousel.locator('.hero-peek, .carousel-dots')).toHaveCount(0);
  expect(await carousel.getByRole('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label'))))
    .toEqual(['Diseño anterior', 'Diseño siguiente', 'Reanudar carrusel']);
  await expect(carousel.getByRole('link')).toHaveCount(0);
  // The carousel shows real catalog photographs (S29), never the illustrative guide scenes or their label.
  expect((await carousel.locator('img').evaluateAll(images => images.map(image => (image as HTMLImageElement).src))).map(sourceOf))
    .toEqual(heroPhotos.flatMap(([files]) => files.map(file => `/images/originals/${file}.webp`)));
  await expect(carousel.locator('.illustrative')).toHaveCount(0);
  await expect(carousel.getByText('Imagen ilustrativa')).toHaveCount(0);
  for (const [index, [files, name]] of heroPhotos.entries()) {
    await expect(slide).toHaveAttribute('aria-label', `${index + 1} de 3: ${name}`);
    await expect(page.locator('.carousel-status')).toContainText(`0${index + 1} / 03`);
    for (const image of await slide.locator('img').all()) await expect(image).toHaveAttribute('alt', /^Fotografía: /);
    // Photographs are served as optimized originals, without a second lossy optimizer pass.
    for (const [slot, file] of files.entries()) await expect(slide.locator('img').nth(slot)).toHaveAttribute('src', `/images/originals/${file}.webp`);
    await carousel.getByRole('button', { name: 'Diseño siguiente' }).click();
  }
  await expect(slide).toHaveAttribute('aria-label', '1 de 3: Peonía, set de flores y florero');
  // Category cards show the three illustrations of the new home guide's creation block (S15-S16), with their printed
  // illustrative label; the uploaded photographs stay in the catalog and details. The frame follows the illustration
  // proportions, so it is neither cropped nor enlarged.
  for (const card of await page.locator('.category-card').all()) {
    const image = card.locator('img');
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    const info = await image.evaluate((el: HTMLImageElement) => ({ src: el.currentSrc || el.src, width: el.getBoundingClientRect().width, transform: getComputedStyle(el).transform }));
    expect(sourceOf(info.src)).toMatch(/^\/images\/originals\/(set-florero-margaritas-peonia|wax-melts-corazones-quemador|sachet-botanico-trio)\.webp$/);
    expect(info.width).toBeLessThanOrEqual(445 * 1.05);
    expect(info.transform).toBe('none');
    await expect(image).toHaveAttribute('alt', /^Fotografía:/);
    await expect(card.locator('.has-printed-label')).toHaveCount(0);
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
  await expect(heading).toHaveText('Bendita Gracia');
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


test('home introduces the brand, its light-aroma-design line and its intention motto in order', async ({ page }) => {
  await page.goto('/');
  const copy = page.locator('.hero-copy');
  await expect(copy.locator('.brand-kicker')).toHaveText('Luz, aroma y diseño');
  await expect(copy.locator('h1')).toHaveText('Bendita Gracia');
  await expect(copy.locator('.hero-description')).toHaveText('Pequeños detalles, grandes intenciones');
  await expect(copy).not.toContainText('Detalles que florecen');
  const text = (await copy.innerText()).replace(/\s+/g, ' ');
  expect(text.indexOf('Luz, aroma')).toBeLessThan(text.indexOf('Bendita Gracia'));
  expect(text.indexOf('Bendita Gracia')).toBeLessThan(text.indexOf('Pequeños detalles'));
});
