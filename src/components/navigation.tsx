'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { WaxButton, WaxEdge } from './wax';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/#esencia', label: 'Esencia' },
  { href: '/#contacto', label: 'Contacto' },
];

// `edge="melt"` gives the menu the dripping, animated lip used on every page; `satin` is the plain edge.
export function Navigation({ edge = 'satin' }: { edge?: 'satin' | 'melt' }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) toggle.current?.focus();
  }

  // The home links always return to the beginning. Next's own scrolling is disabled for them (scroll={false})
  // because the sticky-header scroll padding makes it scroll the new page past the hero.
  // onNavigate skips modified clicks, so new-tab behavior stays native.
  function navigate(event: { preventDefault: () => void }, href: string) {
    if (href !== '/') return;
    if (pathname !== '/') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    event.preventDefault();
    if (window.location.hash || window.location.search) window.history.pushState(null, '', '/');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  return <header className="navigation-wrap">
    <nav className="navigation" aria-label="Navegación principal" onKeyDown={event => {
      if (event.key === 'Escape' && open) close(true);
    }}>
      <Link href="/" scroll={false} className="wordmark" onClick={() => close()} onNavigate={event => navigate(event, '/')}>Bendita Gracia<span>LUZ, AROMA Y DISEÑO</span></Link>
      <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(!open)}>{open ? 'Cerrar ✕' : 'Menú ☰'}</button>
      <div id="main-menu" className={`nav-links ${open ? 'is-open' : ''}`}>
        {links.map(link => <Link key={link.href} href={link.href} scroll={link.href === '/' ? false : undefined} onClick={() => close()} onNavigate={event => navigate(event, link.href)} aria-current={link.href === pathname ? 'page' : undefined}>{link.label}</Link>)}
      </div>
      <WaxButton href="/#contacto" secondary className="nav-consult">Consultar <span aria-hidden="true">↗</span></WaxButton>
      {edge === 'melt' ? <WaxEdge variant="melt" /> : <WaxEdge />}
    </nav>
  </header>;
}
