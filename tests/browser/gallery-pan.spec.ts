import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ hasTouch: true });

const tolerance = 1.5;

function parts(page: Page) {
  const zoom = page.getByRole('button', { name: 'Acercar fotografía' });
  const viewer = page.getByRole('group', { name: 'Fotografía ampliada' });
  return { zoom, viewer, photo: viewer.getByRole('img'), frameImage: page.locator('.product-gallery .wax-frame img') };
}

async function box(locator: Locator) {
  return (await locator.boundingBox())!;
}

// Positions snap to whole pixels, so an edge may overshoot a fractional viewer edge by under one pixel.
function expectEdge(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(1);
}

async function mouseDrag(page: Page, target: Locator, dx: number, dy: number) {
  const area = await box(target);
  const x = area.x + area.width / 2;
  const y = area.y + area.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 6 });
  await page.mouse.up();
}

async function touchDrag(page: Page, target: Locator, dx: number, dy: number) {
  const cdp = await page.context().newCDPSession(page);
  const area = await box(target);
  const x = area.x + area.width / 2;
  const y = area.y + area.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 6, y: y + dy * step / 6 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

// The enlarged photograph must always cover the viewer on any axis where it is larger.
async function expectWithinEdges(viewer: Locator, photo: Locator) {
  const v = await box(viewer);
  const p = await box(photo);
  if (p.width > v.width) {
    expect(p.x).toBeLessThanOrEqual(v.x + 0.01);
    expect(p.x + p.width).toBeGreaterThanOrEqual(v.x + v.width - 0.01);
  } else {
    expect(Math.abs(p.x + p.width / 2 - (v.x + v.width / 2))).toBeLessThanOrEqual(tolerance);
  }
  if (p.height > v.height) {
    expect(p.y).toBeLessThanOrEqual(v.y + 0.01);
    expect(p.y + p.height).toBeGreaterThanOrEqual(v.y + v.height - 0.01);
  } else {
    expect(Math.abs(p.y + p.height / 2 - (v.y + v.height / 2))).toBeLessThanOrEqual(tolerance);
  }
}

async function expectCentered(viewer: Locator, photo: Locator) {
  const v = await box(viewer);
  const p = await box(photo);
  expect(Math.abs(p.x + p.width / 2 - (v.x + v.width / 2))).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(p.y + p.height / 2 - (v.y + v.height / 2))).toBeLessThanOrEqual(tolerance);
}

