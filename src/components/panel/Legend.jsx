import { listingIcon, cityGroupIcon, townIcon } from '../map/markerIcons.js';

const iconHtml = (icon) => ({ __html: icon.options.html });

const ITEMS = [
  { icon: listingIcon(), text: 'Green Book listing, at its printed address' },
  { icon: cityGroupIcon(3), text: 'Green Book listings placed only at a town center (the number is how many)' },
  { icon: townIcon('Surely'), text: 'Sundown town entry. The fuller the diamond, the stronger the entry says its evidence is.' },
];

export function Legend() {
  return (
    <section aria-labelledby="legend-heading" className="control-block">
      <h2 id="legend-heading">What the markers mean</h2>
      <ul className="legend">
        {ITEMS.map((item) => (
          <li key={item.text}>
            <span className="legend-icon" dangerouslySetInnerHTML={iconHtml(item.icon)} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <p className="muted">
        The strength words (Surely, Probable, Possible) are the database&rsquo;s own, not this project&rsquo;s
        conclusion.
      </p>
    </section>
  );
}
