/** One sundown database entry, paraphrased, with its own labels and a link back. */
export function TownPopup({ town }) {
  return (
    <article className="popup">
      <p className="popup-era popup-era-research">Later research, not information a 1956 traveler had</p>
      <h3>{town.place}</h3>
      <p className="popup-meta">
        {town.place_type === 'county' ? 'County-level entry, shown at the approximate county center' : 'Shown at the approximate town center'}
      </p>
      <dl className="popup-facts">
        <dt>Entry says &ldquo;Sundown Town in the Past?&rdquo;</dt>
        <dd>
          <strong>{town.status_label}</strong>
        </dd>
        <dt>Ordinance</dt>
        <dd>{town.ordinance_label}</dd>
        <dt>Sign</dt>
        <dd>{town.sign_label}</dd>
        <dt>Evidence period as stated</dt>
        <dd>{town.evidence_period}</dd>
        <dt>Documentary source cited</dt>
        <dd>{town.documentary_source_cited}</dd>
      </dl>
      <p>{town.evidence_summary}</p>
      <p className="popup-note">
        Summary paraphrased from the entry. The evidence may not describe 1956. The database is crowdsourced
        and incomplete.
      </p>
      <p className="popup-source">
        <a href={town.entry_url}>Read the full entry</a> (Tougaloo College Sundown Towns Database).
      </p>
    </article>
  );
}
