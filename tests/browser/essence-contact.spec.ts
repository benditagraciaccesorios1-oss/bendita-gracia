import { test, expect } from '@playwright/test';

// S22: essence section built from the site's own content, contact number +57 314 4616230 opening WhatsApp, and a WhatsApp button.
const phone = '573144616230';

test('essence section presents the brand pillars and how to order, before contact', async ({ page }) => {
  await page.goto('/');
  const essence = page.locator('#esencia');
  await expect(essence.getByRole('heading', { level: 2 })).toHaveText('Luz, aroma y diseño.');
  await expect(essence).toContainText('Pequeños detalles, grandes intenciones');
  await expect(essence.getByRole('heading', { level: 3 })).toHaveText(['Luz', 'Aroma', 'Diseño', 'Cómo pedir']);
  await expect(essence.locator('ol > li')).toHaveCount(3);
  await expect(essence.getByRole('link', { name: /Conocer los diseños/ })).toHaveAttribute('href', '/catalogo');
  const essenceTop = await essence.evaluate(el => el.getBoundingClientRect().top + scrollY);
  const contactTop = await page.locator('#contacto').evaluate(el => el.getBoundingClientRect().top + scrollY);
  expect(essenceTop).toBeLessThan(contactTop);
});

test('contact shows the number and both contact links open the WhatsApp chat', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contacto');
  const number = contact.getByRole('link', { name: '+57 314 4616230' });
  await expect(number).toBeVisible();
  for (const link of [number, contact.getByRole('link', { name: /Consultar por WhatsApp/ })]) {
    const url = new URL((await link.getAttribute('href'))!);
    expect(url.origin + url.pathname).toBe(`https://wa.me/${phone}`);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await expect(page.getByText('Número y país por confirmar antes de publicar.')).toHaveCount(0);
});

for (const [path, width] of [['/', 390], ['/catalogo', 1440], ['/catalogo/wax-melts', 390]] as const) {
  test(`floating WhatsApp button is reachable on ${path} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
    const button = page.getByRole('link', { name: 'Escríbenos por WhatsApp al +57 314 4616230' });
    await expect(button).toBeVisible();
    expect(new URL((await button.getAttribute('href'))!).pathname).toBe(`/${phone}`);
    await expect(button).toHaveAttribute('target', '_blank');
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    // Stays in place while scrolling.
    await page.mouse.wheel(0, 900);
    await expect(button).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

// S24: Colombian Spanish (tú), no Argentine voseo, in visible text, labels and the WhatsApp message.
// \b treats accented letters as non-word characters, so use Unicode letter boundaries instead.
const voseo = /(?<!\p{L})(Elegí|Explorá|Probá|Consultá|Armá|Contanos|Escribinos|Personalizalo|Podés|pedís|pedí|Confirmá|Mirá|Descubrí|Conocé|Usá|Buscá|querés|tenés)(?!\p{L})/iu;
test('site copy uses Colombian Spanish instead of voseo', async ({ page }) => {
  for (const path of ['/', '/catalogo', '/catalogo/wax-melts', '/catalogo/figuras-navidenas', '/no-existe']) {
    await page.goto(path);
    const text = await page.evaluate(() => [document.body.innerText, document.title,
      ...[...document.querySelectorAll('[aria-label], [placeholder], meta[name="description"], a[href*="wa.me"]')]
        .map(el => [el.getAttribute('aria-label'), el.getAttribute('placeholder'), el.getAttribute('content'), decodeURIComponent(el.getAttribute('href') ?? '')].join(' '))].join('\n'));
    expect(text.match(voseo)?.[0] ?? null, path).toBeNull();
  }
  await page.goto('/');
  await expect(page.locator('#esencia')).toContainText('Elige tu diseño');
  await page.goto('/no-existe');
  await expect(page.getByText('Puedes volver a explorar las creaciones de Bendita Gracia.')).toBeVisible();
});
