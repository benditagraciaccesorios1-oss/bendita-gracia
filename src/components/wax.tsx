import Link from 'next/link';
import type { ReactNode } from 'react';

export function WaxEdge({ className = '' }: { className?: string }) {
  return <svg className={`wax-edge ${className}`} viewBox="0 0 600 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 0H600V6C550 2 537 14 492 7C469 4 466 6 463 16C461 28 450 27 450 16C450 6 436 7 412 8C345 15 317 3 287 8C273 10 270 11 269 19C268 28 259 28 258 18C257 8 240 7 219 9C163 16 141 2 103 7C74 11 63 14 36 8C17 4 10 7 0 9Z" fill="currentColor" />
    <path d="M0 5C30 1 49 15 83 8S135 5 158 8S201 13 225 9S269 7 287 8S325 12 350 9S397 8 420 8S453 5 463 7S493 13 521 8S572 6 600 5" fill="none" stroke="white" strokeOpacity=".36" strokeWidth="1.5" />
  </svg>;
}

export function WaxFrame({ children, className = '', tone = 'rose' }: { children: ReactNode; className?: string; tone?: 'rose' | 'oat' | 'sage' }) {
  return <div className={`wax-frame tone-${tone} ${className}`}><div className="frame-inner">{children}</div><WaxEdge /></div>;
}

export function WaxButton({ children, href, secondary = false, external = false, className = '' }: { children: ReactNode; href: string; secondary?: boolean; external?: boolean; className?: string }) {
  return <Link className={`wax-button ${secondary ? 'secondary' : ''} ${className}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
    <span>{children}</span><WaxEdge />
  </Link>;
}

export function Flourish() {
  return <div className="flourish" aria-hidden="true"><span /><svg viewBox="0 0 24 28"><path d="M12 1C10 10 4 14 4 19a8 8 0 0016 0C20 14 14 10 12 1Z" fill="currentColor"/><path d="M8 18q-2 5 3 6" fill="none" stroke="white" strokeOpacity=".5"/></svg><span /></div>;
}
