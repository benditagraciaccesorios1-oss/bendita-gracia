import Link from 'next/link';
import { ProductImage } from '@/components/product-image';
import { WaxButton, WaxFrame } from '@/components/wax';
import { categories, type Product } from '@/data/catalog';

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const category = categories.find(item => item.id === product.category)!;
  return <article className="product-card">
    <Link href={`/catalogo/${product.slug}`} aria-label={`Ver ${product.name}`}>
      <WaxFrame tone={(['rose', 'oat', 'sage'] as const)[index % 3]}><ProductImage src={product.images[0].src} alt={product.images[0].alt} illustrative={product.images[0].illustrative} /></WaxFrame>
    </Link>
    <div className="card-info"><p className="eyebrow">{category.name}</p><h2><Link href={`/catalogo/${product.slug}`}>{product.name}</Link></h2>
      <div className="card-bottom"><p>Precio<span>{product.priceCOP === null ? 'Por confirmar' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.priceCOP)}</span></p><WaxButton href={`/catalogo/${product.slug}`}>Ver detalle <span aria-hidden="true">↗</span></WaxButton></div>
    </div>
  </article>;
}
