import { Navigation } from '@/components/navigation';
import { SiteFooter } from '@/components/footer';
import { WaxButton } from '@/components/wax';

export default function NotFound() {
  return <div className="melt-page"><div className="internal-header"><Navigation edge="melt" /></div><main className="not-found container" id="contenido" tabIndex={-1}><p className="eyebrow">404 · DISEÑO NO ENCONTRADO</p><h1>Este detalle no está en el catálogo</h1><p>Puedes volver a explorar las creaciones de Bendita Gracia.</p><WaxButton href="/catalogo">Volver al catálogo</WaxButton></main><SiteFooter /></div>;
}
