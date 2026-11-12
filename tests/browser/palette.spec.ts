import { test, expect, type Locator, type Page } from '@playwright/test';

// Pastel palette from the client brief: pastel surfaces lead, olive carries headings and labels, soft gold only
// draws lines and rims. Café and every dark surface are retired.
const palette = {
  cream: 'rgb(250, 245, 238)',
  pink: 'rgb(246, 227, 225)',
  pinkPowder: 'rgb(243, 220, 216)',
  lavender: 'rgb(236, 230, 242)',
  sageLight: 'rgb(228, 234, 219)',
  olive: 'rgb(122, 132, 80)',
  oliveDeep: 'rgb(94, 103, 64)',
  goldSoft: 'rgb(184, 151, 90)',
  slateDeep: 'rgb(48, 59, 40)',
};
const darkText = [palette.slateDeep, palette.oliveDeep];

// Burgundy, old rose and lilac treatments of an earlier palette, then the café, dark gold and dark slate wax of
// the previous one (gold-dark, chestnut, the contact band, old gold and the dark menu and button stops).
const retired = ['127, 41, 40', '128, 29, 29', '122, 30, 29', '121, 39, 35', '130, 44, 42', '140, 30, 28', '129, 28, 27', '162, 50, 43', '169, 74, 64', '103, 34, 34', '180, 92, 80', '95, 29, 28', '182, 65, 62', '129, 38, 44', '91, 32, 30', '147, 67, 38', '180, 83, 69', '136, 31, 28', '156, 66, 58', '216, 165, 161', '239, 228, 242', '224, 209, 228', '246, 239, 247',
  '87, 55, 14', '142, 106, 12', '102, 67, 17', '165, 136, 78', '58, 37, 10', '42, 26, 6', '67, 78, 56', '31, 39, 25', '65, 76, 55', '74, 86, 63'];

