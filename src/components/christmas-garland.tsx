export function ChristmasGarland() {
  return <span className="christmas-garland" aria-hidden="true">
    {Array.from({ length: 12 }, (_, index) => <span key={index} data-christmas-light />)}
  </span>;
}
