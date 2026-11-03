import type { MetadataRoute } from 'next';
import { products } from '@/data/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.SITE_URL || 'http://localhost:3000';
  return ['', '/catalogo', ...products.map(product => `/catalogo/${product.slug}`)].map(path => ({ url: `${origin}${path}` }));
}
