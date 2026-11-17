const PRESETS = [
  { id: 'both', label: 'Both layers', listings: true, towns: true },
  { id: 'know', label: 'Only what a 1956 traveler could have had', listings: true, towns: false },
  { id: 'research', label: 'Only what later research tells us', listings: false, towns: true },
];

const presetFor = (layers) =>
  PRESETS.find((p) => p.listings === layers.listings && p.towns === layers.towns)?.id ?? 'custom';

export function ViewControls({ layers, onLayers }) {
  const current = presetFor(layers);
  return (
    <section aria-labelledby="view-heading" className="control-block">
      <h2 id="view-heading">What a traveler could know, and what we know now</h2>
      <fieldset>
        <legend>Information view</legend>
        {PRESETS.map((preset) => (
          <label key={preset.id} className="choice">
            <input
              type="radio"
              name="view"
              checked={current === preset.id}
              onChange={() => onLayers({ listings: preset.listings, towns: preset.towns })}
            />
            <span>{preset.label}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Layers</legend>
        <label className="choice">
          <input
            type="checkbox"
            checked={layers.listings}
            onChange={(e) => onLayers({ ...layers, listings: e.target.checked })}
          />
          <span>
            Green Book listings <em>(1956, contemporary information)</em>
          </span>
        </label>
        <label className="choice">
          <input
            type="checkbox"
            checked={layers.towns}
            onChange={(e) => onLayers({ ...layers, towns: e.target.checked })}
          />
          <span>
            Sundown town entries <em>(later research, from 1999 onward)</em>
          </span>
        </label>
      </fieldset>
    </section>
  );
}
