import type { Metadata } from 'next';
import { homeTitle, homeDescription, pageMetadata, siteOrigin } from '@/lib/seo';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import './globals.css';
import './responsive.css';
import './reference.css';
import './essence-contact.css';
import './melt-header.css';
import './christmas.css';
import { ChristmasTheme } from '@/components/christmas-theme';
import { WhatsAppButton } from '@/components/whatsapp-button';

export const metadata: Metadata = {
  ...pageMetadata('/', homeTitle, homeDescription),
  metadataBase: new URL(siteOrigin),
  title: { default: homeTitle, template: '%s | Bendita Gracia' },
  applicationName: 'Bendita Gracia',
  category: 'Velas artesanales y detalles para regalar',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-CO"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><ChristmasTheme>{children}<WhatsAppButton /></ChristmasTheme></body></html>;
}
