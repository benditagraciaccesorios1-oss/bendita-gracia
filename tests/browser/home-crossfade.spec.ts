import { test, expect, type Page } from '@playwright/test';

test.use({ hasTouch: true });

type Layer = { label: string | null; hidden: boolean; opacity: number; visibility: string; transform: string; translate: string; center: number; transitions: number };

// Reads the browser's running CSS opacity transitions on the slide layers (Web Animations API), optionally
// frozen at a fraction of their duration, together with each layer's computed opacity and position.
function layers(page: Page, at?: number) {
  return page.evaluate(async fraction => {
    const nodes = [...document.querySelectorAll<HTMLElement>('.hero-slide')];
    const fades = () => document.getAnimations().filter(animation =>
      animation instanceof CSSTransition && animation.transitionProperty === 'opacity' && nodes.includes((animation.effect as KeyframeEffect).target as HTMLElement));
    if (fraction !== undefined) {
      for (let frame = 0; frame < 30 && fades().length < 2; frame++) await new Promise(requestAnimationFrame);
      for (const animation of fades()) {
        animation.pause();
        animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * fraction;
      }
    }
    const stage = document.querySelector('.hero-art')!.getBoundingClientRect();
    return {
      stageCenter: stage.x + stage.width / 2,
      layers: nodes.map(node => {
        const style = getComputedStyle(node);
        const photo = node.querySelector('.hero-composition')!.getBoundingClientRect();
        return {
          label: node.getAttribute('aria-label'), hidden: node.getAttribute('aria-hidden') === 'true',
          opacity: Number(style.opacity), visibility: style.visibility, transform: style.transform, translate: style.translate,
          center: photo.x + photo.width / 2, transitions: fades().filter(animation => (animation.effect as KeyframeEffect).target === node).length,
        } satisfies Layer;
      }),
    };
  }, at);
}

async function finishFades(page: Page) {
  await page.evaluate(() => document.getAnimations().filter(animation => animation instanceof CSSTransition).forEach(animation => animation.finish()));
}

for (const [width, height] of [[1536, 1024], [390, 844]]) {
  test(`slides crossfade in place without translation or blank frames at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height });
    await page.clock.install();
    await page.goto('/');
    const carousel = page.getByRole('region', { name: 'Diseños destacados' });
    const count = width < 900 ? 6 : 3;
    const labels = width < 900
      ? ['Peonía en recipiente', 'Set de 3 velas aromáticas', 'Sachet botánico']
      : ['Peonía, set de flores y florero', 'Aromas y detalles para regalar', 'Luz para celebrar'];
    await expect(carousel.getByRole('group')).toHaveAttribute('aria-label', `1 de ${count}: ${labels[0]}`);
    await expect.poll(() => page.locator('.hero-slide img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete))).toBe(true);
    await finishFades(page);

    const rest = await layers(page);
    expect(rest.layers.map(layer => layer.opacity)).toEqual(Array.from({ length: count }, (_, i) => i === 0 ? 1 : 0));
    expect(rest.layers.map(layer => layer.visibility)).toEqual(Array.from({ length: count }, (_, i) => i === 0 ? 'visible' : 'hidden'));

    await carousel.getByRole('button', { name: 'Diseño siguiente' }).click();
    await expect(carousel.getByRole('group')).toHaveAttribute('aria-label', `2 de ${count}: ${labels[1]}`);
    const middle = await layers(page, .5);
    const [outgoing, incoming] = middle.layers;
    // Both photographs are painted halfway through: the previous one fades out while the next fades in.
    expect(outgoing.transitions).toBe(1);
    expect(incoming.transitions).toBe(1);
    for (const layer of [outgoing, incoming]) {
      expect(layer.visibility).toBe('visible');
      expect(layer.opacity).toBeGreaterThan(.2);
      expect(layer.opacity).toBeLessThan(.8);
      // A fade only: no slide, zoom or offset, and every photograph stays centered in the same panel.
      expect(layer.transform).toBe('none');
      expect(layer.translate).toBe('none');
      expect(Math.abs(layer.center - middle.stageCenter)).toBeLessThanOrEqual(1);
    }
    expect(outgoing.opacity + incoming.opacity).toBeGreaterThan(.9);
    expect(middle.layers.slice(2).every(layer => layer.opacity === 0 && layer.visibility === 'hidden')).toBe(true);
    expect(incoming.hidden).toBe(false);
    expect(outgoing.hidden).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`crossfade-${width}.png`) });

    await finishFades(page);
    const done = await layers(page);
    expect(done.layers.map(layer => layer.opacity)).toEqual(Array.from({ length: count }, (_, i) => i === 1 ? 1 : 0));
    expect(done.layers.map(layer => layer.visibility)).toEqual(Array.from({ length: count }, (_, i) => i === 1 ? 'visible' : 'hidden'));

    // Automatic advance after five seconds uses the same crossfade.
    await page.mouse.move(0, height - 4);
    await page.locator('#contenido').focus();
    await page.clock.fastForward(5100);
    await expect(carousel.getByRole('group')).toHaveAttribute('aria-label', `3 de ${count}: ${labels[2]}`);
    const automatic = await layers(page, .5);
    expect(automatic.layers[1].transitions).toBe(1);
    expect(automatic.layers[2].transitions).toBe(1);
    expect(automatic.layers[2].opacity).toBeGreaterThan(.2);
    expect(automatic.layers[2].opacity).toBeLessThan(.8);
  });
}

test('reduced motion swaps photographs instantly without transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Diseños destacados' });
  await carousel.getByRole('button', { name: 'Diseño siguiente' }).click();
  await expect(carousel.getByRole('group')).toHaveAttribute('aria-label', '2 de 3: Aromas y detalles para regalar');
  const state = await layers(page);
  expect(state.layers.every(layer => layer.transitions === 0)).toBe(true);
  expect(state.layers.map(layer => layer.opacity)).toEqual([0, 1, 0]);
  expect(state.layers.map(layer => layer.visibility)).toEqual(['hidden', 'visible', 'hidden']);
});

test('status is not announced while rotating automatically and swipes still change slides', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  await page.goto('/');
  const status = page.locator('.carousel-status');
  await expect(page.getByRole('button', { name: 'Pausar carrusel' })).toBeVisible();
  await expect(status).toHaveAttribute('aria-live', 'off');
  await page.getByRole('button', { name: 'Pausar carrusel' }).click();
  await expect(status).toHaveAttribute('aria-live', 'polite');

  const scene = (await page.locator('.hero-scene').boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (dx: number) => {
    const x = scene.x + scene.width / 2;
    const y = scene.y + scene.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx / 2, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(-120);
  await expect(status).toContainText('02');
  await swipe(120);
  await expect(status).toContainText('01');
  await cdp.detach();
});
