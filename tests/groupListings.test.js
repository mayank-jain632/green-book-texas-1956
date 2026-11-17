import { describe, expect, it } from 'vitest';
import { splitByQuality } from '../src/lib/groupListings.js';

const make = (id, city, quality) => ({ id, city, lat: 1, lon: 2, location_quality: quality });

describe('splitByQuality', () => {
  const input = [
    make('a', 'Dallas', 'address match'),
    make('b', 'Dallas', 'approximate (city)'),
    make('c', 'Dallas', 'approximate (city)'),
    make('d', 'Waco', 'approximate (city)'),
  ];

  it('keeps address matches as individual markers', () => {
    expect(splitByQuality(input).placed.map((l) => l.id)).toEqual(['a']);
  });

  it('groups approximate listings by town', () => {
    const { groups } = splitByQuality(input);
    expect(groups.map((g) => [g.city, g.members.length])).toEqual([['Dallas', 2], ['Waco', 1]]);
  });

  it('does not mutate the input', () => {
    const copy = JSON.stringify(input);
    splitByQuality(input);
    expect(JSON.stringify(input)).toBe(copy);
  });
});
