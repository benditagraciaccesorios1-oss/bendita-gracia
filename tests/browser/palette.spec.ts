import { test, expect, type Locator, type Page } from '@playwright/test';

// Brand palette sampled from «paleta de colores actualizada.jpeg» (approximate swatch centers).
const palette = {
  slate: 'rgb(79, 91, 67)',
  slateDeep: 'rgb(48, 59, 40)',
  rosewood: 'rgb(206, 161, 155)',
  sage: 'rgb(149, 170, 127)',
  blush: 'rgb(228, 209, 205)',
  mist: 'rgb(213, 221, 206)',
  chestnut: 'rgb(142, 106, 12)',
  goldLight: 'rgb(245, 222, 144)',
  gold: 'rgb(165, 136, 78)',
  goldDark: 'rgb(87, 55, 14)',
};

// Burgundy, old rose and lilac treatments the previous palette used on panels, headings and calls to action.
const retired = ['127, 41, 40', '128, 29, 29', '122, 30, 29', '121, 39, 35', '130, 44, 42', '140, 30, 28', '129, 28, 27', '162, 50, 43', '169, 74, 64', '103, 34, 34', '180, 92, 80', '95, 29, 28', '182, 65, 62', '129, 38, 44', '91, 32, 30', '147, 67, 38', '180, 83, 69', '136, 31, 28', '156, 66, 58', '216, 165, 161', '239, 228, 242', '224, 209, 228', '246, 239, 247'];

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

const color = (locator: Locator, property: 'color' | 'backgroundColor' | 'backgroundImage' | 'borderTopColor' = 'color') => locator.evaluate((el, name) => getComputedStyle(el)[name], property);

// No element, nor its ::before/::after, keeps a retired brand color; only the Christmas atmosphere and bulbs
// (seasonal decoration) and the WhatsApp shortcut (functional green) are outside this check.
async function expectNoRetiredColors(page: Page) {
  const hits = await page.evaluate(list => {
    const found: string[] = [];
    for (const element of document.querySelectorAll('body *')) {
      if (element.closest('.christmas-atmosphere, .christmas-garland, [data-light], .whatsapp-float')) continue;
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        const value = [style.color, style.backgroundColor, style.backgroundImage, style.borderTopColor, style.borderBottomColor, style.borderLeftColor, style.boxShadow].join(' ');
        const hit = list.find(rgb => value.includes(`(${rgb})`) || value.includes(`(${rgb},`));
        if (hit) found.push(`${element.tagName.toLowerCase()}.${element.getAttribute('class') ?? ''}${pseudo ?? ''}: ${hit}`);
      }
    }
    return found;
  }, retired);
  expect(hits).toEqual([]);
}

