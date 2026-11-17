export const QUALITY_ADDRESS = 'address match';
export const QUALITY_CITY = 'approximate (city)';

/**
 * Splits listings into individually placed ones and one group per town for
 * listings that could only be placed at a town center. Grouping avoids drawing
 * several stacked markers that falsely suggest separate locations.
 */
export function splitByQuality(listings) {
  const placed = listings.filter((l) => l.location_quality === QUALITY_ADDRESS);
  const byCity = new Map();
  for (const listing of listings) {
    if (listing.location_quality === QUALITY_ADDRESS) continue;
    const members = byCity.get(listing.city) ?? [];
    byCity.set(listing.city, [...members, listing]);
  }
  const groups = [...byCity.entries()].map(([city, members]) => ({
    city,
    lat: members[0].lat,
    lon: members[0].lon,
    members,
  }));
  return { placed, groups };
}
