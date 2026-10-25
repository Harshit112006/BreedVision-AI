"""Generate a SYNTHETIC sale-price dataset for demos and pipeline testing.

THIS IS NOT REAL DATA. No livestock price series was found for India (see
docs/problem-statement.md), so every rupee value produced here is an invented
number. It exists so that the price-logging screens, history chart and any
future estimator code can be exercised end to end.

What it can and cannot do:

* It CAN exercise code paths, charts and validation.
* It CANNOT validate a price model. A model fitted to this data only learns the
  formula below, so any accuracy it reports is circular and says nothing about
  real markets.

Structure borrowed from a real source: the *direction* of the milk-yield and
pregnancy effects follows Kumar et al. (2014), Indian J. Animal Sciences 84(11),
Table 2 (positive effect per litre, positive effect of pregnancy). Everything
else -- base price, breed multipliers, inflation, seasonality, noise -- is
ARBITRARY and is recorded in the output's generator_params so nobody mistakes it
for a finding. Breed multipliers are random draws, deliberately NOT a claim that
any breed is worth more than another.

Usage:
    python ml/scripts/make_synthetic_prices.py
"""

from __future__ import annotations

import csv
import json
import math
from datetime import date
from pathlib import Path

import _bootstrap  # noqa: F401
import numpy as np

from export_breeds_to_frontend import display_name, slug
from ml.dataset.config import load_config

REPO = Path(__file__).resolve().parents[2]
OUT_CSV = REPO / "ml" / "synthetic" / "SYNTHETIC_sales.csv"
OUT_README = REPO / "ml" / "synthetic" / "README.md"
OUT_JSON = REPO / "web" / "public" / "demo" / "synthetic-sales.json"

PARAMS = {
    "seed": 42,
    "start": "2019-01",
    "end": "2025-12",
    "sales_per_month": 6,
    "base_price_inr": 30000,
    "breed_multiplier_range": [0.8, 1.3],
    "price_per_litre_inr": 1800,
    "pregnancy_premium_inr": 2800,
    "annual_inflation": 0.06,
    "seasonal_amplitude": 0.05,
    "noise_sigma_log": 0.12,
    "milk_yield_litres_range": [3, 18],
    "pregnant_probability": 0.35,
    "age_years_range": [2, 10],
    "note": "ALL VALUES ARBITRARY. Not a model of any real market.",
}


def main() -> int:
    cfg = load_config()
    mapping = json.loads(
        (cfg.p("metadata") / "class_mapping.json").read_text(encoding="utf-8")
    )
    labels = sorted(mapping["class_to_idx"])

    rng = np.random.default_rng(PARAMS["seed"])
    lo, hi = PARAMS["breed_multiplier_range"]
    mult = {b: float(rng.uniform(lo, hi)) for b in labels}

    sy, sm = map(int, PARAMS["start"].split("-"))
    ey, em = map(int, PARAMS["end"].split("-"))
    months = [(y, m) for y in range(sy, ey + 1) for m in range(1, 13)
              if (y, m) >= (sy, sm) and (y, m) <= (ey, em)]

    rows = []
    for t, (y, m) in enumerate(months):
        trend = (1 + PARAMS["annual_inflation"]) ** (t / 12)
        season = 1 + PARAMS["seasonal_amplitude"] * math.sin(2 * math.pi * (m - 1) / 12)
        for k in range(PARAMS["sales_per_month"]):
            label = labels[int(rng.integers(len(labels)))]
            yld = float(rng.uniform(*PARAMS["milk_yield_litres_range"]))
            preg = bool(rng.random() < PARAMS["pregnant_probability"])
            age = int(rng.integers(PARAMS["age_years_range"][0], PARAMS["age_years_range"][1] + 1))
            core = (PARAMS["base_price_inr"] * mult[label]
                    + PARAMS["price_per_litre_inr"] * yld
                    + PARAMS["pregnancy_premium_inr"] * preg)
            price = core * trend * season * math.exp(rng.normal(0, PARAMS["noise_sigma_log"]))
            day = int(rng.integers(1, 28))
            rows.append({
                "id": f"synthetic-{y}{m:02d}-{k:02d}",
                "breedId": slug(label),
                "breedName": display_name(label),
                "priceInr": int(round(price, -2)),
                "soldOn": date(y, m, day).isoformat(),
                "milkYieldLitres": round(yld, 1),
                "pregnant": preg,
                "ageYears": age,
                "note": "SYNTHETIC - not a real sale",
                "createdAt": f"{y}-{m:02d}-{day:02d}T00:00:00.000Z",
                "source": "synthetic",
            })

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    OUT_JSON.write_text(json.dumps(rows, indent=0), encoding="utf-8")

    OUT_README.write_text(
        "# SYNTHETIC sale prices\n\n"
        "**Not real data.** Every rupee value is invented by "
        "`ml/scripts/make_synthetic_prices.py`.\n\n"
        "It exists to exercise the price-logging UI, history chart and any future "
        "estimator code. It cannot validate a price model: a model fitted to it "
        "only relearns the generating formula, so any accuracy it reports is "
        "circular.\n\n"
        "Only the *direction* of the milk-yield and pregnancy effects follows a "
        "real source (Kumar et al. 2014, Indian J. Animal Sciences 84(11), "
        "Table 2). Base price, breed multipliers, inflation, seasonality and "
        "noise are arbitrary. Breed multipliers are random draws and are not a "
        "claim that any breed is worth more than another.\n\n"
        "## Parameters used\n\n```json\n"
        + json.dumps(PARAMS, indent=2)
        + "\n```\n",
        encoding="utf-8",
    )

    prices = np.array([r["priceInr"] for r in rows])
    print(f"rows: {len(rows)}  breeds: {len(labels)}  months: {len(months)}")
    print(f"price range: {prices.min():,} - {prices.max():,}  median {int(np.median(prices)):,}")
    print(f"wrote {OUT_CSV}\nwrote {OUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
