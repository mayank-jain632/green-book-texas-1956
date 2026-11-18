const PRESETS = [
  { id: 'both', label: 'Show both', hint: 'Green Book listings and sundown town entries', listings: true, towns: true },
  { id: 'know', label: 'Only what a 1956 traveler could have had', hint: 'Green Book listings', listings: true, towns: false },
  { id: 'research', label: 'Only what later research tells us', hint: 'sundown town entries', listings: false, towns: true },
];

const presetFor = (layers) =>
  PRESETS.find((p) => p.listings === layers.listings && p.towns === layers.towns)?.id ?? 'both';

export function ViewControls({ layers, onLayers }) {
  const current = presetFor(layers);
  return (
    <section aria-labelledby="view-heading" className="control-block">
      <h2 id="view-heading">
        <span className="step">2</span> Choose what to show
      </h2>
      <fieldset>
        <legend className="visually-hidden">What to show on the map</legend>
        {PRESETS.map((preset) => (
          <label key={preset.id} className="choice card">
            <input
              type="radio"
              name="view"
              checked={current === preset.id}
              onChange={() => onLayers({ listings: preset.listings, towns: preset.towns })}
            />
            <span>
              {preset.label} <em>({preset.hint})</em>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="muted">
        The Green Book is what travelers could actually consult in 1956. The sundown research began around
        1999, so it often describes other years.
      </p>
    </section>
  );
}
