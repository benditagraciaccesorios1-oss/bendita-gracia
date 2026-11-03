'use client';

import { useRef, useState } from 'react';
import { ProductImage } from '@/components/product-image';
import { WaxButton, WaxEdge } from '@/components/wax';
import { products } from '@/data/catalog';

const slides = [products[0], products[2], products[4], products[5]];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const product = slides[index];
  const move = (direction: number) => setIndex(current => (current + direction + slides.length) % slides.length);

  return <section className="hero" aria-label="Diseños destacados" aria-roledescription="carrusel" onKeyDown={event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  }}>
    <div className="hero-copy">
      <p className="brand-kicker">BENDITA GRACIA</p>
      <h1>Detalles que<br /><em>florecen.</em></h1>
      <p className="hero-description">Luz, aroma y diseño para tus espacios.</p>
      <WaxButton href="/catalogo">Explorar creaciones</WaxButton>
      <WaxEdge />
    </div>
    <div className="hero-scene" onTouchStart={event => { start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => {
      if (!start.current) return;
      const dx = event.changedTouches[0].clientX - start.current.x;
      const dy = event.changedTouches[0].clientY - start.current.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      start.current = null;
    }}>
      <div className="hero-art" key={product.id}><ProductImage src={index === 0 ? '/images/references/hero-floral.webp' : product.images[0].src} alt={index === 0 ? 'Imagen ilustrativa: velas de rosas rosa y marfil y una flor bajo domo' : product.images[0].alt} priority={index === 0} sizes="(max-width: 767px) 100vw, 65vw" /></div>
      <div className="carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Diseño anterior">←</button>
        <div className="carousel-status" aria-live="polite" aria-atomic="true"><span>{String(index + 1).padStart(2, '0')} <span className="muted">/ {String(slides.length).padStart(2, '0')}</span></span><span className="sr-only">: {product.name}</span><span className="carousel-track" aria-hidden="true"><span style={{ width: `${(index + 1) / slides.length * 100}%` }} /></span></div>
        <button type="button" onClick={() => move(1)} aria-label="Diseño siguiente">→</button>
      </div>
    </div>
  </section>;
}
