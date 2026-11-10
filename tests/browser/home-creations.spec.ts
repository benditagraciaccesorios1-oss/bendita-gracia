import { test, expect, type Locator, type Page } from '@playwright/test';

// Real catalog photos above the existing category titles and attached tinted description panels.
const creations = [
  { id: 'velas-decorativas', name: 'Sets decorativos', note: 'Pequeños detalles, grandes intenciones', art: 'set-florero-margaritas-peonia' },
  { id: 'wax-melts', name: 'Wax Melts', note: 'Aromas premium para tu quemador', art: 'wax-melts-corazones-quemador' },
  { id: 'wax-sachet', name: 'Wax Sachet', note: 'Tabletas aromáticas para tus espacios', art: 'sachet-botanico-trio' },
];
const photoSizes = [[940, 1412], [944, 1384], [1376, 1204]];

const box = async (locator: Locator) => (await locator.boundingBox())!;
const sourceOf = (src: string) => decodeURIComponent(new URL(src, 'http://local').searchParams.get('url') ?? new URL(src, 'http://local').pathname);
const inside = (inner: { x: number; y: number; width: number; height: number }, outer: { x: number; y: number; width: number; height: number }) =>
  inner.x >= outer.x - 1 && inner.y >= outer.y - 1 && inner.x + inner.width <= outer.x + outer.width + 1 && inner.y + inner.height <= outer.y + outer.height + 1;

async function cardParts(page: Page) {
  const cards = page.locator('.category-grid').getByRole('link');
  await expect(cards).toHaveCount(3);
  const parts = [];
  for (const card of await cards.all()) {
    // The link itself is the bounded card.
    const frame = card;
    const image = frame.locator('img');
    const title = frame.getByRole('heading', { level: 3 });
    const note = frame.locator('p');
    await expect(image).toHaveCount(1);
    await expect(note).toHaveCount(1);
    parts.push({ card, frame, image, title, note, boxes: { card: await box(card), frame: await box(frame), image: await box(image.locator('xpath=..')), title: await box(title), note: await box(note) } });
  }
  return parts;
}

