import Image from 'next/image';
import { originalImageSizes } from '@/data/image-sizes';

export function ProductImage({ src, alt, priority = false, illustrative = true, labelInSource = false, sizes = '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw', detail = false }: { src: string; alt: string; priority?: boolean; illustrative?: boolean; labelInSource?: boolean; sizes?: string; detail?: boolean }) {
  const [width, height] = originalImageSizes[src] ?? (src.startsWith('/images/references/home-creation-') ? [445, 232] : [640, 560]);
  return <div className={`product-image ${illustrative ? '' : 'is-photograph'} ${detail ? 'detail-image' : ''} ${labelInSource ? 'has-printed-label' : ''}`}>
    <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} unoptimized={!illustrative || labelInSource || src.endsWith('.svg') || src.startsWith('/images/references/hero-')} />
    {illustrative && !labelInSource && <span className="illustrative">Imagen ilustrativa</span>}
  </div>;
}
