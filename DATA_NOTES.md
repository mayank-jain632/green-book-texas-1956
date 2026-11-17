# Data notes

Counts and decisions behind the map. Everything below can be regenerated from the scripts in `scripts/`.

## Green Book listings (Fall 1956, Texas)

- Source pages: NYPL image ids 5206271 to 5206274 (printed pages 60 to 63). The Texas section begins under a "TEXAS" header on page 60 and ends before "UTAH" on page 63.
- **98 listings in 24 towns.** Categories: hotel 31, restaurant 25, tourist home 25, motel 13, other 4.
- The repository's `geojson/` folder contains only the 1947 edition, so no structured 1956 data was available. The 1956 per-page OCR was used as a cross-check.
- **Method.** Each entry was transcribed by hand from the rendered page image. The script `build_greenbook_csv.py` aligns every transcribed entry to its OCR line and records any difference. Nothing was changed silently.
- **OCR result.** 42 of 98 entries matched the OCR exactly. 56 have a note in `data/ocr_corrections.md`. Many of those are only stray characters after the address on page 5206273 (a scan edge artifact). Real corrections include "Hotel The1esa" (Hotel Theresa), "C01pus Chlistie" (Corpus Christi), "Loyal Restau1ant" (Royal Restaurant) and "Hotel Jim 413 15 E. Fifth St." (413-15 E. Fifth St.).
- **Printed gaps and typos.** Armstrong's Motel (Galveston) and Watson's Hotel (Midland) have no address printed. "Restauranut" and "Hourist Home" are typos in the 1956 print; spelling is normalized and flagged in the CSV.
- **Category judgments.** The YMCA and YWCA entries (3) and Sid's Ranch (Houston, the listing does not say what it is) are "other".
- **Scope.** The Texas section lists lodging and restaurants only. No gas stations, garages or other services appear, so the gap measure applies to lodging and food.
- Not verified: names were read from page images by one person (the assistant); a second pair of eyes on the page images would be worthwhile before any publication.

## Geocoding

| Location quality | Listings |
|---|---|
| address match | 71 |
| approximate (city) | 27 |

Why 27 are approximate: 20 had no Census match in the same town on today's street grid (for example Dowling St. in Houston, which has been renamed); 5 are highways, intersections or cross streets; 2 have no printed address.

Decisions:
- A Census match is accepted only if the matched town equals the listing's town **and** the street name matches exactly after normalizing ordinals ("Fifth" and "5th") and "Ft." and "Fort". A first pass accepted "214 Long" as "214 LONGBRANCH LN" (12 km off) and was corrected.
- A different street suffix is rejected ("Wyoming St." vs "WYOMING AVE"). The Census silently swaps suffixes; this may reject a few matches that are in fact right, which is the safer error.
- Town centers come from Nominatim with a structured city query. A first pass returned county centers for Galveston and Midland; the script now rejects non-city results.
- "address match" means the same street address exists today. Streets may have been renamed or renumbered, and the business is long gone.
- Sid's Ranch (8051 W. Montgomery) matches a road address about 13 km from central Houston. It is the northernmost Houston listing, which affects where the Houston to Dallas gap starts.

## Sundown town entries (Tougaloo database)

- robots.txt allows all agents. The site footer says content is copyrighted by James W. Loewen and heirs. Entries were read one at a time (about 25 pages, 1 request per second, descriptive User-Agent). No text was copied: only the entries' short labels, paraphrased summaries and links.
- **Texas entries on the site: 107** (31 county entries and 76 town or place entries) per the site's public sitemaps; the Texas location page links 108. The sitemap may be out of date. **This map includes 19 (18 towns, 1 county), about 18%. It is a partial sample, not a count of sundown towns.**
- Tiers are the entries' own wording for "Sundown Town in the Past?": Surely 8, Probable 2, Possible 9. They are not renamed or upgraded.
- Every included entry lists "Black" as the group excluded.
- **Included (19):** Irving, Slocum, Rio Grande City, Vidor, Alba, De Leon, Comanche, Comanche County, Big Spring, Orange, Nederland, Port Neches, Lumberton, Evadale, Highland Park, Sunnyvale, Everman, Grand Saline, Pasadena.
- **Excluded because the entry states no evidence beyond census data or has no comments (5):** West Orange, White Settlement, Jacinto City, Highlands, Boerne.
- **Reported elsewhere but not on the site:** no entry URL exists for Terrell, Alvin, Elmo or Leggett, so they were not added.
- County is not shown on the town entry pages, so the county column was left out. Comanche County is a county-level entry, shown at the approximate county center.
- **Evidence period** is recorded as the entry states it. Many entries are about other decades (Comanche County 1886 to 1907, Big Spring until World War II, Vidor the 1990s, Highland Park 1913 to 2003). An entry may not describe 1956.
- "Documentary source cited" is this project's reading of each entry's comments (yes, no, or unclear). It is a judgment call.
- A first fetch with an incomplete URL returned Comanche County, Kansas. All fetches now use exact `-tx` URLs and assert the page is a Texas entry.
- Quoted recollections in several entries contain slurs and historical terms. None appear in the repo or UI.

## Routes

- El Paso to Dallas, Houston to Dallas, Houston to Orange. The third replaces the default San Antonio to Houston, which has no sundown entries within 10 miles and only two Green Book towns. Chosen with the project owner after reviewing the data.
- Geometry from the OSRM public demo server (one request per route), cached in `data/routes/`. Today's road network.
- Route endpoints are town centers.
- Reference table at the default 10-mile buffer: `data/route_summary.csv`.

## Known limits

- Green Book listings outside Texas are not shown, so a route near the state line (Houston to Orange) ends where the data ends.
- Mexia (2 listings) is 15.1 miles from the Houston to Dallas route line. It is not counted at the default 10-mile buffer but appears, and shortens the longest stretch, when the buffer is set to 15 miles or more. This shows how sensitive the measure is to the buffer choice.
- The map is a sample. Absence of a marker is not evidence of anything.