for (const [label, width, height] of [['desktop', 1536, 1024], ['mobile', 390, 844]] as const) {
  test(`${label} creation cards show the catalog photograph above the title and description inside one bounded card`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const parts = await cardParts(page);
    for (const [index, { card, image, title, note, boxes }] of parts.entries()) {
      const creation = creations[index];
      await expect(card).toHaveAttribute('href', `/catalogo?categoria=${creation.id}`);
      await expect(title).toHaveText(creation.name);
      await expect(note).toHaveText(creation.note);
      await expect(note).toBeVisible();
      // Serve the same real photograph as the catalog, without an illustrative label or extra recompression.
      await expect(image).toHaveAttribute('alt', /^Fotografía:/);
      await expect(image).toHaveAttribute('src', `/images/originals/${creation.art}.webp`);
      await expect(card.locator('.product-image.is-photograph')).toHaveCount(1);
      await expect(card.locator('.illustrative')).toHaveCount(0);
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      const shown = await image.evaluate(async (el: HTMLImageElement) => {
        const served = new Image();
        served.src = el.currentSrc || el.src;
        await served.decode();
        const rect = el.getBoundingClientRect();
        return { natural: [served.naturalWidth, served.naturalHeight], size: [rect.width, rect.height] };
      });
      expect(shown.natural).toEqual(photoSizes[index]);
      expect(shown.size[0]).toBeLessThanOrEqual(photoSizes[index][0]);
      expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
      // Image block, then title, then description, without overlapping, all inside the same framed card.
      expect(boxes.image.y + boxes.image.height).toBeLessThanOrEqual(boxes.title.y + 1);
      expect(boxes.title.y + boxes.title.height).toBeLessThanOrEqual(boxes.note.y + 1);
      for (const part of [boxes.image, boxes.title, boxes.note]) expect(inside(part, boxes.frame)).toBe(true);
      expect(inside(boxes.frame, boxes.card)).toBe(true);
      // The scene fills the card top edge to edge like the guide (only the 1px border around it); the text sits on
      // the tinted body attached below it.
      expect(boxes.image.width).toBeGreaterThanOrEqual(boxes.frame.width - 3);
      expect(boxes.image.y - boxes.frame.y).toBeLessThanOrEqual(2);
      expect(await card.evaluate(el => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(12);
      const body = card.locator('.creation-body');
      expect(await body.evaluate(el => getComputedStyle(el).backgroundImage)).toMatch(/gradient/);
      const bodyBox = await box(body);
      expect(Math.abs(bodyBox.y - (boxes.image.y + boxes.image.height))).toBeLessThanOrEqual(2);
      expect(Math.abs(bodyBox.y + bodyBox.height - (boxes.frame.y + boxes.frame.height))).toBeLessThanOrEqual(2);
      expect(await note.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
      expect(boxes.note.height).toBeGreaterThan(0);
    }
    const frames = parts.map(part => part.boxes.frame);
    if (width >= 900) {
      // Three across, aligned on one row, all equally tall.
      for (const [index, frame] of frames.entries()) {
        expect(Math.abs(frame.y - frames[0].y)).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.height - frames[0].height)).toBeLessThanOrEqual(1);
        if (index) expect(frame.x).toBeGreaterThan(frames[index - 1].x + frames[index - 1].width);
      }
    } else {
      for (const [index, frame] of frames.entries()) {
        if (index) expect(frame.y).toBeGreaterThan(frames[index - 1].y + frames[index - 1].height);
        expect(frame.width).toBeGreaterThanOrEqual(width - 48);
      }
    }
    // Section title between decorative rules and sprigs, as in the guide; decoration stays out of the accessibility tree.
    await expect(page.getByRole('heading', { level: 2, name: 'Explora nuestras creaciones' })).toBeVisible();
    for (const sprig of await page.locator('.categories-section svg').all()) await expect(sprig).toHaveAttribute('aria-hidden', 'true');
    // The previous mockup category scenes are no longer used on home.
    await expect(page.locator('.category-grid img[src*="category-"]')).toHaveCount(0);
    // Only headings changed; the reference marketing claims were not copied.
    await expect(page.getByText(/Fragancia intensa y duradera|Se colocan en cajones/i)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // Wax decoration stays out of hit testing and the accessibility tree.
    for (const edge of await page.locator('.wax-edge').all()) {
      await expect(edge).toHaveAttribute('aria-hidden', 'true');
      expect(await edge.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    }
  });
}

test('creation cards route to their catalog filter by pointer and by keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto('/');
  const cards = page.locator('.category-grid').getByRole('link');
  // The accessible name carries the title and the description.
  await expect(cards.nth(1)).toHaveAccessibleName(/Wax Melts.*Aromas premium para tu quemador/);
  // A click on the description text still follows the card link.
  await cards.nth(1).locator('p').click();
  await expect(page).toHaveURL(/\/catalogo\?categoria=wax-melts$/);
  await expect(page.getByRole('navigation', { name: 'Filtrar por categoría' }).getByRole('link', { name: 'Wax melts', exact: true })).toHaveAttribute('aria-current', 'true');

  await page.goto('/');
  // Real keyboard navigation from the previous card, so the visible focus ring applies.
  await cards.nth(1).focus();
  await page.keyboard.press('Tab');
  await expect(cards.nth(2)).toBeFocused();
  expect(await cards.nth(2).evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/catalogo\?categoria=wax-sachet$/);
  await expect(page.getByRole('link', { name: 'Wax sachet', exact: true })).toHaveAttribute('aria-current', 'true');
});

test('home wax drops and sheen move gently without moving the layout, and stay still with reduced motion', async ({ page }) => {
  const waxMotion = () => page.evaluate(() => {
    const parts = [...document.querySelectorAll('.wax-edge.is-melt .wax-drop, .wax-edge.is-melt .wax-sheen')];
    return parts.map(el => ({
      kind: el.classList.contains('wax-drop') ? 'drop' : 'sheen',
      animation: getComputedStyle(el).animationName,
      running: el.getAnimations().filter(animation => animation.playState === 'running').length,
      shown: getComputedStyle(el).display !== 'none',
    }));
  });
  const layout = () => page.evaluate(() => ['.hero-copy', 'nav', '#categories-heading', '.category-card'].map(selector => {
    const rect = document.querySelector(selector)!.getBoundingClientRect();
    return [rect.x, rect.y, rect.width, rect.height].map(Math.round);
  }));

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto('/');
  // Two melted edges on home (pink panel and menu), with five drops and two traveling reflections in total.
  await expect(page.locator('.wax-edge.is-melt')).toHaveCount(2);
  const moving = await waxMotion();
  expect(moving.filter(part => part.kind === 'drop')).toHaveLength(5);
  expect(moving.filter(part => part.kind === 'sheen')).toHaveLength(2);
  for (const part of moving) {
    expect(part.animation).not.toBe('none');
    expect(part.running).toBeGreaterThan(0);
    expect(part.shown).toBe(true);
  }
  // Wait for the card arrival animation to finish, then check that the wax motion never shifts the layout.
  await page.waitForTimeout(1000);
  const before = await layout();
  await page.waitForTimeout(1500);
  expect(await layout()).toEqual(before);
  // S26: every page keeps the melting, animated menu, including details and the not-found page.
  for (const path of ['/catalogo/noche-de-velitas', '/no-existe']) {
    await page.goto(path);
    const menu = page.locator('.internal-header .navigation > .wax-edge.is-melt');
    await expect(menu).toHaveCount(1);
    expect(await menu.locator('.wax-drop').first().evaluate(el => getComputedStyle(el).animationName), path).not.toBe('none');
    expect(await page.locator('.internal-header').evaluate(el => getComputedStyle(el).position), path).toBe('static');
    // The menu's drops do not cover the content below it.
    const edge = (await menu.boundingBox())!;
    const main = (await page.locator('main').boundingBox())!;
    expect(edge.y + edge.height, path).toBeLessThanOrEqual(main.y + 2);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const still = await waxMotion();
  expect(still).toHaveLength(7);
  for (const part of still) {
    expect(part.animation).toBe('none');
    expect(part.running).toBe(0);
    if (part.kind === 'sheen') expect(part.shown).toBe(false);
  }
});
