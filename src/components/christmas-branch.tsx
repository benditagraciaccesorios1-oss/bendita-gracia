import { useId } from 'react';

// Layered vector needles and spherical highlights stay sharp at every screen density.
export function ChristmasBranch({ right = false }: { right?: boolean }) {
  const id = useId().replace(/:/g, '');
  const paint = (name: string) => `url(#${id}-${name})`;
  const needles = Array.from({ length: 15 }, (_, index) => 10 + index * 7);
  return <svg className={`christmas-corner${right ? ' christmas-corner-right' : ''}`} viewBox="0 0 180 160" focusable="false" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-pine`} x1="0" y1="0" x2=".8" y2="1">
        <stop stopColor="#a4b583" /><stop offset=".32" stopColor="#506d3c" /><stop offset=".75" stopColor="#223e2b" /><stop offset="1" stopColor="#102c22" />
      </linearGradient>
      <linearGradient id={`${id}-stem`}><stop stopColor="#342d1c"/><stop offset=".5" stopColor="#8e794b"/><stop offset="1" stopColor="#3b4529"/></linearGradient>
      <radialGradient id={`${id}-gold`} cx="30%" cy="25%" r="78%"><stop stopColor="#fff7d8"/><stop offset=".2" stopColor="#eed38d"/><stop offset=".55" stopColor="#c69b49"/><stop offset=".83" stopColor="#886029"/><stop offset="1" stopColor="#533c24"/></radialGradient>
      <radialGradient id={`${id}-berry`} cx="28%" cy="23%" r="80%"><stop stopColor="#f4c4b5"/><stop offset=".22" stopColor="#c46355"/><stop offset=".65" stopColor="#8f302e"/><stop offset="1" stopColor="#491d24"/></radialGradient>
      <linearGradient id={`${id}-cap`}><stop stopColor="#745c32"/><stop offset=".35" stopColor="#f7dfa0"/><stop offset=".65" stopColor="#bb9145"/><stop offset="1" stopColor="#6c512a"/></linearGradient>
    </defs>
    <g fill="none" stroke={paint('stem')} strokeWidth="4" strokeLinecap="round"><path d="M-9 2Q73 12 145 115M10-8Q15 56 63 116"/></g>
    {['translate(-14 3) rotate(12)', 'translate(8 -16) rotate(64)', 'translate(34 -12) rotate(39)', 'translate(70 -15) rotate(67)', 'translate(-22 34) rotate(31)'].map((transform, branch) => <g key={transform} transform={transform}>
      <path d="M0 0Q59 4 122 24" fill="none" stroke={paint('stem')} strokeWidth="2" />
      {needles.map((x, index) => {
        const y = x * x / 640;
        const length = 24 - index * .65 + branch % 2 * 3;
        return <g key={x}>
          <path d={`M${x} ${y}Q${x - 17} ${y - 7} ${x - 11} ${y - length}Q${x - 5} ${y - 12} ${x + 2} ${y + 1}Z`} fill={paint('pine')} />
          <path d={`M${x} ${y}Q${x - 15} ${y + 8} ${x - 13} ${y + length}Q${x - 4} ${y + 12} ${x + 3} ${y}Z`} fill={paint('pine')} />
          <path d={`M${x} ${y}L${x - 10} ${y - length + 3}`} fill="none" stroke="#c8d1a4" strokeOpacity=".26" strokeWidth=".7" />
        </g>;
      })}
    </g>)}
    <g fill={paint('berry')} stroke="#64252a" strokeWidth=".4"><circle cx="46" cy="36" r="8"/><circle cx="61" cy="37" r="8"/><circle cx="53" cy="49" r="8"/></g>
    <path d="M109 20Q113 44 109 67" fill="none" stroke="#bd9554" strokeWidth="1.3"/>
    <ellipse cx="111" cy="101" rx="21" ry="5" fill="#203522" opacity=".16"/>
    <circle cx="109" cy="83" r="21" fill={paint('gold')} stroke="#95723d" strokeWidth=".6"/>
    <rect x="104" y="60" width="10" height="5" rx="1.5" fill={paint('cap')}/>
    <path d="M106 60Q109 54 112 60" fill="none" stroke="#b29257" strokeWidth="1.4"/>
    <ellipse cx="101" cy="75" rx="5" ry="8" fill="#fff9e6" opacity=".55" transform="rotate(35 101 75)"/>
    <path d="M95 94Q108 105 122 93" fill="none" stroke="#f5d68a" strokeOpacity=".5"/>
    <path d="M72 27Q83 16 92 22Q91 30 78 34Q91 30 97 39Q88 44 75 34Z" fill={paint('berry')} stroke="#67282b" strokeWidth=".8"/>
    <circle cx="76" cy="32" r="4" fill={paint('gold')}/>
  </svg>;
}
