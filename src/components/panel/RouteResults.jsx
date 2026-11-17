const mi = (n) => `${Math.round(n)} miles`;
const label = (p) => `${p.name} (${p.city}${p.location_quality === 'address match' ? '' : ', placed at town center'})`;

export function RouteResults({ route, view, buffer }) {
  const { gap, listings, towns } = view;
  const approx = gap.miles !== null && [gap.from, gap.to].some((p) => p.location_quality !== 'address match');
  const listingTowns = new Set(listings.map((l) => l.city)).size;

  return (
    <section aria-labelledby="results-heading" className="control-block results" aria-live="polite">
      <h2 id="results-heading">{route.name}</h2>
      <p className="map-note">
        The route line follows today&rsquo;s road network. Many of these roads, and the interstates, did not
        exist as they do now in 1956.
      </p>

      <h3>Longest stretch with no listed lodging or food within {buffer} miles</h3>
      {gap.miles === null ? (
        <p>Fewer than two Green Book listings are within {buffer} miles of this route, so no stretch can be measured.</p>
      ) : (
        <>
          <p className="big-number">
            {mi(gap.miles)}
          </p>
          <p>
            Between {label(gap.from)} and {label(gap.to)}, measured along the route. Shown as a dotted
            orange line on the map.
          </p>
          {approx && (
            <p className="map-note">
              At least one end is placed at a town center, so this distance is approximate.
            </p>
          )}
        </>
      )}

      <h3>Green Book listings within {buffer} miles</h3>
      <p>
        {listings.length} {listings.length === 1 ? 'listing' : 'listings'} in {listingTowns}{' '}
        {listingTowns === 1 ? 'town' : 'towns'}. The Texas section lists lodging and restaurants only, so
        gas, repairs, and other services are not counted.
      </p>

      <h3>Sundown town entries within {buffer} miles</h3>
      {towns.length === 0 ? (
        <p>No entries from this sample. That does not mean none existed: the database is incomplete.</p>
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
    </section>
  );
}
