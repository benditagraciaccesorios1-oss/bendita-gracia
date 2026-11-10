'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ProductImage } from '@/components/product-image';
import { WaxButton, WaxEdge } from '@/components/wax';

// Illustrative guide scenes cropped from the supplied mockups fill the panel like the reference;
// the uploaded photographs stay in the catalog and detail pages.
const slides = [
  { id: 'hero-floral', name: 'Velas de rosas y peonía bajo domo', alt: 'velas de rosas marfil y rosa junto a una peonía bajo domo' },
  { id: 'hero-velas-florales', name: 'Velas florales', alt: 'velas de rosas y peonías sobre una base de madera' },
  { id: 'hero-figuras', name: 'Figuras en cera', alt: 'figuras con estrella sobre una base de perlas' },
  { id: 'hero-sachet', name: 'Wax sachet', alt: 'wax sachets botánicos en bolsas de tul' },
].map(scene => ({ ...scene, src: `/images/references/${scene.id}.webp`, alt: `Imagen ilustrativa de referencia: ${scene.alt}` }));
// One small drop and one long drop toward the corner, as on the pink panel of the mockup.
const heroDrops = [[23.8, .9], [76.2, 1.3]] as const;
const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(notify: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
}
const getReducedMotion = () => window.matchMedia(motionQuery).matches;
const getHidden = () => document.hidden;
const pausedOnServer = () => true;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, pausedOnServer);
  const hidden = useSyncExternalStore(subscribeVisibility, getHidden, pausedOnServer);
  const playing = !reducedMotion && playChoice !== false;
  const rotating = playing && !hovered && !focused && !hidden;
  const start = useRef<{ x: number; y: number } | null>(null);
  const move = (direction: number) => setIndex(current => (current + direction + slides.length) % slides.length);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [rotating, index]);

  return <section className="hero" aria-labelledby="hero-heading">
    <div className="hero-copy">
      <p className="brand-kicker">Luz, aroma y diseño</p>
      <h1 id="hero-heading">Bendita <em>Gracia</em></h1>
      <div className="hero-intro">
        <p className="hero-description">Pequeños detalles, grandes intenciones</p>
        <WaxButton href="/catalogo">Explorar creaciones</WaxButton>
      </div>
      <WaxEdge variant="melt" drops={heroDrops} className="hero-edge" />
    </div>
    <div className="hero-carousel" role="region" aria-roledescription="carrusel" aria-label="Diseños destacados"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }} onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      }}>
      <div className="hero-scene" onTouchStart={event => { start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => {
        if (!start.current) return;
        const dx = event.changedTouches[0].clientX - start.current.x;
        const dy = event.changedTouches[0].clientY - start.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
        start.current = null;
      }}>
        {/* Every scene stays mounted in the same cell; only opacity changes, so the previous one fades out under the next. */}
        <div className="hero-art">{slides.map((scene, slideIndex) => {
          const active = slideIndex === index;
          return <div key={scene.id} className={`hero-slide ${active ? 'is-active' : ''}`} role="group" aria-roledescription="diapositiva"
            aria-label={`${slideIndex + 1} de ${slides.length}: ${scene.name}`} aria-hidden={active ? undefined : true} inert={!active}>
            <div className="hero-photo">
              <ProductImage src={scene.src} alt={scene.alt} priority={slideIndex === 0} sizes="(max-width: 899px) 100vw, 64vw" />
            </div>
          </div>;
        })}</div>
        <div className="carousel-controls">
          <button type="button" className="carousel-arrow" onClick={() => move(-1)} aria-label="Diseño anterior">‹</button>
          <div className="carousel-status" aria-live={rotating ? 'off' : 'polite'} aria-atomic="true"><span>{String(index + 1).padStart(2, '0')} <span className="muted">/ {String(slides.length).padStart(2, '0')}</span></span><span className="sr-only">: {slides[index].name}</span></div>
          <button type="button" className="carousel-arrow" onClick={() => move(1)} aria-label="Diseño siguiente">›</button>
          <button className="carousel-toggle" type="button" disabled={reducedMotion} title={reducedMotion ? 'Avance automático desactivado por tu preferencia de movimiento reducido' : undefined} onClick={() => setPlayChoice(!playing)} aria-label={playing ? 'Pausar carrusel' : 'Reanudar carrusel'}>{playing ? 'Ⅱ' : '▶'}</button>
        </div>
      </div>
    </div>
  </section>;
}
