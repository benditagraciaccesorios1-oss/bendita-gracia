import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { ContactSection, SiteFooter } from '@/components/footer';
import { ProductImage } from '@/components/product-image';
import { HeroCarousel } from '@/features/home/hero-carousel';
import { ChristmasCampaign } from '@/features/home/christmas-campaign';
import { categories, formatCOP, products, type Category } from '@/data/catalog';
import './home-reference.css';

// Real catalog photographs represent the three product lines on home.
const categoryPhotos = {
  'velas-decorativas': products.find(product => product.slug === 'set-florero-margaritas-peonia')!.images[0],
  'wax-melts': products.find(product => product.slug === 'wax-melts')!.images[0],
  'wax-sachet': products.find(product => product.slug === 'sachet-botanico')!.images[0],
} as const;

// Home headings keep the visual reference's capitalization; each card links to the matching catalog category.
const homeCategories = categories.filter(category => category.id !== 'temporada');
const creationTitles = { 'velas-decorativas': 'Velas decorativas', 'wax-melts': 'Wax Melts', 'wax-sachet': 'Wax Sachet' } as const;

const lowestPrice = (category: Category) => Math.min(...products.flatMap(item => item.category === category && item.priceCOP !== null ? [item.priceCOP] : []));

const essencePillars = [
  { title: 'Luz', tone: 'rose', text: 'Representa iluminación, calidez, vida y calma. Una vela no solo ilumina un espacio, sino que crea una atmósfera acogedora y llena de paz.' },
  { title: 'Aroma', tone: 'sage', text: 'Fragancias que transforman el ambiente, evocan emociones, despiertan recuerdos y brindan bienestar y calma.' },
  { title: 'Diseño', tone: 'oat', text: 'Destaca el valor estético de cada pieza. En Bendita Gracia, las velas son un elemento de decoración, elaboradas a mano para embellecer, dar vida y resaltar cualquier espacio o convertirse en el regalo perfecto.' },
] as const;

// Fine-line leaf sprig used beside the section title and in the corner of each creation card.
function Sprig({ className }: { className: string }) {
  return <svg className={`sprig ${className}`} viewBox="0 0 60 48" aria-hidden="true" focusable="false">
    <g fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 44C18 36 33 25 53 5" fill="none" />
      <path d="M53 5C41 7 35 17 37 26C47 24 53 16 53 5Z" />
      <path d="M31 29C31 18 24 10 15 8C13 18 21 27 31 29Z" />
      <path d="M22 36C31 30 43 31 50 37C41 43 30 42 22 36Z" />
      <path d="M52 7L38 24M16 10L30 28M24 36L48 37" fill="none" strokeOpacity=".6" />
    </g>
  </svg>;
}

export default function Home() {
  return <div className="home-page">
    <main id="contenido" tabIndex={-1}>
      <HeroCarousel />
      <div className="home-nav"><Navigation edge="melt" /></div>
      <ChristmasCampaign />
      <section className="categories-section container" aria-labelledby="categories-heading">
        {/* This section follows the «Explora nuestras creaciones» block of the new home guide: a title between fine
            rules and sprigs, then complete cards with the scene on top and the title and description on a tinted body.
            Home titles follow the guide and link to the matching catalog categories. */}
        <div className="section-heading creations-heading">
          <div className="creations-title"><span className="heading-rule" aria-hidden="true" /><Sprig className="heading-sprig" /><h2 id="categories-heading">Explora nuestras creaciones</h2><Sprig className="heading-sprig is-mirrored" /><span className="heading-rule" aria-hidden="true" /></div>
        </div>
        <div className="category-grid">{homeCategories.map((category, index) => {
          return <Link href={`/catalogo?categoria=${category.id}`} className={`category-card creation-card tone-${(['cream', 'sage', 'lilac'] as const)[index]}`} key={category.id}>
            <ProductImage {...categoryPhotos[category.id]} sizes="(max-width: 899px) 92vw, 30vw" />
            <div className="creation-body"><h3>{creationTitles[category.id]}</h3><p>{category.note}</p><Sprig className="card-sprig" /></div>
          </Link>;
        })}</div>
        <p className="seasonal-link"><Link href="/catalogo?categoria=temporada" className="text-link">Explora nuestra línea de temporada navideña <span aria-hidden="true">↗</span></Link></p>
      </section>
      {/* Built only from what the brand already states: its tagline, the product lines and how ordering works. */}
      <section className="essence-section container" id="esencia" aria-labelledby="essence-heading">
        <div className="essence-intro">
          <p className="eyebrow">NUESTRA ESENCIA</p><h2 id="essence-heading">Luz, aroma <em>y diseño.</em></h2>
          <p className="essence-motto">Pequeños detalles, grandes intenciones</p>
        </div>
        <div className="essence-pillars">
          {essencePillars.map(pillar => <article className={`essence-pillar tone-${pillar.tone}`} key={pillar.title}>
            <h3>{pillar.title}</h3><p>{pillar.text}</p>
          </article>)}
        </div>
        <div className="essence-order">
          <h3>Cómo realizar tu pedido</h3>
          <ol>
            <li><strong>Elige tu diseño</strong> en el catálogo.</li>
            <li><strong>Personalízalo</strong> con forma, fragancia, color y presentación.</li>
            <li><strong>Escríbenos por WhatsApp</strong> y confirmamos disponibilidad.</li>
          </ol>
          <p className="content-note">{categories.map(category => `${category.name} desde ${formatCOP(lowestPrice(category.id))}`).join(' · ')}.</p>
          <Link href="/catalogo" className="text-link">Conocer los diseños <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <ContactSection />
    </main>
    <SiteFooter />
  </div>;
}
