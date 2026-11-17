import { QUALITY_ADDRESS } from '../../lib/groupListings.js';

const NYPL_BOOK = 'https://digitalcollections.nypl.org/items/9d4e7020-83b9-0132-4aed-58d385a7b928';
const pageImage = (id) => `https://images.nypl.org/index.php?id=${id}&t=w`;

export function QualityNote({ listing }) {
  return listing.location_quality === QUALITY_ADDRESS ? (
    <p className="popup-note">
      <strong>Location: address match.</strong> Placed at the same street address on today&rsquo;s map.
      Streets may have been renamed or renumbered since 1956.
    </p>
  ) : (
    <p className="popup-note">
      <strong>Location: approximate (city).</strong> The printed address could not be placed, so this
      listing is shown at the center of {listing.city}.
    </p>
  );
}

/** One Green Book listing, shown as printed in the Fall 1956 edition. */
export function ListingPopup({ listing }) {
  return (
    <article className="popup">
      <p className="popup-era popup-era-1956">1956 information, as printed</p>
      <h3>{listing.name}</h3>
      <p className="popup-meta">
        {listing.category}, {listing.city}
      </p>
      <p>
        <span className="popup-label">Address as printed:</span>{' '}
        {listing.address_raw || 'no address printed'}
      </p>
      <QualityNote listing={listing} />
      <p className="popup-source">
        Source: <a href={NYPL_BOOK}>The Negro Travelers&rsquo; Green Book, Fall 1956</a> (NYPL), page image{' '}
        <a href={pageImage(listing.source_page_image_id)}>{listing.source_page_image_id}</a>. Being listed was
        not a guarantee of protection or welcome.
      </p>
    </article>
  );
}

/** Several listings that share one approximate town-center point. */
export function CityGroupPopup({ group }) {
  return (
    <article className="popup">
      <p className="popup-era popup-era-1956">1956 information, as printed</p>
      <h3>
        {group.members.length} {group.members.length === 1 ? 'listing' : 'listings'} in {group.city}
      </h3>
      <p className="popup-note">
        <strong>Location: approximate (city).</strong> These could not be placed at a street address, so
        they share one point at the center of {group.city}. They are not at the same place.
      </p>
      <ul className="popup-list">
        {group.members.map((m) => (
          <li key={m.id}>
            {m.name} <span className="popup-meta">({m.category}; {m.address_raw || 'no address printed'})</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
