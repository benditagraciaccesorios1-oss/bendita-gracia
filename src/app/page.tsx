import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { ContactSection, SiteFooter } from '@/components/footer';
import { ProductImage } from '@/components/product-image';
import { Flourish, WaxFrame } from '@/components/wax';
import { HeroCarousel } from '@/features/home/hero-carousel';
import { categories } from '@/data/catalog';

export default function Home() {
  return <>
    <a className="sr-only" href="#navigation">Ir a navegación</a>
    <main id="contenido" tabIndex={-1}>
      <HeroCarousel />
      <div className="home-nav" id="navigation"><Navigation /></div>
      <section className="categories-section container" aria-labelledby="categories-heading">
        <div className="section-heading"><h2 id="categories-heading">Encuentra tu detalle</h2><p>Formas, texturas y pequeños detalles.</p><Flourish /></div>
        <div className="category-grid">{categories.map((category, index) => {
          return <Link href={`/catalogo?categoria=${category.id}`} className="category-card" key={category.id}>
            <WaxFrame tone={(['rose', 'oat', 'sage'] as const)[index]}><ProductImage src={`/images/references/${category.image}.webp`} alt={`Imagen ilustrativa de ${category.name.toLowerCase()}`} /></WaxFrame>
            <div className="category-title"><h3>{category.name}</h3></div>
          </Link>;
        })}</div>
      </section>
      <ContactSection />
      <section className="essence-section container" id="esencia" aria-labelledby="essence-heading">
        <div className="essence-symbol" aria-hidden="true">✧</div>
        <div><p className="eyebrow">NUESTRA ESENCIA</p><h2 id="essence-heading">Luz, aroma <em>y diseño.</em></h2></div>
        <div><p>Una propuesta de formas y texturas para descubrir pequeños detalles.</p><p className="content-note">Este sitio es una muestra visual. Las ilustraciones no son fotografías de productos; materiales, fragancias y disponibilidad están por confirmar.</p><Link href="/catalogo" className="text-link">Conocer los diseños <span aria-hidden="true">↗</span></Link></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
