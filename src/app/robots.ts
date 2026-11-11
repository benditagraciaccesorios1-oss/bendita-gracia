import type { MetadataRoute } from 'next';
import { indexable, siteOrigin } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return indexable
    ? { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteOrigin}/sitemap.xml` }
    : { rules: { userAgent: '*', disallow: '/' } };
}
