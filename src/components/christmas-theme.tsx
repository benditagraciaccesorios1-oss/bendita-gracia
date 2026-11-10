'use client';

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react';
import { ChristmasBranch } from './christmas-branch';

const ChristmasMotion = createContext({ paused: false, toggle: () => {} });
export const useChristmasMotion = () => useContext(ChristmasMotion);
const positions = [2, 6, 94, 98, 3, 96, 1, 99];

export function ChristmasTheme({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const toggle = () => setPaused(value => !value);
  return <ChristmasMotion.Provider value={{ paused, toggle }}>
    <div className="christmas-site" data-christmas-paused={paused}>
      <div className="christmas-atmosphere" aria-hidden="true">
        <ChristmasBranch /><ChristmasBranch right />
        {positions.map((left, index) => <span key={index} className="christmas-ambient-flake" data-ambient-flake style={{ '--left': `${left}%`, '--delay': `${index * -3.1}s`, '--duration': `${18 + index % 4}s` } as CSSProperties}>{index % 2 ? '✧' : '❄'}</span>)}
      </div>
      {children}
      <button type="button" className="christmas-motion-toggle" aria-pressed={paused} aria-label={paused ? 'Reanudar ambiente navideño' : 'Pausar ambiente navideño'} onClick={toggle}>
        <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'} ❄</span><span>{paused ? 'Reanudar ambiente navideño' : 'Pausar ambiente navideño'}</span>
      </button>
    </div>
  </ChristmasMotion.Provider>;
}
