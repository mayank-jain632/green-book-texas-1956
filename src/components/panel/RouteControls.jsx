export const MIN_BUFFER = 1;
export const MAX_BUFFER = 30;

export function RouteControls({ routes, routeId, onRoute }) {
  return (
    <section aria-labelledby="route-heading" className="control-block">
      <h2 id="route-heading">
        <span className="step">1</span> Pick a drive
      </h2>
      <fieldset>
        <legend className="visually-hidden">Choose a drive</legend>
        <label className="choice card">
          <input type="radio" name="route" checked={routeId === ''} onChange={() => onRoute('')} />
          <span>Just show the map</span>
        </label>
        {routes.map((r) => (
          <label key={r.id} className="choice card">
            <input type="radio" name="route" checked={routeId === r.id} onChange={() => onRoute(r.id)} />
            <span>
              {r.name} <em>({Math.round(r.length_miles)} miles)</em>
            </span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