for (const width of [390, 1440]) {
  test(`enlarged photographs pan with mouse, touch and keyboard within their edges at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto('/catalogo/sachet-botanico');
    const { zoom, viewer, photo, frameImage } = parts(page);
    await frameImage.scrollIntoViewIfNeeded();

    // Normal view: full framing, no gesture capture, a mouse drag does not move the photograph.
    expect(await frameImage.evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
    await expect(viewer).toHaveCount(0);
    const framed = await box(frameImage);
    await mouseDrag(page, frameImage, 80, 60);
    expect(await box(frameImage)).toEqual(framed);

    await zoom.click();
    await expect(zoom).toHaveAttribute('aria-pressed', 'true');
    await expect(viewer).toBeFocused();
    await expect(page.getByText('Arrastra la fotografía o usa las flechas del teclado para moverla')).toBeVisible();
    // Native pixel scale from the supplied 1200×1600 photograph, never an invented enlargement.
    const native = await box(photo);
    expect(Math.round(native.width)).toBe(1200);
    expect(Math.round(native.height)).toBe(1600);
    expect(await photo.getAttribute('draggable')).toBe('false');
    await expectCentered(viewer, photo);

    // Mouse drag moves the photograph by the pointer distance.
    await mouseDrag(page, viewer, 60, 40);
    const moved = await box(photo);
    expect(moved.x - native.x).toBeCloseTo(60, 0);
    expect(moved.y - native.y).toBeCloseTo(40, 0);

    // Dragging far stops at the photograph edges in both directions.
    await mouseDrag(page, viewer, 3000, 3000);
    let v = await box(viewer);
    let p = await box(photo);
    expectEdge(p.x, v.x);
    expectEdge(p.y, v.y);
    await expectWithinEdges(viewer, photo);
    await mouseDrag(page, viewer, -3000, -3000);
    v = await box(viewer);
    p = await box(photo);
    expectEdge(p.x + p.width, v.x + v.width);
    expectEdge(p.y + p.height, v.y + v.height);
    await expectWithinEdges(viewer, photo);

    // Recenter control.
    await page.getByRole('button', { name: 'Centrar fotografía' }).click();
    await expectCentered(viewer, photo);

    // Keyboard: arrows reveal the side they point to, while the viewer is focused.
    await viewer.focus();
    const before = await box(photo);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    const after = await box(photo);
    expect(after.x).toBeLessThan(before.x - 10);
    expect(after.y).toBeLessThan(before.y - 10);
    for (let i = 0; i < 60; i++) await page.keyboard.press('ArrowLeft');
    await expectWithinEdges(viewer, photo);

    // Touch drag pans the enlarged photograph instead of scrolling the page.
    await page.getByRole('button', { name: 'Centrar fotografía' }).click();
    const scrollBefore = await page.evaluate(() => scrollY);
    const touchStart = await box(photo);
    await touchDrag(page, viewer, -50, -70);
    const touchEnd = await box(photo);
    expect(touchEnd.x - touchStart.x).toBeCloseTo(-50, 0);
    expect(touchEnd.y - touchStart.y).toBeCloseTo(-70, 0);
    expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);

    // Resizing keeps the photograph within its edges.
    await mouseDrag(page, viewer, 3000, 3000);
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 860 });
    await expect.poll(async () => { const vb = await box(viewer); const pb = await box(photo); return pb.x <= vb.x + tolerance && pb.y <= vb.y + tolerance; }).toBe(true);
    await expectWithinEdges(viewer, photo);
    await page.setViewportSize({ width, height: 860 });
    await viewer.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Centrar fotografía' }).click();
    await page.screenshot({ path: testInfo.outputPath(`gallery-enlarged-${width}.png`) });

    // Escape returns to the full framed view; entering again starts centered.
    await viewer.focus();
    await page.keyboard.press('Escape');
    await expect(zoom).toHaveAttribute('aria-pressed', 'false');
    await expect(zoom).toBeFocused();
    await expect(viewer).toHaveCount(0);
    expect(await frameImage.evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');
    await zoom.click();
    await expectCentered(viewer, photo);
    await zoom.click();
    await expect(zoom).toHaveAttribute('aria-pressed', 'false');
    await expect(viewer).toHaveCount(0);
  });

  test(`normal gallery view keeps touch scrolling and small photos stay centered when enlarged at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 860 });
    await page.goto('/catalogo/rosas-rosa');
    const { zoom, viewer, photo, frameImage } = parts(page);
    await frameImage.scrollIntoViewIfNeeded();

    // Not enlarged: a vertical touch swipe over the photograph scrolls the page.
    const scrollBefore = await page.evaluate(() => scrollY);
    const framed = await box(frameImage);
    await touchDrag(page, frameImage, 0, -200);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 50);
    expect((await box(frameImage)).x).toBeCloseTo(framed.x, 0);
    await frameImage.scrollIntoViewIfNeeded();

    // Enlarging, panning, then changing image resets to the next image's full view.
    await zoom.click();
    await mouseDrag(page, viewer, 2000, 0);
    await page.getByRole('button', { name: 'Imagen 2', exact: true }).click();
    await expect(viewer).toHaveCount(0);
    await expect(frameImage).toHaveAttribute('src', '/images/originals/rosas-rosa.webp');
    expect(await frameImage.evaluate(el => getComputedStyle(el).objectFit)).toBe('scale-down');

    // 320×310 photograph: native size, centered, panning clamped to zero where it fits.
    await zoom.click();
    const small = await box(photo);
    expect(Math.round(small.width)).toBe(320);
    expect(Math.round(small.height)).toBe(310);
    await expectWithinEdges(viewer, photo);
    await mouseDrag(page, viewer, 200, 200);
    await expectWithinEdges(viewer, photo);
    await viewer.focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await expectWithinEdges(viewer, photo);
    expect((await box(photo)).x).toBeCloseTo(small.x, 0);
    await page.screenshot({ path: testInfo.outputPath(`gallery-small-${width}.png`) });
  });
}
