'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/components/product-image';
import { WaxFrame } from '@/components/wax';
import { originalImageSizes } from '@/data/image-sizes';
import type { Product } from '@/data/catalog';
import styles from './product-gallery.module.css';

const keyStep = 40;

// Shows the image at its native pixel size and lets it move only as far as its own edges.
function PanViewer({ src, alt, kind, hintId, onExit }: { src: string; alt: string; kind: string; hintId: string; onExit: () => void }) {
  const viewer = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null);
  const [natural, setNatural] = useState<[number, number] | null>(originalImageSizes[src] ?? null);
  const [area, setArea] = useState<[number, number] | null>(null);

  const limitX = area && natural ? Math.max(0, (natural[0] - area[0]) / 2) : 0;
  const limitY = area && natural ? Math.max(0, (natural[1] - area[1]) / 2) : 0;
  const canPan = limitX > 0 || limitY > 0;

  // Offsets are measured from the centre; writing the transform directly avoids a render per pointer move.
  function place(x: number, y: number) {
    if (!area || !natural || !photo.current) return;
    offset.current = { x: Math.min(limitX, Math.max(-limitX, x)), y: Math.min(limitY, Math.max(-limitY, y)) };
    // Whole pixels keep the photo sharp; the lower bound keeps a fractional-width viewer covered.
    const snap = (base: number, shift: number, limit: number) => limit > 0 ? Math.min(0, Math.max(Math.ceil(base * 2), Math.round(base + shift))) : Math.round(base);
    const left = snap((area[0] - natural[0]) / 2, offset.current.x, limitX);
    const top = snap((area[1] - natural[1]) / 2, offset.current.y, limitY);
    photo.current.style.transform = `translate(${left}px, ${top}px)`;
  }

  useEffect(() => {
    const element = viewer.current!;
    element.focus({ preventScroll: true });
    const observer = new ResizeObserver(([entry]) => setArea([entry.contentRect.width, entry.contentRect.height]));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Re-clamp whenever the viewer or image size changes, e.g. after a browser resize.
  useLayoutEffect(() => place(offset.current.x, offset.current.y));

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.classList.add(styles.dragging);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: offset.current.x, startY: offset.current.y };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    place(current.startX + event.clientX - current.x, current.startY + event.clientY - current.y);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.classList.remove(styles.dragging);
  }

  function pressKey(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? keyStep * 3 : keyStep;
    const { x, y } = offset.current;
    const moves: Record<string, [number, number]> = { ArrowLeft: [x + step, y], ArrowRight: [x - step, y], ArrowUp: [x, y + step], ArrowDown: [x, y - step], Home: [0, 0] };
    if (event.key === 'Escape') onExit();
    else if (moves[event.key]) place(...moves[event.key]);
    else return;
    event.preventDefault();
  }

  const [width, height] = natural ?? [640, 560];
  return <div className={styles.stage}>
    <div
      ref={viewer}
      className={styles.viewer}
      style={{ touchAction: limitY > 0 ? 'none' : limitX > 0 ? 'pan-y' : 'auto' }}
      tabIndex={0}
      role="group"
      aria-label={`${kind[0].toUpperCase()}${kind.slice(1)} ampliada`}
      aria-describedby={hintId}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={pressKey}
      onDragStart={event => event.preventDefault()}
    >
      <Image
        ref={photo}
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        loading="eager"
        draggable={false}
        style={{ width, height, visibility: area && natural ? undefined : 'hidden' }}
        onLoad={event => { if (!natural) setNatural([event.currentTarget.naturalWidth, event.currentTarget.naturalHeight]); }}
      />
    </div>
    <button type="button" className={styles.recenter} disabled={!canPan} onClick={() => place(0, 0)}>Centrar {kind}</button>
  </div>;
}

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const hintId = useId();
  const image = product.images[selected];
  const kind = image.illustrative ? 'ilustración' : 'fotografía';
  const exit = () => { setZoom(false); zoomButton.current?.focus(); };
  return <div className="product-gallery">
    <WaxFrame>{zoom
      ? <PanViewer key={image.src} src={image.src} alt={image.alt} kind={kind} hintId={hintId} onExit={exit} />
      : <ProductImage src={image.src} alt={image.alt} illustrative={image.illustrative} detail priority sizes="(max-width: 767px) 90vw, 45vw" />}</WaxFrame>
    <div className="gallery-options" role="group" aria-label="Vistas del diseño">
      {product.images.map((item, index) => <button key={item.src} type="button" aria-pressed={index === selected && !zoom} onClick={() => { setSelected(index); setZoom(false); }}><Image src={item.src} alt="" width={96} height={64} sizes="96px" /><span>{product.images.length === 1 ? 'Vista completa' : `Imagen ${index + 1}`}</span></button>)}
      <button ref={zoomButton} type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{image.illustrative ? 'Acercar ilustración' : 'Acercar fotografía'}</button>
    </div>
    {zoom && <p id={hintId} className={styles.hint}>Arrastra la {kind} o usa las flechas del teclado para moverla; se muestra a su tamaño original. Esc vuelve a la vista completa.</p>}
    <p className="gallery-note">{image.illustrative ? 'Referencia ilustrativa; fotografía individual pendiente.' : 'Fotografías proporcionadas por la marca. Las imágenes de conjunto muestran la presentación fotografiada, no confirman variantes disponibles.'} El acercamiento muestra la imagen a su tamaño original para recorrerla; no es una vista 360°.</p>
  </div>;
}
