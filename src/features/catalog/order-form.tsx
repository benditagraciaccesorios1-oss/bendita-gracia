'use client';

import { useId, useState } from 'react';
import { WaxButton } from '@/components/wax';
import { formatCOP, orderMessage, whatsappUrl, type Product } from '@/data/catalog';
import styles from './order-form.module.css';

// Lets the customer pick presentation, form, fragrance and color; the result is a WhatsApp consultation, not a checkout.
export function OrderForm({ product, phone }: { product: Product; phone: string }) {
  const id = useId();
  const [variant, setVariant] = useState(0);
  const [options, setOptions] = useState<Record<string, string>>({});
  const chosen = product.variants[variant];
  const flexiblePackaging = product.options.some(option => option.id === 'empaque');
  const href = whatsappUrl(phone, undefined, orderMessage(product, { variant, options }));

  return <form className={styles.form} aria-label="Arma tu pedido" onSubmit={event => event.preventDefault()}>
    {product.variants.length > 1 && <fieldset className={styles.presentations}>
      <legend>Presentación</legend>
      {product.variants.map((item, index) => <label key={item.label} className={index === variant ? styles.active : undefined}>
        <input type="radio" name={`${id}-variant`} value={index} checked={index === variant} onChange={() => setVariant(index)} />
        <span>{item.label}</span><strong>{formatCOP(item.priceCOP)}</strong>
      </label>)}
    </fieldset>}
    {product.options.map(option => <label key={option.id} className={styles.field}>
      <span>{option.label}</span>
      {option.values
        ? <select value={options[option.id] ?? ''} onChange={event => setOptions({ ...options, [option.id]: event.target.value })}>
          <option value="">Elige una opción</option>
          {option.values.map(value => <option key={value}>{value}</option>)}
        </select>
        : <input type="text" maxLength={60} placeholder="Cuéntanos tu preferencia" value={options[option.id] ?? ''} onChange={event => setOptions({ ...options, [option.id]: event.target.value })} />}
    </label>)}
    <p className={styles.total} aria-live="polite">{flexiblePackaging ? 'Precio de referencia' : 'Total'} <strong>{formatCOP(chosen.priceCOP)}</strong> <span>{chosen.label}</span></p>
    {flexiblePackaging && <p className={styles.packagingNote}>El precio final varía según el empaque elegido. Consulta las opciones y el valor por WhatsApp.</p>}
    <WaxButton href={href} external>Pedir por WhatsApp <span aria-hidden="true">↗</span></WaxButton>
  </form>;
}
