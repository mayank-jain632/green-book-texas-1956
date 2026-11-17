"""Place the hand-compiled sundown town entries on the map.

Each town is placed at its center via Nominatim (city-level result only). The one
county-level entry is placed at the county center and flagged as a county entry.
Results are cached in data/geocode_cache.json (shared with scripts/geocode.py).

Usage: python3 scripts/geocode_sundown.py
"""
import csv
import sys
import time
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import geocode  # noqa: E402  (sibling module)

ROOT = Path(__file__).resolve().parent.parent
IN_CSV = ROOT / "data" / "sundown_texas_entries.csv"
OUT_CSV = ROOT / "data" / "sundown_texas_entries_geocoded.csv"


def county_center(place: str, cache: dict) -> dict:
    """Center of a county via Nominatim's structured county query."""
    key = f"{place}, Texas"
    if key not in cache["nominatim"]:
        time.sleep(geocode.NOMINATIM_DELAY_SECONDS)
        params = urllib.parse.urlencode(
            {"county": place, "state": "Texas", "country": "us", "format": "json", "limit": 5}
        )
        cache["nominatim"][key] = geocode.fetch_json(f"{geocode.NOMINATIM_URL}?{params}")
    for hit in cache["nominatim"][key]:
        if hit.get("display_name", "").startswith(place):
            return {"lat": float(hit["lat"]), "lon": float(hit["lon"])}
    raise RuntimeError(f"No county-level result for {key}")


def locate(row: dict, cache: dict) -> dict:
    if row["place_type"] == "county":
        center = county_center(row["place"], cache)
        note = "County-level entry, shown at the approximate county center"
    else:
        center = geocode.nominatim_city(row["place"], cache)
        note = "Shown at the approximate town center"
    return {**center, "location_note": note}


def main() -> None:
    cache = geocode.load_cache()
    with IN_CSV.open(encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh))
    out = []
    for row in rows:
        out.append({**row, **locate(row, cache)})
        geocode.save_cache(cache)
    fields = list(rows[0].keys()) + ["lat", "lon", "location_note"]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for row in out:
            writer.writerow({**row, "lat": f"{row['lat']:.6f}", "lon": f"{row['lon']:.6f}"})
    print(f"{len(out)} entries placed")
    for row in out:
        print(f"  {row['place']:16s} {float(row['lat']):.3f} {float(row['lon']):.3f}")


if __name__ == "__main__":
    main()
