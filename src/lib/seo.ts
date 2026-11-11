import type { Metadata } from 'next';

// Confirmed by the owner. SITE_URL can override the public origin at build time.
export const siteOrigin = new URL(process.env.SITE_URL || 'https://bendita-gracia.benditagraciaccesorios1.workers.dev').origin;
export const siteName = 'Bendita Gracia';
export const homeTitle = 'Bendita Gracia · Velas artesanales, aromas y detalles';
export const homeDescription = 'Velas decorativas, wax melts, wax sachet y detalles para regalar de Bendita Gracia, al detal y al por mayor. Personaliza tu diseño y consulta por WhatsApp.';

// Development and local-origin builds remain out of search results.
const canonicalUrl = new URL(siteOrigin);
const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(canonicalUrl.hostname) || canonicalUrl.hostname.endsWith('.localhost');
export const indexable = process.env.NODE_ENV === 'production' && canonicalUrl.protocol === 'https:' && !localHost;
export const socialImage = { url: '/social-card.jpg', width: 1200, height: 630, alt: 'Bendita Gracia: velas decorativas y creaciones para regalar.' };

type SocialImage = { url: string; alt: string; width?: number; height?: number };

export function pageMetadata(path: string, title: string, description: string, image: SocialImage = socialImage, allowIndex = true): Metadata {
  const fullTitle = title === homeTitle ? title : `${title} | ${siteName}`;
  const absoluteImage = { ...image, url: new URL(image.url, siteOrigin).href };
  return {
    title,
    description,
    alternates: { canonical: new URL(path, siteOrigin).href },
    robots: { index: indexable && allowIndex, follow: true },
    openGraph: {
      title: fullTitle, description, url: new URL(path, siteOrigin).href,
      siteName, locale: 'es_CO', type: 'website', images: [absoluteImage],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [absoluteImage] },
  };
}
