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
          Two kinds of information about Texas roads, side by side: the lodging and restaurants the{' '}
          <em>Negro Travelers&rsquo; Green Book</em> listed in 1956, and what later researchers have
          documented about sundown towns. This map does not rate any route or place.
        </p>
      </header>
      <ViewControls layers={layers} onLayers={onLayers} />
      <RouteControls routes={routes} routeId={routeId} onRoute={onRoute} buffer={buffer} onBuffer={onBuffer} />
      {route && <RouteResults route={route} view={view} buffer={buffer} />}
      <Legend />
      <AboutData />
    </aside>
  );
}
