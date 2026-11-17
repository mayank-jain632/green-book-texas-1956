import { useMemo, useState } from 'react';
import { ContentNote } from './components/ContentNote.jsx';
import { TexasMap } from './components/map/TexasMap.jsx';
import { Panel } from './components/panel/Panel.jsx';
import { useDataset } from './hooks/useDataset.js';
import { routeView } from './lib/routeMetrics.js';

const DEFAULT_BUFFER_MILES = 10;
const EMPTY_VIEW = { listings: [], towns: [], gap: { miles: null, from: null, to: null } };

export default function App() {
  const { status, data, error } = useDataset();
  const [layers, setLayers] = useState({ listings: true, towns: true });
  const [routeId, setRouteId] = useState('');
  const [buffer, setBuffer] = useState(DEFAULT_BUFFER_MILES);

  const route = useMemo(() => data?.routes.find((r) => r.id === routeId) ?? null, [data, routeId]);
  const view = useMemo(
    () => (data && route ? routeView(data.listings, data.sundown, route.id, buffer) : EMPTY_VIEW),
    [data, route, buffer],
  );

  if (status === 'loading') return <p className="status" role="status">Loading data</p>;
  if (status === 'error') {
    return (
      <p className="status" role="alert">
        The data could not be loaded ({error.message}). Please reload the page.
      </p>
    );
  }

  return (
    <div className="layout">
      <ContentNote />
      <Panel
        routes={data.routes}
        route={route}
        view={view}
        layers={layers}
        onLayers={setLayers}
        routeId={routeId}
        onRoute={setRouteId}
        buffer={buffer}
        onBuffer={setBuffer}
      />
      <main className="map-area">
        <TexasMap
          listings={data.listings}
          towns={data.sundown}
          showListings={layers.listings}
          showTowns={layers.towns}
          route={route}
          view={view}
        />
        <p className="map-caption">
          {route
            ? 'Route lines follow today’s roads, not 1956’s.'
            : 'Locations are approximate; see “About this data.”'}
        </p>
      </main>
    </div>
  );
}
