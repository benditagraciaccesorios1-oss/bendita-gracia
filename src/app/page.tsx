import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { ContactSection, SiteFooter } from '@/components/footer';
import { ProductImage } from '@/components/product-image';
import { HeroCarousel } from '@/features/home/hero-carousel';
import { categories } from '@/data/catalog';
import './home-reference.css';

// Only the artwork panels from the exact creation-card block supplied by the user.
const guideScenes = {
  'velas-florales': { file: 'home-creation-velas-regalo', alt: 'Imagen ilustrativa: caja de regalo con velas decorativas de árbol y reno' },
  'figuras-en-cera': { file: 'home-creation-figuras-pebetero', alt: 'Imagen ilustrativa: pebetero con figuras de cera y pequeños árboles decorativos' },
  'wax-sachet': { file: 'home-creation-sachets-colgantes', alt: 'Imagen ilustrativa: sachets colgantes con flores, lazos y detalles botánicos' },
} as const;

// Home headings follow the visual reference; catalog IDs, filters and data stay unchanged.
const creationTitles = { 'velas-florales': 'Velas Decorativas', 'figuras-en-cera': 'Wax Melts', 'wax-sachet': 'Wax Sachet' } as const;

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
      <section className="categories-section container" aria-labelledby="categories-heading">
        {/* This section follows the «Explora nuestras creaciones» block of the new home guide: a title between fine
            rules and sprigs, then complete cards with the scene on top and the title and description on a tinted body.
            Home titles follow the guide; category IDs, notes and catalog filters remain unchanged. */}
        <div className="section-heading creations-heading">
          <div className="creations-title"><span className="heading-rule" aria-hidden="true" /><Sprig className="heading-sprig" /><h2 id="categories-heading">Explora nuestras creaciones</h2><Sprig className="heading-sprig is-mirrored" /><span className="heading-rule" aria-hidden="true" /></div>
        </div>
        <div className="category-grid">{categories.map((category, index) => {
          return <Link href={`/catalogo?categoria=${category.id}`} className={`category-card creation-card tone-${(['cream', 'sage', 'lilac'] as const)[index]}`} key={category.id}>
            <ProductImage src={`/images/references/${guideScenes[category.id].file}.webp`} alt={guideScenes[category.id].alt} labelInSource sizes="(max-width: 899px) 92vw, 30vw" />
            <div className="creation-body"><h3>{creationTitles[category.id]}</h3><p>{category.note}</p><Sprig className="card-sprig" /></div>
          </Link>;
        })}</div>
      </section>
      <ContactSection />
      <section className="essence-section container" id="esencia" aria-labelledby="essence-heading">
        <div className="essence-symbol" aria-hidden="true">✧</div>
        <div><p className="eyebrow">NUESTRA ESENCIA</p><h2 id="essence-heading">Luz, aroma <em>y diseño.</em></h2></div>
        <div><p>Una propuesta de formas y texturas para descubrir pequeños detalles.</p><p className="content-note">Fotografías de los diseños de Bendita Gracia, junto con referencias ilustrativas identificadas. Materiales, fragancias y disponibilidad están por confirmar.</p><Link href="/catalogo" className="text-link">Conocer los diseños <span aria-hidden="true">↗</span></Link></div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
