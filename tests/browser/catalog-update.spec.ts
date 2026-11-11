import { test, expect, type Page } from '@playwright/test';

// Corrections and new products from «Información página web - Bendita Gracia actualizada.docx».
const whatsappText = async (page: Page) => {
  const href = await page.locator('.detail-copy').getByRole('link', { name: /Pedir por WhatsApp/ }).getAttribute('href');
  return new URL(href!).searchParams.get('text')!;
};
const fact = (page: Page, label: string) => page.locator('.product-facts > div', { has: page.getByRole('term').filter({ hasText: new RegExp(`^${label}$`) }) }).getByRole('definition');

test('the three-candle set shows its price range, made-to-order status and card text in the order', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/catalogo/set-tres-velas-flores');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Set de 3 velas aromáticas');
  await expect(fact(page, 'Precio')).toHaveText(/^Desde \$\s?11\.900 hasta \$\s?18\.900$/);
  await expect(fact(page, 'Incluye')).toHaveText('3 flores a tu elección + caja + lazo + tarjeta personalizada');
  await expect(fact(page, 'Medidas')).toHaveText('5,5 cm de diámetro');
  await expect(fact(page, 'Fragancias')).toHaveText('Yogurt de fresa, Lavanda, Frutos rojos, Manzana canela, Sueño tropical, Bergamota, Verbena rosa, Sándalo');
  await expect(fact(page, 'Disponibilidad')).toHaveText('Bajo pedido');
  const form = page.getByRole('form', { name: 'Arma tu pedido' });
  await expect(form.locator('[aria-live]')).toContainText(/Precio de referencia Desde \$\s?11\.900 hasta \$\s?18\.900/);
  await form.getByLabel('Flores').selectOption('Peonía');
  await form.getByLabel('Texto de la tarjeta').fill('Para la mejor abuela, con amor');
  expect(await whatsappText(page)).toMatch(/Set de 3 velas aromáticas\. Presentación: 3 flores a tu elección \+ caja \+ lazo \+ tarjeta personalizada \(desde \$\s?11\.900 hasta \$\s?18\.900\)\. Flores: Peonía\. Texto de la tarjeta: Para la mejor abuela, con amor\./);
  await expect(form.getByLabel('Texto de la tarjeta')).toHaveAttribute('maxlength', '120');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('chao año viejo joins the Christmas line with its fixed price and material', async ({ page }) => {
  await page.goto('/catalogo/chao-ano-viejo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chao año viejo');
  await expect(fact(page, 'Precio')).toHaveText(/^\$\s?19\.900$/);
  await expect(fact(page, 'Incluye')).toHaveText('Año viejo + cerillos + caja');
  await expect(fact(page, 'Medidas')).toHaveText('10 cm');
  await expect(fact(page, 'Material')).toHaveText('Cera de soya');
  await expect(fact(page, 'Disponibilidad')).toHaveText('Por confirmar');
  await expect(page.getByRole('form', { name: 'Arma tu pedido' }).locator('[aria-live]')).toContainText(/Total \$\s?19\.900/);
});

test('corrected peony, sachet and wax melt facts are shown', async ({ page }) => {
  await page.goto('/catalogo/peonia-en-recipiente');
  await expect(fact(page, 'Incluye')).toHaveText('Flor diseño peonía + recipiente en concreto + lazo + yitzu + empaque');
  await expect(fact(page, 'Medidas')).toHaveText('5,5 cm de diámetro × 7 cm de alto aprox.');
  await expect(fact(page, 'Disponibilidad')).toHaveText('Bajo pedido');
  await page.goto('/catalogo/sachet-botanico');
  await expect(page.locator('.product-description')).toContainText('ideales para closets, cajones, baños y vehículos');
  await expect(fact(page, 'Precio')).toHaveText(/^\$\s?12\.900$/);
  await expect(fact(page, 'Incluye')).toHaveText('Empaque + tarjeta personalizada');
  await expect(fact(page, 'Medidas')).toHaveText('8,5 × 5 cm');
  await page.goto('/catalogo/wax-melts');
  await expect(fact(page, 'Medidas')).toHaveText('Entre 1 y 3 cm');
});

for (const width of [360, 1440]) {
  test(`the price range stays inside its catalog card at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/catalogo');
    const card = page.locator('.product-card', { hasText: 'Set de 3 velas aromáticas' });
    await expect(card.locator('.card-bottom')).toContainText(/Desde \$\s?11\.900 hasta \$\s?18\.900/);
    const [cardBox, priceBox] = [(await card.boundingBox())!, (await card.locator('.card-bottom p').boundingBox())!];
    expect(priceBox.x).toBeGreaterThanOrEqual(cardBox.x);
    expect(priceBox.x + priceBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 0.5);
  });
}
