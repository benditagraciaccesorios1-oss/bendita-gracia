import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { originalImageSizes } from '@/data/image-sizes';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { SiteFooter } from '@/components/footer';
import { ProductImage } from '@/components/product-image';
import { Flourish, WaxButton, WaxFrame } from '@/components/wax';
import { OrderForm } from '@/features/catalog/order-form';
import { ProductGallery } from '@/features/catalog/product-gallery';
import { categories, formatCOP, priceLabel, products, whatsappPhone, whatsappUrl } from '@/data/catalog';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  if (!product) notFound();
  const photo = product.images[0];
  const dimensions = originalImageSizes[photo.src];
  return pageMetadata(`/catalogo/${product.slug}`, product.name, product.description, {
    url: photo.src, alt: photo.alt, width: dimensions?.[0], height: dimensions?.[1],
  });
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  if (!product) notFound();
  const category = categories.find(item => item.id === product.category)!;
  const related = products.filter(item => item.slug !== slug && item.category === product.category).slice(0, 3);

  return <div className="melt-page">
    <div className="internal-header"><Navigation edge="melt" /></div>
    <main id="contenido" className="container" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span aria-hidden="true">/</span><Link href="/catalogo">Catálogo</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
      <section className="product-detail" aria-labelledby="product-name">
        <ProductGallery product={product} />
        <div className="detail-copy"><p className="eyebrow">{category.name}</p><h1 id="product-name">{product.name}</h1><p className="product-description">{product.description}</p><Flourish />
          <dl className="product-facts">
            <div><dt>Precio</dt><dd>{product.variants.length > 1 ? product.variants.map(item => `${item.label}: ${formatCOP(item.priceCOP)}`).join(' · ') : priceLabel(product)}</dd></div>
            {product.variants.length === 1 && <div><dt>Incluye</dt><dd>{product.variants[0].label}</dd></div>}
            <div><dt>Medidas</dt><dd>{product.dimensions ?? 'Por confirmar'}</dd></div>
            <div><dt>Fragancias</dt><dd>{product.scentless ? 'Sin fragancia' : product.fragrances?.join(', ') ?? 'Por confirmar'}</dd></div>
            {product.details.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
            <div><dt>Disponibilidad</dt><dd>{{ unconfirmed: 'Por confirmar', 'on-request': 'Bajo pedido', available: 'Disponible', unavailable: 'No disponible' }[product.availability]}</dd></div>
          </dl>
          {product.variants.length
            ? <OrderForm product={product} phone={whatsappPhone} />
            : <WaxButton href={whatsappUrl(whatsappPhone, product.name)} external>Consultar por WhatsApp <span aria-hidden="true">↗</span></WaxButton>}
          <p className="consult-note">Solo prepara una consulta; no confirma un pedido. La disponibilidad se confirma por WhatsApp.</p>
          <details className="product-accordion"><summary>Información del diseño</summary><p>{product.images[0].illustrative ? 'Referencia visual ilustrativa.' : 'Fotografía proporcionada por la marca.'} {product.variants.length ? 'Precios en pesos colombianos según la información de la marca. Cuidados, advertencias de uso y condiciones de entrega se confirman al pedir.' : 'Precio, materiales, colores, cuidados y advertencias de uso están por confirmar con la marca.'}</p></details>
        </div>
      </section>
      {related.length > 0 && <section className="related-section" aria-labelledby="related-heading"><h2 id="related-heading">Más diseños para descubrir</h2><div className="related-grid">{related.map((item, index) => <Link href={`/catalogo/${item.slug}`} key={item.id}><WaxFrame tone={index % 2 === 0 ? 'oat' : 'sage'}><ProductImage src={item.images[0].src} alt={item.images[0].alt} illustrative={item.images[0].illustrative} /></WaxFrame><h3>{item.name}</h3></Link>)}</div></section>}
    </main>
    <SiteFooter />
  </div>;
}