type Rgba = { r: number; g: number; b: number; a: number };
const parse = (color: string): Rgba => {
  const [r, g, b, a = 1] = color.match(/[\d.]+/g)!.map(Number);
  return { r, g, b, a };
};
const over = (top: Rgba, base: Rgba): Rgba => ({ r: top.r * top.a + base.r * (1 - top.a), g: top.g * top.a + base.g * (1 - top.a), b: top.b * top.a + base.b * (1 - top.a), a: 1 });
const luminance = ({ r, g, b }: Rgba) => {
  const channel = (value: number) => { const c = value / 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
  return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
};
const ratio = (a: Rgba, b: Rgba) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
const lightness = ({ r, g, b }: Rgba) => (Math.max(r, g, b) + Math.min(r, g, b)) / 510;

// Text color and every background color behind it, up to the first opaque surface. Gradient stops count as
// separate backgrounds and translucent highlights are laid over each opaque stop, so the result is the worst case.
async function surface(locator: Locator) {
  return locator.evaluate(element => {
    const layers: string[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      const found = [...(style.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []), style.backgroundColor];
      layers.push(...found);
      if (found.some(color => color.startsWith('rgb('))) break;
    }
    return { text: getComputedStyle(element).color, layers };
  });
}

async function minContrast(locator: Locator) {
  const { text, layers } = await surface(locator);
  const colors = layers.map(parse).filter(color => color.a > 0);
  const opaque = colors.filter(color => color.a === 1);
  const backgrounds = [...opaque, ...colors.filter(color => color.a < 1).flatMap(top => opaque.map(base => over(top, base)))];
  expect(backgrounds.length).toBeGreaterThan(0);
  return Math.min(...backgrounds.map(background => ratio(over(parse(text), background), background)));
}

async function expectReadable(locator: Locator, minimum: number) {
  await expect(locator).toBeVisible();
  expect(await minContrast(locator), await locator.evaluate(el => el.outerHTML.slice(0, 90))).toBeGreaterThanOrEqual(minimum);
}

const color = (locator: Locator, property: 'color' | 'backgroundColor' | 'backgroundImage' | 'borderTopColor' | 'borderBottomColor' | 'outlineColor' | 'filter' = 'color') => locator.evaluate((el, name) => getComputedStyle(el)[name], property);

// The surface an element paints itself (background color and gradient stops) contains `token` and no opaque stop
// is darker than `minimum` HSL lightness: sections stay pastel, buttons stay light.
async function expectLightSurface(locator: Locator, token: string | null, minimum: number) {
  const own = await locator.evaluate(el => { const style = getComputedStyle(el); return [...(style.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []), style.backgroundColor]; });
  if (token) expect(own.join(' ')).toContain(token);
  const opaque = own.map(parse).filter(stop => stop.a === 1);
  expect(opaque.length, own.join(' ')).toBeGreaterThan(0);
  for (const stop of opaque) expect(lightness(stop), own.join(' ')).toBeGreaterThanOrEqual(minimum);
}

// Wax buttons: light pastel or soft-gold fill, dark readable label, and a hover state that deepens the same fill
// without turning dark or brown.
async function expectLightButton(locator: Locator, hover: boolean) {
  await expectLightSurface(locator, null, .68);
  expect(darkText).toContain(await color(locator));
  await expectReadable(locator, 4.5);
  if (!hover) return;
  const fill = async () => `${await color(locator, 'backgroundImage')} ${await color(locator, 'backgroundColor')}`;
  const before = await fill();
  await locator.hover();
  await expect.poll(fill).not.toBe(before);
  await expectLightSurface(locator, null, .6);
  await expectReadable(locator, 4.5);
  await locator.page().mouse.move(0, 0);
}

// No element, nor its ::before/::after, keeps a retired color, a brownish dark tone (hue 20–50°, lightness < 45%)
// in any paint property, or a dark background. Photographs, the WhatsApp shortcut (functional green) and the
// Christmas pine, berries and bulbs are the only exceptions.
async function expectNoBrownOrDark(page: Page) {
  const hits = await page.evaluate(list => {
    const found: string[] = [];
    const hsl = (value: string) => {
      const [r, g, b, a = 1] = value.match(/[\d.]+/g)!.map(Number);
      const [max, min] = [Math.max(r, g, b) / 255, Math.min(r, g, b) / 255];
      const l = (max + min) / 2, d = max - min;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      let h = 0;
      if (d) h = max === r / 255 ? 60 * (((g - b) / 255 / d) % 6) : max === g / 255 ? 60 * ((b - r) / 255 / d + 2) : 60 * ((r - g) / 255 / d + 4);
      return { h: (h + 360) % 360, s, l, a };
    };
    const brown = (value: string) => { const c = hsl(value); return c.a > 0 && c.s >= .15 && c.h >= 20 && c.h <= 50 && c.l < .45; };
    const dark = (value: string) => { const c = hsl(value); return c.a >= .5 && c.l < .45; };
    for (const element of document.querySelectorAll('body *')) {
      if (element.closest('img, .christmas-atmosphere, .christmas-garland, [data-light], .whatsapp-float')) continue;
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        if (pseudo && style.content === 'none') continue;
        const name = `${element.tagName.toLowerCase()}.${element.getAttribute('class') ?? ''}${pseudo ?? ''}`;
        const paint = [style.color, style.backgroundColor, style.backgroundImage, style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor, style.outlineColor, style.boxShadow, style.textShadow, style.filter, style.fill, style.stroke, style.stopColor, style.textDecorationColor].join(' ');
        const colors = paint.match(/rgba?\([^)]+\)/g) ?? [];
        const old = list.find(rgb => paint.includes(`(${rgb})`) || paint.includes(`(${rgb},`));
        if (old) found.push(`${name}: retired ${old}`);
        const tone = colors.find(brown);
        if (tone) found.push(`${name}: brown ${tone}`);
        const box = pseudo ? { width: parseFloat(style.width) || Infinity, height: parseFloat(style.height) || Infinity } : element.getBoundingClientRect();
        const background = [style.backgroundColor, ...(style.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [])].find(dark);
        if (background && box.width > 4 && box.height > 4) found.push(`${name}: dark background ${background}`);
      }
    }
    return found;
  }, retired);
  expect(hits).toEqual([]);
}

