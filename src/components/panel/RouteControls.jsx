export const MIN_BUFFER = 1;
export const MAX_BUFFER = 30;

export function RouteControls({ routes, routeId, onRoute, buffer, onBuffer }) {
  return (
    <section aria-labelledby="route-heading" className="control-block">
      <h2 id="route-heading">Sample routes</h2>
      <fieldset>
        <legend>Choose a route</legend>
        <label className="choice">
          <input type="radio" name="route" checked={routeId === ''} onChange={() => onRoute('')} />
          <span>No route</span>
        </label>
        {routes.map((r) => (
          <label key={r.id} className="choice">
            <input type="radio" name="route" checked={routeId === r.id} onChange={() => onRoute(r.id)} />
            <span>
              {r.name} <em>({Math.round(r.length_miles)} mi on today&rsquo;s roads)</em>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="buffer">
        <label htmlFor="buffer">
          Buffer: count places within <output htmlFor="buffer">{buffer}</output> miles of the route line
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
      </div>
    </section>
  );
}
