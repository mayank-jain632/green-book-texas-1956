# What a Traveler Could Know: Texas, Fall 1956

An interactive map of Texas built for a UT Austin African American history class (AFR 315K). It puts two kinds of real historical data side by side:

1. **What a 1956 traveler could look up.** Lodging and restaurant listings from the Texas section of *The Negro Travelers' Green Book*, Fall 1956 edition (98 listings in 24 towns).
2. **What later research documents.** A hand-compiled sample of 19 entries from the Tougaloo College Sundown Towns Database, each labeled with the entry's own evidence wording.

Live site: https://mayank-jain632.github.io/green-book-texas-1956/

## The argument

For Black travelers in the 1950s, knowing where it was possible to stop was a patchwork of incomplete, often word-of-mouth information. It was not a map. A tool that claimed to route someone to a protected destination would misrepresent that history. So this app never rates a route or a place. It shows:

- Green Book listings, as printed in 1956;
- documented sundown town entries, labeled by the evidence level the database itself uses;
- for each of three sample routes, the longest stretch with no Green Book listing, with plain statements of what the data leaves out.

This is a class project, not a publication. The data is imperfect and the app says where.

## The metric, in plain words

For a selected route and a buffer (default 10 miles, adjustable from 1 to 30):

- **Listings within the buffer:** Green Book listings whose location is within the buffer distance of the route line.
- **Sundown entries within the buffer:** database entries (from the 19 in this sample) within the same distance.
- **Longest stretch with no listed lodging or food within the buffer:** take the listings inside the buffer, sort them by position along the route, and find the largest distance between two consecutive ones. The two listings bracketing that stretch are named. If either is only placed at a town center, the app says the figure is approximate.

Distances are in miles. Each place was projected onto the route line once in Python (`scripts/compute_routes.py`), storing its distance from the line and its position along the line. The browser applies the buffer and finds the gap (`src/lib/routeMetrics.js`). A test checks that the browser numbers equal the Python reference table (`data/route_summary.csv`) at 10 miles.

Default results at 10 miles:

| Route | Length (today's roads) | Listings | Sundown entries | Longest stretch |
|---|---|---|---|---|
| El Paso to Dallas | 635 mi | 26 | 4 | 304 mi (El Paso to Midland, both placed at town centers) |
| Houston to Dallas | 240 mi | 24 | 2 | 175 mi (Houston to Corsicana) |
| Houston to Orange | 110 mi | 15 | 5 | 84 mi (Houston to Beaumont) |

## Limitations

- **Routes use today's road network**, from the OSRM demo server, not 1956's. Interstates did not exist as they do now.
- **The Green Book listed businesses, not towns.** Being listed was not a guarantee of protection or welcome.
- **One edition, one state.** Fall 1956, Texas only, lodging and restaurants only. The Texas section lists no gas stations or other services, so the gap measure applies to lodging and food.
- **The sundown database is crowdsourced and incomplete.** A town missing from it is not evidence it was welcoming. This sample is 19 of about 107 Texas entries.
- **Sundown evidence is often not about 1956.** Entries describe the 1880s through the 1990s. Each entry's own evidence period is shown.
- **OCR and geocoding errors exist.** 71 of 98 listings are placed at a matching street address on today's street grid; 27 are placed at a town center and flagged "approximate (city)". Even an "address match" only means the address exists today, not that the business did.
- Not every route-adjacent place is represented: the map does not show Green Book listings outside Texas.

See `DATA_NOTES.md` for counts, corrections and exclusions.

## Run it

```bash
npm ci
npm run dev        # http://127.0.0.1:5173
npm run build      # static site in dist/
npm run validate   # data checks
npx vitest run     # JavaScript unit tests
python3 -m unittest discover -s tests/py
npx playwright install chromium && npx playwright test   # browser, accessibility, responsive tests
```

## How the data was built

Raw OCR and the PDF are not committed. Fetch them to a temporary folder:

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/NYPL-publicdomain/greenbooks /tmp/nypl-greenbooks
cd /tmp/nypl-greenbooks && git sparse-checkout set 1956 geojson
```

1. **Listings.** The repository's `geojson/` folder only has the 1947 edition, so the 1956 OCR was used. The Texas section is on page images 5206271 to 5206274. Entries were transcribed by hand from the page images into `data/greenbook_texas_1956_transcription.tsv`, then compared with the OCR:
   `python3 scripts/build_greenbook_csv.py /tmp/nypl-greenbooks/1956` writes `data/greenbook_texas_1956.csv` and `data/ocr_corrections.md`.
2. **Geocoding.** `python3 scripts/geocode.py` uses the US Census Geocoder for street addresses (a match is accepted only if the town and the street name agree) and Nominatim town centers otherwise. Results are cached in `data/geocode_cache.json`.
3. **Sundown entries.** Compiled by hand from individual entry pages, one at a time, following the site's robots.txt (which allows all agents). No bulk scraping. `data/sundown_texas_entries.csv`, placed with `python3 scripts/geocode_sundown.py`.
4. **Routes.** `python3 scripts/fetch_routes.py` makes one OSRM request per route and caches GeoJSON in `data/routes/`. The app has no runtime dependency on OSRM.
5. **Projection.** `python3 scripts/compute_routes.py` writes `public/data/*.json` and `data/route_summary.csv`.
6. **Validation.** `python3 scripts/validate_data.py` checks columns, unique ids, coordinates inside Texas, and that no slur, em dash or en dash appears in any data, source or doc file. It also fails if the app source or app data uses the word "safe". `scripts/textsafety.py` stores its blocklist ROT13-encoded so the repo never holds those words. CI runs all checks.

## Sources and credits

- **The Negro Travelers' Green Book: Fall 1956.** NYPL Digital Collections, Schomburg Center for Research in Black Culture. Item: https://digitalcollections.nypl.org/items/9d4e7020-83b9-0132-4aed-58d385a7b928. Text data: https://github.com/NYPL-publicdomain/greenbooks (public domain, CC0).
- **Tougaloo College Sundown Towns Database** and **James W. Loewen's research**: https://justice.tougaloo.edu/. The site's content is copyrighted by James W. Loewen and heirs and is maintained with Tougaloo College. This repository does not copy entry text: it records the entries' short labels, my own paraphrased one-line summaries, and a link to every entry. To ask the maintainers about use, correction, or additions, use https://justice.tougaloo.edu/contact/. The database invites contributions about towns it does not yet list.
- **Map data** © OpenStreetMap contributors. Tiles from tile.openstreetmap.org.
- **US Census Geocoder** (address matching). **Nominatim** (town centers). **OSRM** (route geometry).
- Fonts: Source Serif 4 and IBM Plex Sans (SIL Open Font License), self-hosted via Fontsource.

Full facts-only list: `SOURCES.md`.
