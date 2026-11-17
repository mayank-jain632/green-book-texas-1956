"""Geocode the Texas Green Book listings honestly.

1. Street addresses go to the US Census Geocoder (no key). A match is accepted only
   if the matched city equals the listing's town.
2. Anything else (no street number, intersection, highway, blank, or no match) is
   placed at the town center from Nominatim (max 1 request per second) and flagged
   "approximate (city)".

All raw responses are cached in data/geocode_cache.json so the build is reproducible
and the services are not hit again.

Usage: python3 scripts/geocode.py
"""
import csv
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
IN_CSV = ROOT / "data" / "greenbook_texas_1956.csv"
OUT_CSV = ROOT / "data" / "greenbook_texas_1956_geocoded.csv"
CACHE_PATH = ROOT / "data" / "geocode_cache.json"

CENSUS_URL = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "green-book-texas-1956-class-project/0.1 (university history project)"
NOMINATIM_DELAY_SECONDS = 1.1
TIMEOUT_SECONDS = 30
MAX_ATTEMPTS = 5
RETRY_BACKOFF_SECONDS = 4

QUALITY_ADDRESS = "address match"
QUALITY_CITY = "approximate (city)"
STREET_NUMBER = re.compile(r"^\d+")
LEADING_NUMBER = re.compile(r"^\d+(?:-\d+)?\s*")
FRACTION = re.compile(r"[½¼¾]")


def load_cache() -> dict:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {"census": {}, "nominatim": {}}


def save_cache(cache: dict) -> None:
    CACHE_PATH.write_text(
        json.dumps(cache, indent=1, sort_keys=True, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def fetch_json(url: str) -> dict:
    """GET JSON, retrying transient server errors (5xx) with backoff."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            if error.code < 500 or attempt == MAX_ATTEMPTS:
                raise
            time.sleep(RETRY_BACKOFF_SECONDS * attempt)
    raise RuntimeError("unreachable")


def is_street_address(address: str) -> bool:
    """True for plain 'number street' addresses; false for intersections and highways."""
    if not STREET_NUMBER.match(address):
        return False
    return "&" not in address and "Highway" not in address and "U. S." not in address


def census_query(address: str, city: str) -> str:
    cleaned = FRACTION.sub("", address).replace("413-15", "413")
    return f"{cleaned}, {city}, TX"


def census_lookup(query: str, cache: dict) -> dict:
    if query not in cache["census"]:
        params = urllib.parse.urlencode(
            {"address": query, "benchmark": "Public_AR_Current", "format": "json"}
        )
        cache["census"][query] = fetch_json(f"{CENSUS_URL}?{params}")
    return cache["census"][query]


DIRECTIONS = {"n", "s", "e", "w", "ne", "nw", "se", "sw", "north", "south", "east", "west"}
SUFFIXES = {
    "st": "st", "street": "st", "ave": "ave", "avenue": "ave", "rd": "rd", "road": "rd",
    "blvd": "blvd", "dr": "dr", "ln": "ln",
}
ORDINALS = {
    "first": "1st", "second": "2nd", "third": "3rd", "fourth": "4th", "fifth": "5th",
    "sixth": "6th", "seventh": "7th", "eighth": "8th", "ninth": "9th", "tenth": "10th",
}
ABBREVIATIONS = {"ft": "fort", "mt": "mount"}


def street_parts(text: str) -> tuple:
    """Return (name words, suffix or None) with number and directions removed."""
    without_number = LEADING_NUMBER.sub("", FRACTION.sub("", text).strip())
    words = re.findall(r"[a-z0-9]+", without_number.lower())
    words = [ORDINALS.get(w, ABBREVIATIONS.get(w, w)) for w in words if w not in DIRECTIONS]
    suffix = SUFFIXES.get(words[-1]) if len(words) > 1 else None
    name = words[:-1] if suffix else words
    return name, suffix


def same_street(query_address: str, matched_address: str) -> bool:
    """True only if street name matches exactly and any stated suffixes agree."""
    query_name, query_suffix = street_parts(query_address)
    match_name, match_suffix = street_parts(matched_address.split(",")[0])
    if query_name != match_name:
        return False
    return query_suffix is None or match_suffix is None or query_suffix == match_suffix


def accept_census_match(result: dict, city: str, address: str) -> Optional[dict]:
    matches = result.get("result", {}).get("addressMatches", [])
    for match in matches:
        matched_city = match["addressComponents"].get("city", "").title()
        if matched_city.lower() == city.lower() and same_street(address, match["matchedAddress"]):
            return {
                "lat": match["coordinates"]["y"],
                "lon": match["coordinates"]["x"],
                "matched": match["matchedAddress"],
            }
    return None


def nominatim_city(city: str, cache: dict) -> dict:
    key = f"{city}, Texas"
    if key not in cache["nominatim"]:
        time.sleep(NOMINATIM_DELAY_SECONDS)
        params = urllib.parse.urlencode(
            {"city": city, "state": "Texas", "country": "us", "format": "json", "limit": 5}
        )
        cache["nominatim"][key] = fetch_json(f"{NOMINATIM_URL}?{params}")
    for hit in cache["nominatim"][key]:
        first_part = hit.get("display_name", "").split(",")[0].strip().lower()
        if first_part == city.lower() and hit.get("type") != "county":
            return {"lat": float(hit["lat"]), "lon": float(hit["lon"])}
    raise RuntimeError(f"No city-level (non-county) center found for {key}")


def locate(row: dict, cache: dict) -> dict:
    """Return lat, lon, location_quality, geocode_note for one listing."""
    address, city = row["address_raw"], row["city"]
    if is_street_address(address):
        result = census_lookup(census_query(address, city), cache)
        accepted = accept_census_match(result, city, address)
        if accepted:
            return {
                "lat": accepted["lat"],
                "lon": accepted["lon"],
                "location_quality": QUALITY_ADDRESS,
                "geocode_note": f"Census match to today's street grid: {accepted['matched']}",
            }
        reason = "no Census match in the same town on today's street grid"
    elif not address:
        reason = "no address printed in 1956 edition"
    else:
        reason = "not a numbered street address (intersection, highway, or cross street)"
    center = nominatim_city(city, cache)
    return {
        "lat": center["lat"],
        "lon": center["lon"],
        "location_quality": QUALITY_CITY,
        "geocode_note": f"Placed at town center: {reason}",
    }


def main() -> None:
    cache = load_cache()
    with IN_CSV.open(encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh))
    out_rows = []
    for row in rows:
        located = locate(row, cache)
        out_rows.append({**row, **located})
        save_cache(cache)
    fields = list(rows[0].keys()) + ["lat", "lon", "location_quality", "geocode_note"]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for out in out_rows:
            writer.writerow({**out, "lat": f"{out['lat']:.6f}", "lon": f"{out['lon']:.6f}"})
    counts: dict = {}
    for out in out_rows:
        counts[out["location_quality"]] = counts.get(out["location_quality"], 0) + 1
    print(f"{len(out_rows)} listings:", counts)


if __name__ == "__main__":
    main()
