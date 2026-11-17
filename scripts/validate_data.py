"""Validate the project data and text. Exits non-zero on any problem.

Checks
  - required columns are present in each data CSV
  - ids are unique
  - coordinates are inside Texas (bounding box)
  - no slurs and no em or en dashes in any data file, source file, or doc
  - the word "safe" never appears in the app source or app data
  - location_quality values are one of the two allowed flags

Usage: python3 scripts/validate_data.py
"""
import csv
import json
import re
import sys
from pathlib import Path
from typing import Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parent))
import textsafety  # noqa: E402  (sibling module)

ROOT = Path(__file__).resolve().parent.parent
TEXAS_LAT = (25.8, 36.6)
TEXAS_LON = (-106.7, -93.5)
ALLOWED_QUALITY = {"address match", "approximate (city)"}
DASHES = (chr(0x2014), chr(0x2013))
SAFE_WORD = re.compile(r"\bsafe(ly|r|st)?\b", re.IGNORECASE)

REQUIRED = {
    "data/greenbook_texas_1956.csv": [
        "id", "name", "category", "address_raw", "city", "source_page_image_id", "ocr_confidence_note",
    ],
    "data/greenbook_texas_1956_geocoded.csv": [
        "id", "name", "category", "address_raw", "city", "source_page_image_id",
        "ocr_confidence_note", "lat", "lon", "location_quality", "geocode_note",
    ],
    "data/sundown_texas_entries_geocoded.csv": [
        "id", "place", "place_type", "status_label", "ordinance_label", "sign_label", "method_label",
        "evidence_summary", "evidence_period", "documentary_source_cited", "entry_url", "date_read",
        "lat", "lon", "location_note",
    ],
}
COORD_FILES = [f for f in REQUIRED if "geocoded" in f]
TEXT_SUFFIXES = {".csv", ".tsv", ".md", ".json", ".jsx", ".js", ".css", ".py", ".yml", ".html", ".geojson"}
SKIP_DIRS = {"node_modules", "dist", ".git", "test-results", "playwright-report", "__pycache__"}
SKIP_FILES = {"package-lock.json", "geocode_cache.json"}
APP_SOURCE_DIRS = ("src", "public/data")


def read_csv(rel: str) -> List[Dict[str, str]]:
    with (ROOT / rel).open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def check_columns_and_ids(errors: List[str]) -> None:
    for rel, required in REQUIRED.items():
        rows = read_csv(rel)
        missing = [c for c in required if c not in (rows[0] if rows else {})]
        if missing:
            errors.append(f"{rel}: missing columns {missing}")
        ids = [r.get("id", "") for r in rows]
        dupes = {i for i in ids if ids.count(i) > 1}
        if dupes:
            errors.append(f"{rel}: duplicate ids {sorted(dupes)}")


def check_coordinates(errors: List[str]) -> None:
    for rel in COORD_FILES:
        for row in read_csv(rel):
            lat, lon = float(row["lat"]), float(row["lon"])
            if not (TEXAS_LAT[0] <= lat <= TEXAS_LAT[1] and TEXAS_LON[0] <= lon <= TEXAS_LON[1]):
                errors.append(f"{rel}: {row['id']} is outside Texas ({lat}, {lon})")
    for row in read_csv("data/greenbook_texas_1956_geocoded.csv"):
        if row["location_quality"] not in ALLOWED_QUALITY:
            errors.append(f"{row['id']}: unexpected location_quality {row['location_quality']!r}")


def project_text_files() -> List[Path]:
    found = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES or path.name in SKIP_FILES:
            continue
        if SKIP_DIRS & set(path.relative_to(ROOT).parts):
            continue
        found.append(path)
    return found


def check_text(errors: List[str]) -> None:
    for path in project_text_files():
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        if textsafety.contains_slur(text):
            errors.append(f"{rel}: contains a slur ({len(textsafety.find_slurs(text))} match)")
        if any(d in text for d in DASHES):
            errors.append(f"{rel}: contains an em or en dash")
        if rel.startswith(APP_SOURCE_DIRS) and SAFE_WORD.search(text):
            errors.append(f"{rel}: uses the word 'safe'")


def check_json_parses(errors: List[str]) -> None:
    for path in (ROOT / "public" / "data").glob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{path.name}: invalid JSON ({exc})")


def validate() -> List[str]:
    errors: List[str] = []
    check_columns_and_ids(errors)
    check_coordinates(errors)
    check_text(errors)
    check_json_parses(errors)
    return errors


def main() -> None:
    errors = validate()
    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    print("Validation passed.")


if __name__ == "__main__":
    main()
