import Link from 'next/link';
import { displayPhone, whatsappPhone, whatsappUrl } from '@/data/catalog';
import { WaxButton, WaxEdge } from './wax';

export function ContactSection() {
  return <section className="contact-section" id="contacto" aria-labelledby="contact-heading">
    <WaxEdge className="contact-edge" />
    <div className="contact-content container">
      <div><p className="eyebrow">CONVERSEMOS</p><h2 id="contact-heading">Un detalle para recordar.</h2><p>Consulta por el diseño que te gusta.</p>
        <p className="contact-phone">WhatsApp <a href={whatsappUrl(whatsappPhone)} target="_blank" rel="noopener noreferrer">{displayPhone(whatsappPhone)}</a></p></div>
      <div className="contact-action"><WaxButton href={whatsappUrl(whatsappPhone)} external>Consultar por WhatsApp <span aria-hidden="true">↗</span></WaxButton></div>
    </div>
  </section>;
}

export function SiteFooter() {
  return <footer className="site-footer container"><Link href="/" className="footer-brand">BENDITA GRACIA</Link><p>Luz, aroma y diseño.</p><p className="demo-notice">Precios en pesos colombianos · Disponibilidad por confirmar.</p></footer>;
}
