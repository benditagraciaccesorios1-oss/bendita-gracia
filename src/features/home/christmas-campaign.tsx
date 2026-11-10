'use client';

import { type CSSProperties } from 'react';
import { useChristmasMotion } from '@/components/christmas-theme';
import Link from 'next/link';
import styles from './christmas-campaign.module.css';

// Fixed positions keep server and client decoration identical, with no random hydration changes.
const flakes = [5, 15, 26, 38, 47, 59, 70, 81, 90, 97];

export function ChristmasCampaign() {
  const { paused, toggle } = useChristmasMotion();
  return <section className={`${styles.campaign} container`} aria-label="Navidad en Bendita Gracia" data-paused={paused}>
    <div className={styles.decoration} aria-hidden="true">
      <div className={styles.lights}>
        {flakes.map((left, index) => <span key={left} className={styles.light} data-light aria-hidden="true" style={{ '--left': `${left}%`, '--delay': `${index * -.7}s` } as CSSProperties} />)}
      </div>
      {flakes.map((left, index) => <span key={left} className={styles.snowflake} data-snowflake aria-hidden="true" style={{ '--left': `${left}%`, '--delay': `${index * -1.9}s`, '--duration': `${12 + index % 4}s` } as CSSProperties}>{index % 3 === 0 ? '❄' : '✦'}</span>)}
      <span className={styles.ornament}>✧</span><span className={`${styles.ornament} ${styles.right}`}>✧</span>
    </div>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>UNA NAVIDAD LLENA DE LUZ</p>
      <h2>Encuentra tu detalle favorito para esta Navidad</h2>
      <p className={styles.description}>Velitas, aromas y pequeños detalles para regalar con intención.</p>
      <Link className={styles.cta} href="/catalogo?categoria=temporada"><svg className={styles.giftIcon} viewBox="0 0 24 26" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11H21V24H3ZM2 7H22V12H2ZM12 7V24M12 7C3 8 3 0 7 2C10 3 12 7 12 7ZM12 7C21 8 21 0 17 2C14 3 12 7 12 7Z"/></g></svg>Descubre la colección navideña <span aria-hidden="true">↗</span></Link>
    </div>
    <button className={styles.pause} type="button" aria-pressed={paused} onClick={toggle}>
      <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span> {paused ? 'Reanudar animaciones navideñas' : 'Pausar animaciones navideñas'}
    </button>
  </section>;
}
