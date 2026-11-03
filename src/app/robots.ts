import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // The demonstration must not be indexed before content approval.
  return { rules: { userAgent: '*', disallow: '/' } };
}
