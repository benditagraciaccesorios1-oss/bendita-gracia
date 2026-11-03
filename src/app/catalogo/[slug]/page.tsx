import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { SiteFooter } from '@/components/footer';
import { ProductImage } from '@/components/product-image';
import { Flourish, WaxButton, WaxFrame } from '@/components/wax';
import { ProductGallery } from '@/features/catalog/product-gallery';
import { categories, products, whatsappPhone, whatsappUrl } from '@/data/catalog';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  return { title: product?.name || 'Diseño no encontrado', description: product?.description };
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  if (!product) notFound();
  const category = categories.find(item => item.id === product.category)!;
  const related = products.filter(item => item.slug !== slug && item.category === product.category).slice(0, 3);

  return <>
    <div className="internal-header"><Navigation /></div>
    <main id="contenido" className="container" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span aria-hidden="true">/</span><Link href="/catalogo">Catálogo</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
      <section className="product-detail" aria-labelledby="product-name">
        <ProductGallery product={product} />
        <div className="detail-copy"><p className="eyebrow">{category.name}</p><h1 id="product-name">{product.name}</h1><p className="product-description">{product.description}</p><Flourish />
          <dl className="product-facts">
            <div><dt>Precio</dt><dd>{product.priceCOP === null ? 'Por confirmar' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.priceCOP)}</dd></div>
            <div><dt>Dimensiones</dt><dd>{product.dimensions ?? 'Por confirmar'}</dd></div>
            <div><dt>Fragancias</dt><dd>{product.fragrances?.join(', ') ?? 'Por confirmar'}</dd></div>
            <div><dt>Disponibilidad</dt><dd>{product.availability === 'unconfirmed' ? 'Por confirmar' : product.availability === 'available' ? 'Disponible' : 'No disponible'}</dd></div>
          </dl>
          <WaxButton href={whatsappUrl(whatsappPhone, product.name)} external>Consultar por WhatsApp <span aria-hidden="true">↗</span></WaxButton>
          <p className="consult-note">Solo prepara una consulta; no confirma un pedido. Confirmá el número y país de destino antes de publicar.</p>
          <details className="product-accordion"><summary>Información del diseño</summary><p>Referencia visual ilustrativa. Materiales, colores, cuidados y advertencias de uso están por confirmar con la marca. No hay variantes ni condiciones de entrega verificadas.</p></details>
        </div>
      </section>
      {related.length > 0 && <section className="related-section" aria-labelledby="related-heading"><h2 id="related-heading">Más diseños para descubrir</h2><div className="related-grid">{related.map((item, index) => <Link href={`/catalogo/${item.slug}`} key={item.id}><WaxFrame tone={index % 2 === 0 ? 'oat' : 'sage'}><ProductImage src={item.images[0].src} alt={item.images[0].alt} /></WaxFrame><h3>{item.name}</h3></Link>)}</div></section>}
    </main>
    <SiteFooter />
  </>;
}
