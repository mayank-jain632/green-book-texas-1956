import { listingIcon, cityGroupIcon, townIcon } from '../map/markerIcons.js';

const iconHtml = (icon) => ({ __html: icon.options.html });

const ITEMS = [
  { icon: listingIcon(), text: 'Green Book listing placed at its printed address (today’s street grid)' },
  { icon: cityGroupIcon(3), text: 'Listings placed only at a town center, with a count (approximate)' },
  { icon: townIcon('Surely'), text: 'Sundown entry rated “Surely” by the database entry' },
  { icon: townIcon('Probable'), text: 'Sundown entry rated “Probable”' },
  { icon: townIcon('Possible'), text: 'Sundown entry rated “Possible”' },
];

export function Legend() {
  return (
    <section aria-labelledby="legend-heading" className="control-block">
      <h2 id="legend-heading">Legend</h2>
      <ul className="legend">
        {ITEMS.map((item) => (
          <li key={item.text}>
            <span className="legend-icon" dangerouslySetInnerHTML={iconHtml(item.icon)} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <p className="muted">
        Ratings are the database entries&rsquo; own wording, not a conclusion drawn by this project. Dimmed
        markers are outside the selected route&rsquo;s buffer.
      </p>
    </section>
  );
}
