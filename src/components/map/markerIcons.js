import L from 'leaflet';

// Evidence tiers use the sundown database entry's own wording, in this order.
export const TIERS = ['Surely', 'Probable', 'Possible'];

const svgIcon = (html, size) =>
  L.divIcon({
    className: 'marker-icon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });

/** Solid circle: a listing placed at its printed street address on today's map. */
export const listingIcon = () =>
  svgIcon(
    '<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><circle cx="9" cy="9" r="6.5" class="mk-listing"/></svg>',
    18,
  );

/** Dashed ring with a count: listings that could only be placed at a town center. */
export const cityGroupIcon = (count) =>
  svgIcon(
    `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><circle cx="14" cy="14" r="11" class="mk-city"/><text x="14" y="18.5" text-anchor="middle" class="mk-count">${Number(count)}</text></svg>`,
    28,
  );

const DIAMOND = 'M12 2 L22 12 L12 22 L2 12 Z';
const LEFT_HALF = 'M12 2 L2 12 L12 22 Z';

/** Diamond: a sundown database entry. Fill shows the entry's own rating. */
export function townIcon(tier) {
  const fill =
    tier === 'Surely'
      ? `<path d="${DIAMOND}" class="mk-town mk-town-solid"/>`
      : tier === 'Probable'
        ? `<path d="${DIAMOND}" class="mk-town mk-town-empty"/><path d="${LEFT_HALF}" class="mk-town-half"/>`
        : `<path d="${DIAMOND}" class="mk-town mk-town-empty"/>`;
  return svgIcon(`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${fill}</svg>`, 24);
}
