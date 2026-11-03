import Image from 'next/image';

export function ProductImage({ src, alt, priority = false, sizes = '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw', detail = false }: { src: string; alt: string; priority?: boolean; sizes?: string; detail?: boolean }) {
  return <div className={`product-image ${detail ? 'detail-image' : ''}`}>
    <Image src={src} alt={alt} width={640} height={560} sizes={sizes} priority={priority} unoptimized={src.endsWith('.svg')} />
    <span className="illustrative">Imagen ilustrativa</span>
  </div>;
}
