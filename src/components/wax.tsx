import Link from 'next/link';
import { useId, type ReactNode } from 'react';

// A drop hangs from `left` percent of the edge (best placed in a wave trough); `size` scales the default drop.
export type WaxDrop = readonly [left: number, size: number];
const defaultDrops: readonly WaxDrop[] = [[25.1, 1.15], [60.7, .9], [77.6, 1.2]];

// Melted lip from the original mockups: a rolled lip with shallow, uneven waves and a few rounded drops.
// The lip stretches with the edge; drops keep their own proportions so they stay round at any width.
const lipPath = 'M0 0H1000V8C990 14 976 19 952 19C922 19 906 11 872 11C838 11 822 20 784 20C752 20 738 12 704 12C664 12 650 17 614 18C578 19 562 11 526 11C486 11 470 21 430 21C394 21 380 13 346 13C310 13 296 18 258 18C222 18 208 10 174 10C138 10 124 18 88 18C56 18 30 13 0 10Z';
const shinePath = 'M10 5C32 9 58 12 88 12C124 12 138 4 174 4C208 4 222 12 258 12C296 12 310 7 346 7C380 7 394 15 430 15C470 15 486 5 526 5C562 5 578 13 614 12C650 11 664 6 704 6C738 6 752 14 784 14C822 14 838 5 872 5C906 5 922 13 952 13C972 13 986 9 994 5';
const dropPath = 'M0 0C5 0 5.5 6 5.5 12C5.5 17 3 20 3 26C3 31 6 34 10 34C14 34 17 31 17 26C17 20 14.5 17 14.5 12C14.5 6 15 0 20 0Z';

function MeltEdge({ className, drops }: { className: string; drops: readonly WaxDrop[] }) {
  const id = useId();
  const lip = <svg width="100%" height="28" viewBox="0 0 1000 24" preserveAspectRatio="none" overflow="visible">
    <path fill="currentColor" d={lipPath} />
    <path fill={`url(#${id}-lip)`} d={lipPath} />
  </svg>;
  return <svg className={`wax-edge is-melt ${className}`} aria-hidden="true" focusable="false">
    <defs>
      {/* Same color as the surface at the join, then a soft crease, a satin band on the roll and a darker underside. */}
      <linearGradient id={`${id}-lip`} x1="0" y1="0" x2="0" y2="1">
        <stop offset=".1" stopColor="black" stopOpacity="0" />
        <stop offset=".34" stopColor="black" stopOpacity=".08" />
        <stop offset=".62" stopColor="white" stopOpacity=".2" />
        <stop offset="1" stopColor="black" stopOpacity=".28" />
      </linearGradient>
      <radialGradient id={`${id}-bulb`} cx=".4" cy=".38" r=".62">
        <stop offset="0" stopColor="white" stopOpacity=".42" />
        <stop offset=".5" stopColor="white" stopOpacity="0" />
        <stop offset="1" stopColor="black" stopOpacity=".3" />
      </radialGradient>
    </defs>
    {lip}
    {/* Each drop is its own group so the page can let it swell slowly; the lip itself never moves. */}
    {drops.map(([left, size]) => <g key={left} className="wax-drop"><svg x={`${left}%`} y="9" width={16 * size} height={25 * size} viewBox="0 0 20 36" preserveAspectRatio="none" overflow="visible">
      <path fill="currentColor" d={dropPath} />
      <circle cx="10" cy="26.5" r="7.2" fill={`url(#${id}-bulb)`} />
      <ellipse cx="7.6" cy="24" rx="1.6" ry="2.6" fill="white" fillOpacity=".6" />
    </svg></g>)}
    {/* The satin highlight runs along the roll, across the tops of the drops; the sheen is a short reflection that can travel along it. */}
    <svg width="100%" height="28" viewBox="0 0 1000 24" preserveAspectRatio="none" overflow="visible">
      <path d={shinePath} fill="none" stroke="white" strokeOpacity=".38" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path className="wax-sheen" d={shinePath} pathLength={100} strokeDasharray="6 94" fill="none" stroke="white" strokeOpacity=".7" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  </svg>;
}

// Default: one soft melted lip, two shallow, rounded swells joined to the surface, with no hanging drops or contour line.
// `variant="melt"` is the fuller mockup lip with drops, used only on the home page.
export function WaxEdge({ className = '', variant = 'satin', drops = defaultDrops }: { className?: string; variant?: 'satin' | 'melt'; drops?: readonly WaxDrop[] }) {
  const id = useId();
  if (variant === 'melt') return <MeltEdge className={className} drops={drops} />;
  return <svg className={`wax-edge ${className}`} viewBox="0 0 600 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id={`${id}-satin`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="black" stopOpacity=".12" />
      <stop offset=".45" stopColor="white" stopOpacity=".16" />
      <stop offset="1" stopColor="black" stopOpacity=".18" />
    </linearGradient></defs>
    {['currentColor', `url(#${id}-satin)`].map(fill => <path key={fill} fill={fill} d="M0 0H600V4C566 6 536 4 516 6C500 7 497 14 485 14C473 14 471 7 456 6C410 3 362 7 318 6S236 4 196 6C182 7 179 11 171 11C163 11 160 7 150 6C104 3 52 7 0 4Z" />)}
  </svg>;
}

// Satin highlight and shade on a rounded rim; the rim itself is the frame border.
export function WaxRim() {
  return <span className="wax-rim" aria-hidden="true" />;
}

export function WaxFrame({ children, className = '', tone = 'rose' }: { children: ReactNode; className?: string; tone?: 'rose' | 'oat' | 'sage' }) {
  return <div className={`wax-frame tone-${tone} ${className}`}><WaxRim /><div className="frame-inner">{children}</div></div>;
}

export function WaxButton({ children, href, secondary = false, external = false, className = '' }: { children: ReactNode; href: string; secondary?: boolean; external?: boolean; className?: string }) {
  return <Link className={`wax-button ${secondary ? 'secondary' : ''} ${className}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
    <span>{children}</span>
  </Link>;
}

export function Flourish() {
  return <div className="flourish" aria-hidden="true"><span /><svg viewBox="0 0 24 28"><path d="M12 1C10 10 4 14 4 19a8 8 0 0016 0C20 14 14 10 12 1Z" fill="currentColor"/><path d="M8 18q-2 5 3 6" fill="none" stroke="white" strokeOpacity=".5"/></svg><span /></div>;
}
