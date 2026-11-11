'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { ProductImage } from '@/components/product-image';
import { WaxButton, WaxEdge } from '@/components/wax';
import { products } from '@/data/catalog';

// Three genuine portrait photos fit the wide stage without the excessive crop of a single portrait.
// Never use the externally generated image: products, lettering and backgrounds stay as supplied in the catalog.
const compositions = [
  { id: 'flowers', name: 'Peonía, set de flores y florero', photos: [
    ['peonia-en-recipiente', 'peonia-en-recipiente', '50%'],
    ['set-tres-velas-flores', 'set-tres-velas-flores', '50%'],
    ['set-florero-margaritas-peonia', 'set-florero-margaritas-peonia', '50%'],
  ] },
  { id: 'aromas', name: 'Aromas y detalles para regalar', photos: [
    ['kit-pebetero', 'kit-pebetero-navidad', '40%'],
    ['sachet-botanico', 'sachet-botanico-trio', '50%'],
    ['sachet-navideno', 'sachet-navidad-colgantes', '50%'],
  ] },
  { id: 'celebrations', name: 'Luz para celebrar', photos: [
    ['figuras-navidenas', 'figuras-kit-x3', '50%'],
    ['chao-ano-viejo', 'chao-ano-viejo', '50%'],
    ['velitas-de-peticiones', 'velitas-peticiones-estrella', '50%'],
  ] },
] as const;
const slides = compositions.flatMap(composition => {
  const photos = composition.photos.flatMap(([slug, file, focus]) => {
    const product = products.find(item => item.slug === slug);
    const photo = product?.images.find(image => image.src === `/images/originals/${file}.webp`);
    return photo ? [{ ...photo, focus }] : [];
  });
  // Keep complete compositions only, avoiding empty columns if the catalog changes.
  return photos.length === 3 ? [{ id: composition.id, name: composition.name, photos }] : [];
});
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
            <div className="hero-composition">{scene.photos.map(photo => <div className="hero-photo" key={photo.src} style={{ '--hero-focus': photo.focus } as CSSProperties}>
              <ProductImage src={photo.src} alt={photo.alt} illustrative={false} priority={slideIndex === 0} sizes="(max-width: 899px) 33vw, 22vw" />
            </div>)}</div>
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
