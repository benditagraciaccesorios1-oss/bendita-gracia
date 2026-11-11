import { test, expect, type Page } from '@playwright/test';

const origin = 'https://bendita-gracia.benditagraciaccesorios1.workers.dev';
async function metadata(page: Page, path: string, title: RegExp, image: string) {
  await page.goto(path);
  await expect(page).toHaveTitle(title);
  // Next normalizes the root URL without its final slash; compare equivalent absolute URLs.
  await expect.poll(async () => new URL(await page.locator('link[rel="canonical"]').getAttribute('href') || 'about:blank').href)
    .toBe(new URL(path, origin).href);
  await expect.poll(async () => new URL(await page.locator('meta[property="og:url"]').getAttribute('content') || 'about:blank').href)
    .toBe(new URL(path, origin).href);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'es_CO');
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description!.length).toBeGreaterThan(30);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description!);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description!);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${origin}${image}`);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', `${origin}${image}`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
}

test('home and catalog expose indexable metadata on the confirmed public domain', async ({ page }) => {
  await metadata(page, '/', /Bendita Gracia.*Velas artesanales/, '/social-card.jpg');
  await metadata(page, '/catalogo', /Nuestras creaciones.*Bendita Gracia/, '/social-card.jpg');
});

test('every product has its own canonical, title, description and social photograph', async ({ page, request }) => {
  const sitemap = await request.get('/sitemap.xml');
  const paths = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => new URL(match[1]).pathname).filter(path => path.startsWith('/catalogo/'));
  expect(paths).toHaveLength(12);
  for (const path of paths) {
    await page.goto(path);
    const name = await page.locator('h1').innerText();
    const image = await page.locator('.product-gallery img').first().getAttribute('src');
    await metadata(page, path, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), image!);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', await page.locator('.product-description').innerText());
  }
});

test('searches and category filters canonicalize to catalog without indexing duplicates', async ({ page }) => {
  for (const query of ['?q=peon%C3%ADa', '?categoria=temporada', '?q=nada&categoria=wax-melts']) {
    await page.goto(`/catalogo${query}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/catalogo`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  }
});

test('robots permits crawling and lists a sitemap of real canonical pages only', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const text = await robots.text();
  expect(text).toContain('Allow: /');
  expect(text).not.toContain('Disallow: /');
  expect(text).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  expect(urls).toHaveLength(14);
  expect(new Set(urls).size).toBe(14);
  for (const url of urls) {
    expect(new URL(url).origin).toBe(origin);
    expect(new URL(url).search).toBe('');
    expect(new URL(url).hash).toBe('');
  }
  const missing = await request.get('/catalogo/no-existe');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toMatch(/name="robots" content="noindex"/);
});
