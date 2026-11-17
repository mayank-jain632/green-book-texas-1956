"""Fetch the three sample route geometries once from the public OSRM demo server.

The demo server's usage policy asks for light use and an identifying User-Agent, so
this makes one request per route, one second apart, and skips routes already cached
in data/routes/. The app never calls OSRM at runtime.

The geometry follows TODAY's road network, not the 1956 road network.

Usage: python3 scripts/fetch_routes.py
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import geocode  # noqa: E402  (sibling module)

ROOT = Path(__file__).resolve().parent.parent
ROUTES_DIR = ROOT / "data" / "routes"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
REQUEST_DELAY_SECONDS = 1.5

ROUTES = (
    {"id": "el-paso-dallas", "name": "El Paso to Dallas", "origin": "El Paso", "destination": "Dallas"},
    {"id": "houston-dallas", "name": "Houston to Dallas", "origin": "Houston", "destination": "Dallas"},
    {"id": "houston-orange", "name": "Houston to Orange", "origin": "Houston", "destination": "Orange"},
)


def city_point(city: str, cache: dict) -> tuple:
    center = geocode.nominatim_city(city, cache)
    return center["lat"], center["lon"]


def fetch_route(origin: tuple, destination: tuple) -> dict:
    coords = f"{origin[1]:.5f},{origin[0]:.5f};{destination[1]:.5f},{destination[0]:.5f}"
    url = f"{OSRM_URL}/{coords}?overview=full&geometries=geojson&steps=false"
    result = geocode.fetch_json(url)
    if result.get("code") != "Ok" or not result.get("routes"):
        raise RuntimeError(f"OSRM returned no route: {result.get('code')}")
    return result["routes"][0]


def main() -> None:
    ROUTES_DIR.mkdir(parents=True, exist_ok=True)
    cache = geocode.load_cache()
    for route in ROUTES:
        target = ROUTES_DIR / f"{route['id']}.geojson"
        if target.exists():
            print(f"cached: {target.name}")
            continue
        origin = city_point(route["origin"], cache)
        destination = city_point(route["destination"], cache)
        time.sleep(REQUEST_DELAY_SECONDS)
        osrm = fetch_route(origin, destination)
        feature = {
            "type": "Feature",
            "properties": {
                "id": route["id"],
                "name": route["name"],
                "origin": route["origin"],
                "destination": route["destination"],
                "osrm_distance_m": osrm["distance"],
                "source": "OSRM public demo server (today's road network, not 1956)",
            },
            "geometry": osrm["geometry"],
        }
        target.write_text(json.dumps(feature, separators=(",", ":")) + "\n", encoding="utf-8")
        points = len(osrm["geometry"]["coordinates"])
        print(f"fetched: {target.name}, {osrm['distance'] / 1609.344:.0f} mi, {points} points")
    geocode.save_cache(cache)


if __name__ == "__main__":
    main()
