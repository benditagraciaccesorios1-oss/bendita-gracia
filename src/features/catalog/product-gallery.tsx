'use client';

import { useState } from 'react';
import { ProductImage } from '@/components/product-image';
import { WaxFrame } from '@/components/wax';
import type { Product } from '@/data/catalog';

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const image = product.images[selected];
  return <div className="product-gallery">
    <WaxFrame className={zoom ? 'gallery-closeup' : ''}><ProductImage src={image.src} alt={image.alt} detail priority sizes="(max-width: 767px) 90vw, 45vw" /></WaxFrame>
    <div className="gallery-options" role="group" aria-label="Vistas de la ilustración">
      {product.images.map((item, index) => <button key={item.src} type="button" aria-pressed={index === selected && !zoom} onClick={() => { setSelected(index); setZoom(false); }}>{product.images.length === 1 ? 'Vista completa' : `Imagen ${index + 1}`}</button>)}
      <button type="button" aria-pressed={zoom} onClick={() => setZoom(true)}>Acercar ilustración</button>
    </div>
    <p className="gallery-note">Ilustración provisional, no fotografía. Pendientes: fotos frontal y lateral del diseño real. El acercamiento no es una vista 360°.</p>
  </div>;
}
