import { test, expect, type Page } from '@playwright/test';

// Prices, presentations and choices come from the brand's price document (S20-S21). Ordering stays a WhatsApp consultation.
const cop = (value: string) => new RegExp(`\\$\\s?${value.replace('.', '\\.')}`);
const whatsappText = async (page: Page, name: RegExp) => {
  const href = await page.locator('.detail-copy').getByRole('link', { name }).getAttribute('href');
  return new URL(href!).searchParams.get('text');
};

test('home cards lead to the priced categories and old category links still filter', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.content-note')).toContainText(/Wax melts desde \$\s?18\.000/);
  await page.locator('.category-grid').getByRole('link', { name: /Wax Melts/ }).click();
  await expect(page).toHaveURL(/categoria=wax-melts$/);
  const cards = page.locator('.product-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('Wax melts');
  await expect(cards.nth(0).locator('.card-bottom')).toContainText(/Desde\s+\$\s?18\.000/);
  await expect(cards.nth(1).locator('.card-bottom')).toContainText(cop('74.900'));

  await page.goto('/catalogo?categoria=velas-florales');
  await expect(page.getByRole('link', { name: 'Velas decorativas', exact: true })).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.product-card')).toHaveCount(7);
  await expect(page.locator('.product-card', { hasText: 'Peonía morada' }).locator('.card-bottom')).toContainText('Por confirmar');
});

test('wax melts order collects presentation, form, fragrance and color into the WhatsApp message', async ({ page }) => {
  await page.goto('/catalogo/wax-melts');
  const facts = page.locator('.product-facts');
  await expect(facts).toContainText(/75 gr: \$\s?18\.000 · 100 gr: \$\s?30\.000/);
  await expect(facts).toContainText('Yogurt de fresa, Lavanda, Frutos rojos');
  const form = page.getByRole('form', { name: 'Arma tu pedido' });
  await expect(form.locator('[aria-live]')).toContainText(cop('18.000'));
  expect(await whatsappText(page, /Pedir por WhatsApp/)).toMatch(/^Hola, me interesa el diseño Wax melts\. Presentación: 75 gr \(\$\s?18\.000\)\. ¿Me confirmas disponibilidad\?$/);

  // Keyboard selection of the presentation updates the total.
  await form.getByRole('radio', { name: /75 gr/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(form.getByRole('radio', { name: /100 gr/ })).toBeChecked();
  await expect(form.locator('[aria-live]')).toContainText(cop('30.000'));

  await expect(form.getByLabel('Forma').locator('option')).toHaveText(['Elige una opción', 'Estrellas', 'Corazones', 'Flores', 'De mar', 'Nubes', 'Cubos']);
  await form.getByLabel('Forma').selectOption('Estrellas');
  await form.getByLabel('Fragancia').selectOption('Lavanda');
  await form.getByLabel('Color').fill('Rosa pastel');
  const link = page.locator('.detail-copy').getByRole('link', { name: /Pedir por WhatsApp/ });
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(await whatsappText(page, /Pedir por WhatsApp/)).toMatch(/^Hola, me interesa el diseño Wax melts\. Presentación: 100 gr \(\$\s?30\.000\)\. Forma: Estrellas\. Fragancia: Lavanda\. Color: Rosa pastel\. ¿Me confirmas disponibilidad\?$/);
});

test('single-presentation lines show their size, scent rule and extra details', async ({ page }) => {
  await page.goto('/catalogo/velitas-de-peticiones');
  const facts = page.locator('.product-facts');
  await expect(facts).toContainText(cop('18.000'));
  await expect(facts).toContainText('8 unidades');
  await expect(facts).toContainText('4,5 cm aprox.');
  await expect(facts).toContainText('Sin fragancia');
  await expect(facts).toContainText('Creer, Soñar, Amar, Crear, Fluir, Vivir, Dar, Orar');
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.getByRole('combobox')).toHaveCount(0);
  expect(await whatsappText(page, /Pedir por WhatsApp/)).toMatch(/^Hola, me interesa el diseño Velitas de peticiones\. Presentación: 8 unidades \(\$\s?18\.000\)\. ¿Me confirmas disponibilidad\?$/);

  // The document photographs come first and are shown, not upscaled, in the gallery.
  const photo = page.locator('.detail-copy').locator('..').locator('img').first();
  await expect(photo).toHaveAttribute('src', /velitas-peticiones-estrella\.webp/);
});

test('merged snowflake figures redirect to the seasonal figures line', async ({ page }) => {
  await page.goto('/catalogo/copos-en-caja');
  await expect(page).toHaveURL(/\/catalogo\/figuras-navidenas$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Figuras de temporada');
  await expect(page.locator('.product-facts')).toContainText(/1 unidad: \$\s?9\.990 · Kit x 2 unidades: \$\s?17\.900 · Kit x 3 unidades: \$\s?26\.900/);
  await expect(page.locator('.product-facts')).toContainText('7 cm de alto');
});

test('order form fits small screens without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/catalogo/figuras-navidenas');
  await expect(page.getByRole('form', { name: 'Arma tu pedido' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('star candles on a pearl base are a reference option of noche de velitas', async ({ page }) => {
  await page.goto('/catalogo/figuras-con-estrella');
  await expect(page).toHaveURL(/\/catalogo\/noche-de-velitas$/);
  await expect(page.getByRole('button', { name: 'Imagen 2', exact: true })).toBeVisible();
  const form = page.getByRole('form', { name: 'Arma tu pedido' });
  await expect(form.getByLabel('Referencia').locator('option')).toHaveText(['Elige una opción', 'Velitas en caja', 'Velitas sobre base de perlas']);
  await form.getByLabel('Referencia').selectOption('Velitas sobre base de perlas');
  expect(await whatsappText(page, /Pedir por WhatsApp/)).toMatch(/^Hola, me interesa el diseño Noche de velitas\. Presentación: 5 unidades \(\$\s?14\.900\)\. Referencia: Velitas sobre base de perlas\. ¿Me confirmas disponibilidad\?$/);
  await page.goto('/catalogo');
  await expect(page.locator('.product-card', { hasText: 'Figuras con estrella' })).toHaveCount(0);
});
