import { useEffect, useMemo } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { ListingMarkers, TownMarkers } from './MapLayers.jsx';
import { cumulativeMiles, sliceRoute } from '../../lib/routeMetrics.js';
import { splitByQuality } from '../../lib/groupListings.js';

const TEXAS_BOUNDS = [[25.6, -106.8], [36.6, -93.3]];
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function FitToRoute({ route }) {
  const map = useMap();
  useEffect(() => {
    const motion = !prefersReducedMotion();
    if (route) {
      const latLngs = route.coordinates.map(([lon, lat]) => [lat, lon]);
      map.fitBounds(latLngs, { padding: [40, 40], animate: motion });
    } else {
      map.fitBounds(TEXAS_BOUNDS, { animate: motion });
    }
  }, [map, route]);
  return null;
}

export function TexasMap({ listings, towns, showListings, showTowns, route, view }) {
  const split = useMemo(() => splitByQuality(listings), [listings]);
  const cumulative = useMemo(() => (route ? cumulativeMiles(route.coordinates) : null), [route]);

  const activeIds = useMemo(() => {
    if (!route) return new Set([...listings, ...towns].map((p) => p.id));
    return new Set([...view.listings, ...view.towns].map((p) => p.id));
  }, [route, view, listings, towns]);

  const gapLine = useMemo(() => {
    if (!route || view.gap.miles === null) return null;
    const start = view.gap.from.route_fit[route.id][1];
    const end = view.gap.to.route_fit[route.id][1];
    return sliceRoute(route.coordinates, cumulative, start, end);
  }, [route, view, cumulative]);

  return (
    <MapContainer
      bounds={TEXAS_BOUNDS}
      className="texas-map"
      zoomAnimation={!prefersReducedMotion()}
      aria-label="Map of Texas showing 1956 Green Book listings and sundown town database entries"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={18}
      />
      <FitToRoute route={route} />
      {route && (
        <Polyline
          positions={route.coordinates.map(([lon, lat]) => [lat, lon])}
          pathOptions={{ color: '#1d1a16', weight: 4, opacity: 0.85 }}
          interactive={false}
        />
      )}
      {gapLine && (
        <Polyline
          positions={gapLine}
          pathOptions={{ color: '#b4580a', weight: 8, opacity: 0.8, dashArray: '2 10', lineCap: 'round' }}
          interactive={false}
        />
      )}
      {showListings && <ListingMarkers placed={split.placed} groups={split.groups} activeIds={activeIds} />}
      {showTowns && <TownMarkers towns={towns} activeIds={activeIds} />}
    </MapContainer>
  );
}
