import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cumulativeMiles, routeView, sliceRoute } from '../src/lib/routeMetrics.js';

const load = (name) => JSON.parse(readFileSync(`public/data/${name}.json`, 'utf8'));
const routes = load('routes');
const listings = load('listings');
const sundown = load('sundown');

const parseSummary = () => {
  const [header, ...rows] = readFileSync('data/route_summary.csv', 'utf8').trim().split('\n');
  const keys = header.split(',');
  return rows.map((row) => {
    const cells = row.match(/("[^"]*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, ''));
    return Object.fromEntries(keys.map((k, i) => [k, cells[i]]));
  });
};

describe('routeView', () => {
  it('matches the Python reference table at the default 10 mile buffer', () => {
    for (const row of parseSummary()) {
      const route = routes.find((r) => r.name === row.route);
      const view = routeView(listings, sundown, route.id, 10);
      expect(view.listings).toHaveLength(Number(row.listings_in_buffer));
      expect(view.towns).toHaveLength(Number(row.sundown_entries_in_buffer));
      expect(view.gap.miles).toBeCloseTo(Number(row.longest_gap_miles), 0);
    }
  });

  it('never loses listings when the buffer grows', () => {
    const small = routeView(listings, sundown, 'houston-orange', 3);
    const large = routeView(listings, sundown, 'houston-orange', 25);
    expect(large.listings.length).toBeGreaterThanOrEqual(small.listings.length);
  });

  it('reports no gap when fewer than two listings are in the buffer', () => {
    const view = routeView(listings, sundown, 'houston-orange', 0);
    expect(view.gap.miles).toBeNull();
  });

  it('sorts flagged towns by position along the route', () => {
    const { towns } = routeView(listings, sundown, 'houston-orange', 10);
    const along = towns.map((t) => t.route_fit['houston-orange'][1]);
    expect([...along].sort((a, b) => a - b)).toEqual(along);
  });

  it('does not mutate its inputs', () => {
    const before = JSON.stringify(listings);
    routeView(listings, sundown, 'el-paso-dallas', 10);
    expect(JSON.stringify(listings)).toBe(before);
  });
});

describe('sliceRoute', () => {
  const route = routes.find((r) => r.id === 'houston-orange');
  const cumulative = cumulativeMiles(route.coordinates);

  it('computes a total length near the stored length', () => {
    expect(cumulative.at(-1)).toBeCloseTo(route.length_miles, 0);
  });

  it('returns a sub-line between two positions', () => {
    const part = sliceRoute(route.coordinates, cumulative, 20, 40);
    expect(part.length).toBeGreaterThan(1);
    expect(part.length).toBeLessThan(route.coordinates.length);
  });
});
