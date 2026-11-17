# Sources (facts only)

What each source is and what it contributed to this project. Links verified on 2026-11-17.

## The Negro Travelers' Green Book, Fall 1956
- **What it is.** An annual travel guide for Black motorists. The OCR of the cover page reads "Fall 1956" (the surrounding cover text is partly garbled).
- **Where.** NYPL Digital Collections, Schomburg Center for Research in Black Culture: https://digitalcollections.nypl.org/items/9d4e7020-83b9-0132-4aed-58d385a7b928
- **Data.** NYPL public domain text and OCR: https://github.com/NYPL-publicdomain/greenbooks (CC0 / no known US copyright restrictions per the repository).
- **Used for.** The Texas section: 98 listings in 24 towns on page images 5206271 to 5206274 (printed pages 60 to 63). Lodging and restaurants only.
- **Per-page images.** https://images.nypl.org/index.php?id=5206271 (and 5206272, 5206273, 5206274).
- **Not used.** The repository's `geojson/` folder only contains the 1947 edition.

## Tougaloo College Sundown Towns Database
- **What it is.** A crowdsourced registry of historical sundown towns, entered by James W. Loewen, Stephen Berrey and students, hosted by Tougaloo College. Its own usage page says it "is and will always be incomplete". Site: https://justice.tougaloo.edu/
- **Usage page.** https://justice.tougaloo.edu/sundown-towns/using-the-sundown-towns-database/
- **Rights.** Footer: content is copyrighted by James W. Loewen and heirs. robots.txt allows all agents.
- **Definition used by the database.** A sundown town is an entire community (or county) that for decades was "all white" on purpose; it does not require a formal ordinance (usage page).
- **Used for.** 19 Texas entries (links in `data/sundown_texas_entries.csv`), recorded as: the entry's own labels for "Sundown Town in the Past?", ordinance, sign and method of exclusion; a one-line paraphrase; the evidence period as stated; whether a documentary source is cited; a link. Texas entry count: 107 in the public sitemaps.
- **Contact.** https://justice.tougaloo.edu/contact/

## James W. Loewen
- Began researching sundown towns in 1999 and published *Sundown Towns* in 2005 (later updated). Sources: https://capitalbnews.org/sundown-towns-research-racism/ and https://www.georgiaencyclopedia.org/articles/history-archaeology/sundown-towns/

## Geocoding, routing and map data
- **US Census Geocoder** (Public_AR_Current benchmark), no key: https://geocoding.geo.census.gov/geocoder/ . Matches reflect today's street grid.
- **Nominatim** (OpenStreetMap), town centers; 1 request per second with a descriptive User-Agent: https://nominatim.org/
- **OSRM public demo server**, route geometry; one request per route: https://router.project-osrm.org/ . Geometry follows today's roads.
- **OpenStreetMap** tiles and data, © OpenStreetMap contributors: https://www.openstreetmap.org/copyright

## What each layer can and cannot support
- Green Book listings show that a business was listed in the Fall 1956 Texas section. They do not show how a business treated any traveler.
- Sundown entries show what the database records and how it labels the evidence. Evidence periods vary and often are not 1956.
- Neither layer can show where a traveler in 1956 would have met danger or help.
