"""Project listings and sundown entries onto the cached route lines.

For each place and each route this stores two numbers, both in miles:
  off_miles    shortest distance from the place to the route line
  along_miles  distance along the route from its start to that closest point

The app reads these and applies the buffer setting in the browser, so the buffer is
adjustable without any routing service. This script also writes the default-buffer
reference table in data/route_summary.csv, which the app's numbers must match.

Method for the "longest stretch": keep the Green Book listings within the buffer of
the route, sort them by position along the route, and find the largest distance
between two consecutive listings. Routes use TODAY's road network.

Usage: python3 scripts/compute_routes.py
"""
import csv
import json
import math
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parent.parent
ROUTES_DIR = ROOT / "data" / "routes"
OUT_DIR = ROOT / "public" / "data"
SUMMARY_CSV = ROOT / "data" / "route_summary.csv"

EARTH_RADIUS_MILES = 3958.8
MILES_PER_DEGREE = 69.0933
DEFAULT_BUFFER_MILES = 10.0
STORE_WITHIN_MILES = 30.0
COORD_DECIMALS = 5
ROUTE_IDS = ("el-paso-dallas", "houston-dallas", "houston-orange")

Point = Tuple[float, float]  # (lat, lon)


def haversine(a: Point, b: Point) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * EARTH_RADIUS_MILES * math.asin(math.sqrt(h))


def cumulative_miles(line: List[Point]) -> List[float]:
    total, out = 0.0, [0.0]
    for a, b in zip(line, line[1:]):
        total += haversine(a, b)
        out.append(total)
    return out


def project(point: Point, line: List[Point], cumulative: List[float]) -> Tuple[float, float]:
    """Return (off_miles, along_miles) for the closest point on the line."""
    best_off, best_along = float("inf"), 0.0
    for i in range(len(line) - 1):
        a, b = line[i], line[i + 1]
        k = math.cos(math.radians((a[0] + b[0]) / 2))
        ax, ay = a[1] * k * MILES_PER_DEGREE, a[0] * MILES_PER_DEGREE
        bx, by = b[1] * k * MILES_PER_DEGREE, b[0] * MILES_PER_DEGREE
        px, py = point[1] * k * MILES_PER_DEGREE, point[0] * MILES_PER_DEGREE
        dx, dy = bx - ax, by - ay
        length_sq = dx * dx + dy * dy
        t = 0.0 if length_sq == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / length_sq))
        off = math.hypot(px - (ax + t * dx), py - (ay + t * dy))
        if off < best_off:
            best_off = off
            best_along = cumulative[i] + t * (cumulative[i + 1] - cumulative[i])
    return best_off, best_along


def read_csv(path: Path) -> List[dict]:
    with path.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def attach_fits(places: List[dict], routes: List[dict]) -> List[dict]:
    """Return new place dicts with a route_fit mapping (no mutation of inputs)."""
    result = []
    for place in places:
        point = (float(place["lat"]), float(place["lon"]))
        fit = {}
        for route in routes:
            off, along = project(point, route["line"], route["cumulative"])
            if off <= STORE_WITHIN_MILES:
                fit[route["id"]] = [round(off, 2), round(along, 2)]
        result.append({**place, "lat": point[0], "lon": point[1], "route_fit": fit})
    return result


def longest_gap(listings: List[dict], route_id: str, buffer_miles: float) -> dict:
    inside = sorted(
        (p for p in listings if route_id in p["route_fit"] and p["route_fit"][route_id][0] <= buffer_miles),
        key=lambda p: p["route_fit"][route_id][1],
    )
    best = {"miles": None, "from": None, "to": None}
    for first, second in zip(inside, inside[1:]):
        miles = second["route_fit"][route_id][1] - first["route_fit"][route_id][1]
        if best["miles"] is None or miles > best["miles"]:
            best = {"miles": miles, "from": first, "to": second}
    return {"count": len(inside), **best}


def load_routes() -> List[dict]:
    routes = []
    for route_id in ROUTE_IDS:
        feature = json.loads((ROUTES_DIR / f"{route_id}.geojson").read_text(encoding="utf-8"))
        coords = feature["geometry"]["coordinates"]
        line = [(lat, lon) for lon, lat in coords]
        cumulative = cumulative_miles(line)
        routes.append({
            "id": route_id,
            "name": feature["properties"]["name"],
            "origin": feature["properties"]["origin"],
            "destination": feature["properties"]["destination"],
            "length_miles": round(cumulative[-1], 1),
            "line": line,
            "cumulative": cumulative,
            "coordinates": [[round(lon, COORD_DECIMALS), round(lat, COORD_DECIMALS)] for lon, lat in coords],
        })
    return routes


def write_json(name: str, payload) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / name).write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")


def write_summary(routes: List[dict], listings: List[dict], towns: List[dict]) -> None:
    fields = ["route", "buffer_miles", "route_miles", "listings_in_buffer", "sundown_entries_in_buffer",
              "longest_gap_miles", "gap_from", "gap_to"]
    with SUMMARY_CSV.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for route in routes:
            gap = longest_gap(listings, route["id"], DEFAULT_BUFFER_MILES)
            towns_in = [t for t in towns if route["id"] in t["route_fit"]
                        and t["route_fit"][route["id"]][0] <= DEFAULT_BUFFER_MILES]
            label = lambda p: f"{p['name']} ({p['city']}, {p['location_quality']})" if p else ""  # noqa: E731
            writer.writerow({
                "route": route["name"], "buffer_miles": DEFAULT_BUFFER_MILES,
                "route_miles": route["length_miles"], "listings_in_buffer": gap["count"],
                "sundown_entries_in_buffer": len(towns_in),
                "longest_gap_miles": "" if gap["miles"] is None else round(gap["miles"], 1),
                "gap_from": label(gap["from"]), "gap_to": label(gap["to"]),
            })


def main() -> None:
    routes = load_routes()
    listings = attach_fits(read_csv(ROOT / "data" / "greenbook_texas_1956_geocoded.csv"), routes)
    towns = attach_fits(read_csv(ROOT / "data" / "sundown_texas_entries_geocoded.csv"), routes)
    write_json("routes.json", [
        {k: r[k] for k in ("id", "name", "origin", "destination", "length_miles", "coordinates")} for r in routes
    ])
    write_json("listings.json", listings)
    write_json("sundown.json", towns)
    write_summary(routes, listings, towns)
    print(SUMMARY_CSV.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
