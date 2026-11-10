import Link from 'next/link';
import { ProductImage } from '@/components/product-image';
import { WaxButton, WaxEdge, WaxFrame, WaxRim } from '@/components/wax';
import { categories, priceLabel, type Product } from '@/data/catalog';

export function ProductCard({ product, index, animatedWax = false }: { product: Product; index: number; animatedWax?: boolean }) {
  const category = categories.find(item => item.id === product.category)!;
  return <article className="product-card">
    <Link href={`/catalogo/${product.slug}`} aria-label={`Ver ${product.name}`}>
      <WaxFrame tone={(['rose', 'oat', 'sage'] as const)[index % 3]}><ProductImage src={product.images[0].src} alt={product.images[0].alt} illustrative={product.images[0].illustrative} /></WaxFrame>
    </Link>
    <div className="card-info"><p className="eyebrow">{category.name}</p><h2 className={product.name.length > 28 ? 'is-long-name' : undefined}><Link href={`/catalogo/${product.slug}`}>{product.name}</Link></h2>
      <div className="card-bottom"><p>Precio<span>{priceLabel(product)}</span></p><WaxButton href={`/catalogo/${product.slug}`}>Ver detalle <span aria-hidden="true">↗</span></WaxButton></div>
    </div>
    <WaxRim />{animatedWax ? <WaxEdge variant="melt" drops={[[25, .65], [80, .8]]} /> : <WaxEdge />}
  </article>;
}
