import Link from 'next/link';
import { whatsappPhone, whatsappUrl } from '@/data/catalog';
import { WaxButton, WaxEdge } from './wax';

export function ContactSection() {
  return <section className="contact-section" id="contacto" aria-labelledby="contact-heading">
    <WaxEdge className="contact-edge" />
    <div className="contact-content container">
      <div><p className="eyebrow">CONVERSEMOS</p><h2 id="contact-heading">Un detalle para recordar.</h2><p>Consultá por el diseño que te gusta.</p></div>
      <div className="contact-action"><WaxButton href={whatsappUrl(whatsappPhone)} external>Consultar por WhatsApp <span aria-hidden="true">↗</span></WaxButton><p>Número y país por confirmar antes de publicar.</p></div>
    </div>
  </section>;
}

export function SiteFooter() {
  return <footer className="site-footer container"><Link href="/" className="footer-brand">BENDITA GRACIA</Link><p>Luz, aroma y diseño.</p><p className="demo-notice">Catálogo de referencia · Diseños y precios por confirmar.</p></footer>;
}