for (const width of [390, 1440]) {
  test.describe(`pastel palette at ${width}px`, () => {
    test.beforeEach(async ({ page }) => { await page.setViewportSize({ width, height: 900 }); });

    test('home hero, menu, campaign, creations, essence, contact and footer are pastel with olive text', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('.hero-copy');
      // Focus stays visible in dark olive on the light surfaces (checked before any click ends keyboard modality).
      const cta = hero.getByRole('link', { name: 'Explorar creaciones' });
      await cta.focus();
      expect(await color(cta, 'outlineColor')).toBe(palette.oliveDeep);
      await page.locator('.wordmark').focus();
      expect(await color(page.locator('.wordmark'), 'outlineColor')).toBe(palette.oliveDeep);
      await page.locator('.wordmark').blur();
      expect(await color(hero, 'backgroundColor')).toBe(palette.pink);
      await expectLightSurface(hero, palette.pink, .85);
      expect(await color(hero.getByRole('heading', { level: 1 }))).toBe(palette.olive);
      await expectReadable(hero.getByRole('heading', { level: 1 }), 3);
      expect(await color(hero.locator('.brand-kicker'))).toBe(palette.slateDeep);
      await expectReadable(hero.locator('.brand-kicker'), 4.5);
      await expectReadable(hero.locator('.hero-description'), 4.5);
      await expectLightButton(hero.getByRole('link', { name: 'Explorar creaciones' }), true);
      for (const control of await page.locator('.carousel-arrow').all()) await expectLightButton(control, false);
      await expectReadable(page.locator('.carousel-status'), 4.5);

      const nav = page.getByRole('navigation', { name: 'Navegación principal' });
      await expectLightSurface(nav, palette.sageLight, .85);
      expect(await color(nav.locator('.wordmark'))).toBe(palette.oliveDeep);
      await expectReadable(nav.locator('.wordmark'), 4.5);
      if (width < 768) {
        await expectReadable(nav.getByRole('button', { name: 'Menú' }), 4.5);
        await nav.getByRole('button', { name: 'Menú' }).click();
      } else {
        const consult = nav.getByRole('link', { name: /Consultar/ });
        expect(await color(consult, 'backgroundImage')).toContain(palette.pinkPowder);
        await expectLightButton(consult, true);
      }
      for (const name of ['Inicio', 'Catálogo', 'Esencia', 'Contacto']) await expectReadable(nav.getByRole('link', { name, exact: true }), 4.5);

      const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
      await expectLightSurface(campaign, palette.lavender, .85);
      expect(await color(campaign.getByRole('heading', { level: 2 }))).toBe(palette.olive);
      await expectReadable(campaign.getByRole('heading', { level: 2 }), 3);
      expect(await color(campaign.getByText('UNA NAVIDAD LLENA DE LUZ'))).toBe(palette.oliveDeep);
      await expectReadable(campaign.getByText('UNA NAVIDAD LLENA DE LUZ'), 4.5);
      await expectReadable(campaign.getByText(/Velas artesanales aromáticas/), 4.5);
      await expectLightButton(campaign.getByRole('link', { name: /Explorar colección navideña/ }), true);
      await expectReadable(campaign.getByRole('button', { name: /animaciones navideñas/ }), 4.5);

      const creationsHeading = page.getByRole('heading', { name: 'Explora nuestras creaciones' });
      expect(await color(creationsHeading)).toBe(palette.olive);
      await expectReadable(creationsHeading, 3);
      const cards = page.locator('.creation-card .creation-body');
      for (const [index, tone] of [palette.pink, palette.sageLight, palette.lavender].entries()) {
        await expectLightSurface(cards.nth(index), tone, .85);
        expect(await color(cards.nth(index).locator('h3'))).toBe(palette.olive);
        await expectReadable(cards.nth(index).locator('h3'), 3);
        await expectReadable(cards.nth(index).locator('p'), 4.5);
      }
      await expectReadable(page.locator('.wholesale-note'), 4.5);
      const seasonal = page.getByRole('link', { name: /línea de temporada navideña/ });
      expect(await color(seasonal)).toBe(palette.oliveDeep);
      await expectReadable(seasonal, 4.5);

      const essence = page.locator('#esencia');
      expect(await color(essence, 'backgroundColor')).toBe(palette.sageLight);
      expect(await color(essence.getByRole('heading', { level: 2 }))).toBe(palette.olive);
      await expectReadable(essence.getByRole('heading', { level: 2 }), 3);
      for (const pillar of await essence.locator('.essence-pillar').all()) {
        await expectLightSurface(pillar, null, .85);
        expect(await color(pillar.locator('h3'))).toBe(palette.olive);
        await expectReadable(pillar.locator('h3'), 3);
        await expectReadable(pillar.locator('p'), 4.5);
      }
      expect(await color(essence.locator('.essence-order h3'))).toBe(palette.olive);
      await expectReadable(essence.locator('.essence-order h3'), 3);
      await expectReadable(essence.locator('.essence-motto'), 4.5);
      await expectReadable(essence.locator('.essence-order li').first(), 4.5);
      const step = await essence.locator('.essence-order li').first().evaluate(el => { const style = getComputedStyle(el, '::before'); return { text: style.color, background: style.backgroundImage }; });
      expect(darkText).toContain(step.text);
      for (const stop of step.background.match(/rgba?\([^)]+\)/g)!) {
        expect(lightness(parse(stop))).toBeGreaterThanOrEqual(.68);
        expect(ratio(parse(step.text), parse(stop))).toBeGreaterThanOrEqual(4.5);
      }
      await expectReadable(essence.locator('.content-note'), 4.5);

      const contact = page.locator('#contacto');
      expect(await color(contact, 'backgroundColor')).toBe(palette.pinkPowder);
      await expectLightSurface(contact, palette.pinkPowder, .85);
      expect(await color(contact, 'borderBottomColor')).toBe(palette.goldSoft);
      expect(await color(contact.locator('.contact-edge'), 'filter')).toContain(palette.goldSoft);
      expect(await color(contact.getByRole('heading', { level: 2 }))).toBe(palette.olive);
      await expectReadable(contact.getByRole('heading', { level: 2 }), 3);
      await expectReadable(contact.locator('.contact-phone'), 4.5);
      await expectReadable(contact.locator('.contact-phone a'), 4.5);
      await expectLightButton(contact.getByRole('link', { name: /Consultar por WhatsApp/ }), true);

      const footer = page.locator('.site-footer');
      await expectLightSurface(page.locator('body'), palette.cream, .9);
      expect(await color(footer.locator('.footer-brand'))).toBe(palette.oliveDeep);
      await expectReadable(footer.locator('.footer-brand'), 4.5);
      await expectReadable(footer.locator('.demo-notice'), 4.5);
      const toggle = footer.getByRole('button', { name: /ambiente navideño/ });
      expect(await color(toggle, 'backgroundColor')).toBe(palette.sageLight);
      await expectLightButton(toggle, true);
      // WhatsApp keeps its recognizable functional green.
      expect(await color(page.locator('.whatsapp-float'), 'backgroundImage')).toContain('rgb(31, 158, 76)');
      await expectNoBrownOrDark(page);
    });

    test('catalog listing has a pastel intro, pastel filters and pastel cards with olive titles', async ({ page }) => {
      await page.goto('/catalogo');
      const intro = page.locator('.page-intro');
      await expectLightSurface(intro, palette.pink, .85);
      expect(await color(intro.getByRole('heading', { level: 1 }))).toBe(palette.olive);
      await expectReadable(intro.getByRole('heading', { level: 1 }), 3);
      await expectReadable(intro.locator('p:not(.eyebrow)'), 4.5);
      const nav = page.getByRole('navigation', { name: 'Navegación principal' });
      await expectLightSurface(nav, palette.sageLight, .85);
      if (width >= 768) await expectReadable(nav.locator('a[aria-current]'), 4.5);
      await expectLightButton(page.locator('.filter-links a[aria-current]'), false);
      expect(await color(page.locator('.filter-links a[aria-current]'), 'backgroundImage')).toContain(palette.pinkPowder);
      const filter = page.locator('.filter-links a:not([aria-current])').first();
      expect(await color(filter, 'backgroundColor')).toBe(palette.sageLight);
      await expectLightButton(filter, true);
      await expectReadable(page.getByRole('searchbox').or(page.locator('.search-form input')).first(), 4.5);
      await expectReadable(page.locator('.results-meta').first(), 4.5);
      const fills = await page.locator('.product-card').evaluateAll(cards => cards.slice(0, 3).map(card => getComputedStyle(card).backgroundImage));
      expect(fills[0]).toContain(palette.pink);
      expect(fills[1]).toContain(palette.cream);
      expect(fills[2]).toContain(palette.sageLight);
      const card = page.locator('.product-card').first();
      await expectLightSurface(card, palette.pink, .85);
      expect(await color(card.locator('h2'))).toBe(palette.oliveDeep);
      await expectReadable(card.locator('h2'), 4.5);
      await expectReadable(card.locator('.card-bottom p').first(), 4.5);
      await expectReadable(card.locator('.card-bottom p span').first(), 4.5);
      await expectLightButton(card.locator('.wax-button'), true);
      await expectReadable(page.locator('.catalog-disclaimer'), 4.5);
      const contact = page.locator('#contacto');
      expect(await color(contact, 'backgroundColor')).toBe(palette.pinkPowder);
      await expectLightButton(contact.getByRole('link', { name: /Consultar por WhatsApp/ }), false);
      await expectNoBrownOrDark(page);
    });

    test('product detail, facts, order form and gallery are pastel with olive labels', async ({ page }) => {
      await page.goto('/catalogo/wax-melts');
      const heading = page.getByRole('heading', { level: 1 });
      expect(await color(heading)).toBe(palette.olive);
      await expectReadable(heading, 3);
      await expectReadable(page.locator('.breadcrumbs a').first(), 4.5);
      await expectReadable(page.locator('.product-description'), 4.5);
      const term = page.locator('.product-facts dt').first();
      expect(await color(term, 'backgroundColor')).toBe(palette.pinkPowder);
      expect(await color(term)).toBe(palette.oliveDeep);
      await expectReadable(term, 4.5);
      await expectLightSurface(page.locator('.product-facts > div').first(), null, .9);
      await expectReadable(page.locator('.product-facts dd').first(), 4.5);
      const form = page.getByRole('form', { name: 'Arma tu pedido' });
      expect(await color(form.locator('legend'))).toBe(palette.oliveDeep);
      await expectReadable(form.locator('legend'), 4.5);
      const active = form.locator('fieldset label').first();
      expect(await color(active, 'backgroundColor')).toBe(palette.pinkPowder);
      expect(await color(active, 'borderTopColor')).toBe(palette.oliveDeep);
      await expectReadable(active.locator('span'), 4.5);
      await expectReadable(form.locator('fieldset label').nth(1).locator('span'), 4.5);
      await expectReadable(form.locator('select').first(), 4.5);
      expect(await color(form.locator('[aria-live] strong'))).toBe(palette.oliveDeep);
      await expectReadable(form.locator('[aria-live] strong'), 4.5);
      await expectLightButton(form.getByRole('link', { name: /Pedir por WhatsApp/ }), true);
      await expectReadable(page.locator('.consult-note'), 4.5);
      await expectReadable(page.locator('.product-accordion summary'), 4.5);
      await expectReadable(page.locator('.site-footer .demo-notice'), 4.5);
      await expectNoBrownOrDark(page);
    });

    test('not-found page keeps the pastel menu, olive title and a light button', async ({ page }) => {
      await page.goto('/pagina-que-no-existe');
      const heading = page.getByRole('heading', { level: 1 });
      expect(await color(heading)).toBe(palette.olive);
      await expectReadable(heading, 3);
      await expectLightSurface(page.getByRole('navigation', { name: 'Navegación principal' }), palette.sageLight, .85);
      await expectLightButton(page.locator('.not-found .wax-button').first(), true);
      if (width < 768) {
        await page.getByRole('button', { name: 'Menú' }).click();
        await expectReadable(page.getByRole('link', { name: 'Inicio', exact: true }), 4.5);
      }
      await expectNoBrownOrDark(page);
    });
  });
}
