import { useEffect, useRef } from 'react';
import { MAX_BUFFER, MIN_BUFFER } from './RouteControls.jsx';

const mi = (n) => `${Math.round(n)} miles`;
const label = (p) => `${p.name} (${p.city}${p.location_quality === 'address match' ? '' : ', placed at town center'})`;

export function RouteResults({ route, view, buffer, onBuffer }) {
  const { gap, listings, towns } = view;
  const approx = gap.miles !== null && [gap.from, gap.to].some((p) => p.location_quality !== 'address match');
  const ref = useRef(null);
  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ref.current?.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
  }, [route.id]);
  const listingTowns = new Set(listings.map((l) => l.city)).size;

  return (
    <section ref={ref} aria-labelledby="results-heading" className="control-block results" aria-live="polite">
      <h2 id="results-heading">{route.name}</h2>
      <p className="map-note">
        The drawn road is today&rsquo;s road. Many of these roads did not exist in this form in 1956.
        &ldquo;Nearby&rdquo; here means within {buffer} miles of the road.
      </p>

      <h3>Longest stretch with no Green Book listing within {buffer} miles</h3>
      {gap.miles === null ? (
        <p>Fewer than two Green Book listings are within {buffer} miles of this drive, so no stretch can be measured.</p>
      ) : (
        <>
          <p className="big-number">{mi(gap.miles)}</p>
          <p>
            From {label(gap.from)} to {label(gap.to)}. It is the dotted orange line on the map.
          </p>
          {approx && (
            <p className="map-note">At least one end is only placed at a town center, so this is approximate.</p>
          )}
        </>
      )}

      <h3>Green Book listings along the drive</h3>
      <p>
        {listings.length} {listings.length === 1 ? 'listing' : 'listings'} in {listingTowns}{' '}
        {listingTowns === 1 ? 'town' : 'towns'}. The Texas section lists only lodging and restaurants.
      </p>

      <h3>Sundown town entries along the drive</h3>
      {towns.length === 0 ? (
        <p>None in this sample. That does not mean none existed: the database is incomplete.</p>
      ) : (
        <ul className="plain-list">
          {towns.map((t) => (
            <li key={t.id}>
              <a href={t.entry_url}>{t.place}</a>, entry wording: <strong>{t.status_label}</strong>
              <span className="muted"> (evidence period: {t.evidence_period})</span>
            </li>
          ))}
        </ul>
      )}
      <p className="map-note">
        A town missing from this list is not evidence that it was welcoming. These entries come from later
        research and may not describe 1956.
      </p>

      <details className="advanced">
        <summary>Change how close counts as nearby</summary>
        <label htmlFor="buffer">
          Within <output htmlFor="buffer">{buffer}</output> miles of the road
        </label>
        <input
          id="buffer"
          type="range"
          min={MIN_BUFFER}
          max={MAX_BUFFER}
          step={1}
          value={buffer}
          onChange={(e) => onBuffer(Number(e.target.value))}
        />
      </details>
    </section>
  );
}
