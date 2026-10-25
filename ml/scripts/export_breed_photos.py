"""Download the curated Wikimedia Commons photos for the web breed library.

`breed_photo_picks.json` maps a breed slug to the Commons file titles chosen
for it. Each pick was reviewed by eye to be a real photograph of that breed
(search results routinely return look-alike names: towns, people, roads, and a
different breed such as "Nari Master"), so the list is curated, not computed.

For each pick this script fetches author and licence from the Commons API,
downloads a 1000px rendition to web/public/breeds/<slug>/<n>.jpg, and writes
web/src/services/mock/breed-photos.generated.ts with the attribution the site
must display. Breeds absent from the picks file get no photo and the UI shows
an honest placeholder; the training dataset is deliberately not used because
its labels are too noisy to present as ground truth.

Usage:
    python ml/scripts/export_breed_photos.py
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PICKS = Path(__file__).with_name("breed_photo_picks.json")
OUT = REPO / "web/public/breeds"
MANIFEST = REPO / "web/src/services/mock/breed-photos.generated.ts"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "BreedVisionLibrary/1.0 (student project; chattorajdebayan@gmail.com)"}
WIDTH = 1000


def fetch(url: str) -> bytes:
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers=UA)
            return urllib.request.urlopen(req, timeout=60).read()
        except Exception:
            time.sleep(2 + 3 * attempt)
    raise RuntimeError(f"failed: {url}")


def strip_html(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()


def info_for(titles: list[str]) -> dict[str, dict]:
    q = {
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": WIDTH,
        "titles": "|".join(titles),
    }
    data = json.loads(fetch(f"{API}?{urllib.parse.urlencode(q)}"))
    pages = data["query"]["pages"].values()
    norm = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
    return {norm.get(p["title"], p["title"]): p["imageinfo"][0] for p in pages if "imageinfo" in p}


def main() -> None:
    picks: dict[str, list[str]] = json.loads(PICKS.read_text(encoding="utf-8"))
    all_titles = sorted({t for ts in picks.values() for t in ts})
    info: dict[str, dict] = {}
    for i in range(0, len(all_titles), 40):
        info.update(info_for(all_titles[i : i + 40]))
        time.sleep(0.5)

    manifest: dict[str, list[dict]] = {}
    for slug, titles in picks.items():
        dest = OUT / slug
        dest.mkdir(parents=True, exist_ok=True)
        entries = []
        for n, title in enumerate(titles, 1):
            ii = info.get(title)
            if ii is None:
                raise SystemExit(f"{slug}: no imageinfo for {title!r}")
            meta = ii["extmetadata"]
            lic = meta.get("LicenseShortName", {}).get("value", "")
            if not re.match(r"(CC|Public domain|PD)", lic, re.I):
                raise SystemExit(f"{slug}: {title!r} is not freely licensed ({lic!r})")
            (dest / f"{n}.jpg").write_bytes(fetch(ii["thumburl"]))
            entries.append({
                "file": f"/breeds/{slug}/{n}.jpg",
                "title": title.removeprefix("File:"),
                "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Unknown author",
                "license": lic,
                "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""),
                "page": ii["descriptionurl"],
            })
            time.sleep(0.4)
        manifest[slug] = entries
        print(f"{slug}: {len(entries)}", flush=True)

    MANIFEST.write_text(
        "// GENERATED FILE — do not edit by hand.\n"
        "// Source: ml/scripts/export_breed_photos.py (picks in breed_photo_picks.json).\n"
        "// Every photo is from Wikimedia Commons under the licence shown; the site\n"
        "// must display the author and licence next to the image.\n\n"
        "export interface BreedPhoto {\n  file: string;\n  title: string;\n  author: string;\n"
        "  license: string;\n  licenseUrl: string;\n  /** Commons description page. */\n  page: string;\n}\n\n"
        "export const BREED_PHOTOS: Record<string, BreedPhoto[]> = "
        + json.dumps(manifest, indent=2, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
