import { AboutData } from './AboutData.jsx';
import { Legend } from './Legend.jsx';
import { RouteControls } from './RouteControls.jsx';
import { RouteResults } from './RouteResults.jsx';
import { ViewControls } from './ViewControls.jsx';

export function Panel({ routes, route, view, layers, onLayers, routeId, onRoute, buffer, onBuffer }) {
  return (
    <aside className="panel" aria-label="Controls and results">
      <header>
        <p className="kicker">Texas, Fall 1956</p>
        <h1>What a Traveler Could Know</h1>
        <p>
          In 1956, a Black family driving across Texas had to plan where to stop. This map puts two kinds of
          information side by side: the hotels and restaurants listed in the <em>Negro Travelers&rsquo;
          Green Book</em>, and towns that later researchers have documented as sundown towns.
        </p>
        <p className="how-to">
          <strong>How to use it:</strong> click any marker on the map to read about it. To look at a drive,
          pick a drive below.
        </p>
      </header>
      <RouteControls routes={routes} routeId={routeId} onRoute={onRoute} />
      {route && <RouteResults route={route} view={view} buffer={buffer} onBuffer={onBuffer} />}
      <ViewControls layers={layers} onLayers={onLayers} />
      <Legend />
      <AboutData />
    </aside>
  );
}
