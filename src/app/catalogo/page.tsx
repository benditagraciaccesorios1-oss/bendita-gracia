import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { ContactSection, SiteFooter } from '@/components/footer';
import { Flourish, WaxButton } from '@/components/wax';
import { ProductCard } from '@/features/catalog/product-card';
import { categories, filterProducts } from '@/data/catalog';

export const metadata: Metadata = { title: 'Nuestras creaciones', description: 'Explorá velas florales, figuras en cera y wax sachet. Diseños ilustrativos con información comercial por confirmar.' };

type Search = { q?: string | string[]; categoria?: string | string[] };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.categoria === 'string' && categories.some(item => item.id === params.categoria) ? params.categoria : '';
  const results = filterProducts(query, category);

  function categoryHref(value: string) {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (value) next.set('categoria', value);
    return `/catalogo${next.size ? `?${next.toString()}` : ''}`;
  }

  return <>
    <div className="internal-header"><Navigation /></div>
    <main id="contenido" className="container" tabIndex={-1}>
      <section className="page-intro"><p className="eyebrow">EL UNIVERSO BENDITA GRACIA</p><h1>Nuestras creaciones</h1><p>Luz, aroma y diseño para tus espacios.</p><Flourish /></section>
      <div className="catalog-tools">
        <form action="/catalogo" method="get" className="search-form" role="search">
          <label htmlFor="design-search" className="sr-only">Buscar un diseño</label>
          <input id="design-search" name="q" type="search" defaultValue={query} placeholder="Buscar un diseño…" />
          {category && <input type="hidden" name="categoria" value={category} />}
          <button type="submit">Buscar <span aria-hidden="true">↗</span></button>
        </form>
        <nav className="filter-links" aria-label="Filtrar por categoría">
          <Link href={categoryHref('')} aria-current={!category ? 'true' : undefined}>Todos</Link>
          {categories.map(item => <Link key={item.id} href={categoryHref(item.id)} aria-current={category === item.id ? 'true' : undefined}>{item.name}</Link>)}
        </nav>
      </div>
      <div className="results-meta"><p>{results.length} {results.length === 1 ? 'diseño ilustrativo' : 'diseños ilustrativos'}{query && <> para «{query}»</>}</p>{(query || category) && <Link href="/catalogo">Limpiar filtros</Link>}</div>
      {results.length ? <section className="product-grid" aria-label="Diseños del catálogo">{results.map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}</section> : <section className="empty-state"><h2>No encontramos ese detalle</h2><p>Probá con otro nombre o elegí una categoría diferente.</p><WaxButton href="/catalogo">Limpiar filtros</WaxButton></section>}
      <p className="catalog-disclaimer">Muestra visual, no inventario de venta. Imágenes ilustrativas. Nombres, precios, medidas, fragancias y disponibilidad por confirmar.</p>
    </main>
    <ContactSection /><SiteFooter />
  </>;
}
