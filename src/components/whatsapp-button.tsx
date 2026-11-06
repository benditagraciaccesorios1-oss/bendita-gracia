import { displayPhone, whatsappPhone, whatsappUrl } from '@/data/catalog';

// Floating shortcut to the brand's WhatsApp chat, present on every page.
export function WhatsAppButton() {
  return <a className="whatsapp-float" href={whatsappUrl(whatsappPhone)} target="_blank" rel="noopener noreferrer" aria-label={`Escríbenos por WhatsApp al ${displayPhone(whatsappPhone)}`}>
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.5-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.6 14.6 0 0 0 5.6 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.2-.3-.3-.7-.4Z" />
    </svg>
    <span className="whatsapp-float-label">WhatsApp</span>
  </a>;
}
