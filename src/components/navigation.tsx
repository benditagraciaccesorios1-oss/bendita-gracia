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

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) toggle.current?.focus();
  }

  return <header className="navigation-wrap">
    <nav className="navigation" aria-label="Navegación principal" onKeyDown={event => {
      if (event.key === 'Escape' && open) close(true);
    }}>
      <Link href="/" className="wordmark" onClick={() => close()}>Bendita Gracia<span>LUZ, AROMA Y DISEÑO</span></Link>
      <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(!open)}>{open ? 'Cerrar ✕' : 'Menú ☰'}</button>
      <div id="main-menu" className={`nav-links ${open ? 'is-open' : ''}`}>
        {links.map(link => <Link key={link.href} href={link.href} onClick={() => close()} aria-current={link.href === pathname ? 'page' : undefined}>{link.label}</Link>)}
      </div>
      <WaxButton href="/#contacto" secondary className="nav-consult">Consultar <span aria-hidden="true">↗</span></WaxButton>
      <WaxEdge />
    </nav>
  </header>;
}
