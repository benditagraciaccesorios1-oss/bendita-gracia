import type { MetadataRoute } from 'next';
import { products } from '@/data/catalog';
import { siteOrigin } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/catalogo', ...products.map(product => `/catalogo/${product.slug}`)].map(path => ({ url: new URL(path || '/', siteOrigin).href }));
}
