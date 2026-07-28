"""Assign each figure a 5-way category (merged into metadata.category):
  historical      — pre-modern / deceased figures (unchanged bucket)
  founder         — tech & business builders
  politics        — political leaders
  culture         — creators, entertainers, athletes (real content-creators + culture)
  science         — living science & ideas communicators

Idempotent: re-running just re-asserts the mapping. Prints anything unmapped so
no figure is silently left behind.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import registry
from config import settings
from db import connect

CATEGORY = {
    # founders — tech & business
    "elon": "founder", "bezos": "founder", "jensen": "founder", "altman": "founder",
    "naval": "founder", "buffett": "founder", "hormozi": "founder", "jobs": "founder",
    # politics — political leaders
    "trump": "politics", "obama": "politics",
    # culture — creators, entertainers, athletes
    "mrbeast": "culture", "rogan": "culture", "theovon": "culture", "ramsay": "culture",
    "arnold": "culture", "goggins": "culture", "mcconaughey": "culture", "lex": "culture",
    # science — living science & ideas
    "sapolsky": "science", "kaku": "science", "neiltyson": "science", "rubin": "science",
    "samharris": "science",
}


def main():
    conn = connect(settings.db_path)
    figs = registry.list_figures(conn, published_only=False)
    unmapped = []
    for fig in figs:
        fid = fig["id"]
        # Explicit mapping wins over the type field (e.g. Jobs is registered as
        # `historical` but belongs in Founders); otherwise historical-type -> historical.
        if fid in CATEGORY:
            cat = CATEGORY[fid]
        elif fig["type"] == "historical":
            cat = "historical"
        else:
            unmapped.append(fid)
            continue
        meta = dict(fig["metadata"])
        if meta.get("category") == cat:
            continue
        meta["category"] = cat
        registry.update_figure(conn, fid, metadata=meta)
        print(f"  {fid:16} -> {cat}")
    if unmapped:
        print("\nUNMAPPED (left as-is, fix the CATEGORY dict):", unmapped)
    else:
        print("\nAll figures categorized.")


if __name__ == "__main__":
    main()