for (const width of [390, 1440]) {
  test.describe(`brand palette at ${width}px`, () => {
    test.beforeEach(async ({ page }) => { await page.setViewportSize({ width, height: 900 }); });

    test('home hero, menu, campaign, creations, essence, contact and footer use the new palette', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('.hero-copy');
      expect(await color(hero, 'backgroundColor')).toBe(palette.rosewood);
      expect(await color(hero.getByRole('heading', { level: 1 }))).toBe(palette.goldDark);
      await expectReadable(hero.getByRole('heading', { level: 1 }), 3);
      expect(await color(hero.locator('.brand-kicker'))).toBe(palette.slateDeep);
      await expectReadable(hero.locator('.brand-kicker'), 4.5);
      await expectReadable(hero.locator('.hero-description'), 4.5);
      const heroCta = hero.getByRole('link', { name: 'Explorar creaciones' });
      expect(await color(heroCta, 'backgroundImage')).toContain(palette.slate);
      await expectReadable(heroCta, 4.5);

      const nav = page.getByRole('navigation', { name: 'Navegación principal' });
      const navLayers = await color(nav, 'backgroundImage');
      expect(navLayers).toContain(palette.slate);
      expect(navLayers).toContain(palette.slateDeep);
      await expectReadable(nav.locator('.wordmark'), 4.5);
      if (width < 768) {
        await expectReadable(nav.getByRole('button', { name: 'Menú' }), 4.5);
        await nav.getByRole('button', { name: 'Menú' }).click();
      } else {
        const consult = nav.getByRole('link', { name: /Consultar/ });
        expect(await color(consult, 'backgroundImage')).toContain(palette.rosewood);
        await expectReadable(consult, 4.5);
      }
      for (const name of ['Inicio', 'Catálogo', 'Esencia', 'Contacto']) await expectReadable(nav.getByRole('link', { name, exact: true }), 4.5);

      const campaign = page.getByRole('region', { name: 'Navidad en Bendita Gracia' });
      expect(await color(campaign, 'backgroundImage')).toContain(palette.blush);
      expect(await color(campaign.getByRole('heading', { level: 2 }))).toBe(palette.goldDark);
      await expectReadable(campaign.getByRole('heading', { level: 2 }), 4.5);
      await expectReadable(campaign.getByText('UNA NAVIDAD LLENA DE LUZ'), 4.5);
      await expectReadable(campaign.getByText(/Velas artesanales aromáticas/), 4.5);
      const campaignCta = campaign.getByRole('link', { name: /Explorar colección navideña/ });
      expect(await color(campaignCta, 'backgroundImage')).toContain(palette.slate);
      await expectReadable(campaignCta, 4.5);
      await expectReadable(campaign.getByRole('button', { name: /animaciones navideñas/ }), 4.5);

      await expectReadable(page.getByRole('heading', { name: 'Explora nuestras creaciones' }), 3);
      const cards = page.locator('.creation-card .creation-body');
      expect(await color(cards.nth(0), 'backgroundImage')).toContain(palette.blush);
      expect(await color(cards.nth(1), 'backgroundImage')).toContain(palette.mist);
      for (const index of [0, 1, 2]) {
        expect(await color(cards.nth(index).locator('h3'))).toBe(palette.goldDark);
        await expectReadable(cards.nth(index).locator('h3'), 4.5);
        await expectReadable(cards.nth(index).locator('p'), 4.5);
      }
      await expectReadable(page.locator('.wholesale-note'), 4.5);
      await expectReadable(page.getByRole('link', { name: /línea de temporada navideña/ }), 4.5);

      const essence = page.locator('#esencia');
      expect(await color(essence.locator('.essence-pillar.tone-rose'), 'borderTopColor')).toBe(palette.rosewood);
      expect(await color(essence.locator('.essence-pillar.tone-sage'), 'borderTopColor')).toBe(palette.sage);
      for (const pillar of await essence.locator('.essence-pillar').all()) {
        expect(await color(pillar.locator('h3'))).toBe(palette.goldDark);
        await expectReadable(pillar.locator('h3'), 3);
        await expectReadable(pillar.locator('p'), 4.5);
      }
      await expectReadable(essence.locator('.essence-motto'), 4.5);
      await expectReadable(essence.locator('.essence-order li').first(), 4.5);
      await expectReadable(essence.locator('.content-note'), 4.5);

      const contact = page.locator('#contacto');
      expect(await color(contact, 'backgroundImage')).toContain(palette.goldDark);
      expect(await color(contact.getByRole('heading', { level: 2 }))).toBe(palette.goldLight);
      await expectReadable(contact.getByRole('heading', { level: 2 }), 3);
      await expectReadable(contact.locator('.contact-phone'), 4.5);
      await expectReadable(contact.locator('.contact-phone a'), 4.5);
      const contactCta = contact.getByRole('link', { name: /Consultar por WhatsApp/ });
      expect(await color(contactCta, 'backgroundImage')).toContain(palette.slate);
      await expectReadable(contactCta, 4.5);

      const footer = page.locator('.site-footer');
      expect(await color(footer.locator('.footer-brand'))).toBe(palette.goldDark);
      await expectReadable(footer.locator('.footer-brand'), 4.5);
      await expectReadable(footer.locator('.demo-notice'), 4.5);
      const toggle = footer.getByRole('button', { name: /ambiente navideño/ });
      expect(await color(toggle, 'backgroundColor')).toBe(palette.slateDeep);
      await expectReadable(toggle, 4.5);
      // WhatsApp keeps its recognizable functional green.
      expect(await color(page.locator('.whatsapp-float'), 'backgroundImage')).toContain('rgb(31, 158, 76)');
      await expectNoRetiredColors(page);
    });

    test('catalog listing uses rosewood intro, slate filters and palette card rims', async ({ page }) => {
      await page.goto('/catalogo');
      const intro = page.locator('.page-intro');
      expect(await color(intro, 'backgroundImage')).toContain(palette.rosewood);
      expect(await color(intro.getByRole('heading', { level: 1 }))).toBe(palette.goldDark);
      await expectReadable(intro.getByRole('heading', { level: 1 }), 3);
      await expectReadable(intro.locator('p:not(.eyebrow)'), 4.5);
      const current = page.locator('.filter-links a[aria-current]');
      expect(await color(current, 'backgroundImage')).toContain(palette.slate);
      await expectReadable(current, 4.5);
      await expectReadable(page.locator('.filter-links a:not([aria-current])').first(), 4.5);
      await expectReadable(page.getByRole('searchbox').or(page.locator('.search-form input')).first(), 4.5);
      await expectReadable(page.locator('.results-meta').first(), 4.5);
      const rims = await page.locator('.product-card').evaluateAll(cards => cards.slice(0, 3).map(card => getComputedStyle(card).borderTopColor));
      expect(rims).toEqual([palette.rosewood, 'rgb(205, 176, 113)', palette.sage]);
      const card = page.locator('.product-card').first();
      expect(await color(card.locator('h2'))).toBe(palette.goldDark);
      await expectReadable(card.locator('h2'), 4.5);
      await expectReadable(card.locator('.card-bottom p').first(), 4.5);
      await expectReadable(card.locator('.card-bottom p span').first(), 4.5);
      const button = card.locator('.wax-button');
      expect(await color(button, 'backgroundImage')).toContain(palette.slate);
      await expectReadable(button, 4.5);
      await expectReadable(page.locator('.catalog-disclaimer'), 4.5);
      await expectNoRetiredColors(page);
    });

    test('product detail, order form and gallery use the new palette with readable text', async ({ page }) => {
      await page.goto('/catalogo/wax-melts');
      const heading = page.getByRole('heading', { level: 1 });
      expect(await color(heading)).toBe(palette.goldDark);
      await expectReadable(heading, 3);
      await expectReadable(page.locator('.breadcrumbs a').first(), 4.5);
      await expectReadable(page.locator('.product-description'), 4.5);
      const term = page.locator('.product-facts dt').first();
      expect(await color(term, 'backgroundColor')).toBe(palette.rosewood);
      await expectReadable(term, 4.5);
      expect(await color(page.locator('.product-facts > div').first(), 'backgroundColor')).toBe(palette.blush);
      await expectReadable(page.locator('.product-facts dd').first(), 4.5);
      const form = page.getByRole('form', { name: 'Arma tu pedido' });
      expect(await color(form.locator('legend'))).toBe(palette.goldDark);
      await expectReadable(form.locator('legend'), 4.5);
      const active = form.locator('fieldset label').first();
      expect(await color(active, 'backgroundColor')).toBe(palette.rosewood);
      expect(await color(active, 'borderTopColor')).toBe(palette.chestnut);
      await expectReadable(active.locator('span'), 4.5);
      await expectReadable(form.locator('fieldset label').nth(1).locator('span'), 4.5);
      await expectReadable(form.locator('select').first(), 4.5);
      await expectReadable(form.locator('[aria-live] strong'), 4.5);
      const order = form.getByRole('link', { name: /Pedir por WhatsApp/ });
      expect(await color(order, 'backgroundImage')).toContain(palette.slate);
      await expectReadable(order, 4.5);
      await expectReadable(page.locator('.consult-note'), 4.5);
      await expectReadable(page.locator('.product-accordion summary'), 4.5);
      await expectReadable(page.locator('.site-footer .demo-notice'), 4.5);
      await expectNoRetiredColors(page);
    });
  });
}
