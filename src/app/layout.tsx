import type { Metadata } from 'next';
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
import { WhatsAppButton } from '@/components/whatsapp-button';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: { default: 'Bendita Gracia · Luz, aroma y diseño', template: '%s | Bendita Gracia' },
  description: 'Velas decorativas, wax melts y wax sachet de Bendita Gracia. Elige forma, fragancia y color, y pide por WhatsApp.',
  robots: { index: false, follow: false },
  openGraph: { title: 'Bendita Gracia', description: 'Luz, aroma y diseño. Catálogo ilustrativo.', locale: 'es_CO', type: 'website', images: [{ url: '/social-card.svg', width: 1200, height: 630 }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><a className="skip-link" href="#contenido">Saltar al contenido</a>{children}<WhatsAppButton /></body></html>;
}
