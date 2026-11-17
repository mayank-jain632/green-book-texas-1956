// Pure helpers for the route panel. Positions and distances are in miles and were
// precomputed in Python (scripts/compute_routes.py); this file only applies the
// buffer setting and finds the longest stretch between consecutive listings.

const EARTH_RADIUS_MILES = 3958.8;
const toRad = (deg) => (deg * Math.PI) / 180;

function haversine([lon1, lat1], [lon2, lat2]) {
  const h =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/** Running distance in miles at each [lon, lat] vertex. */
export function cumulativeMiles(coordinates) {
  const out = [0];
  for (let i = 1; i < coordinates.length; i += 1) {
    out.push(out[i - 1] + haversine(coordinates[i - 1], coordinates[i]));
  }
  return out;
}

/** Sub-line of the route between two positions, as Leaflet [lat, lon] pairs. */
export function sliceRoute(coordinates, cumulative, fromMiles, toMiles) {
  const part = [];
  for (let i = 0; i < coordinates.length; i += 1) {
    if (cumulative[i] >= fromMiles && cumulative[i] <= toMiles) {
      part.push([coordinates[i][1], coordinates[i][0]]);
    }
  }
  return part;
}

const fitFor = (place, routeId) => place.route_fit[routeId];
const isInside = (place, routeId, bufferMiles) => {
  const fit = fitFor(place, routeId);
  return fit !== undefined && fit[0] <= bufferMiles;
};
const alongMiles = (place, routeId) => fitFor(place, routeId)[1];

/**
 * Listings and sundown entries within the buffer of a route, plus the longest
 * distance along the route between two consecutive Green Book listings.
 */
export function routeView(listings, towns, routeId, bufferMiles) {
  const byAlong = (a, b) => alongMiles(a, routeId) - alongMiles(b, routeId);
  const insideListings = listings.filter((p) => isInside(p, routeId, bufferMiles)).sort(byAlong);
  const insideTowns = towns.filter((p) => isInside(p, routeId, bufferMiles)).sort(byAlong);

  let gap = { miles: null, from: null, to: null };
  for (let i = 1; i < insideListings.length; i += 1) {
    const from = insideListings[i - 1];
    const to = insideListings[i];
    const miles = alongMiles(to, routeId) - alongMiles(from, routeId);
    if (gap.miles === null || miles > gap.miles) gap = { miles, from, to };
  }
  return { listings: insideListings, towns: insideTowns, gap };
}
