# SYNTHETIC sale prices

**Not real data.** Every rupee value is invented by `ml/scripts/make_synthetic_prices.py`.

It exists to exercise the price-logging UI, history chart and any future estimator code. It cannot validate a price model: a model fitted to it only relearns the generating formula, so any accuracy it reports is circular.

Only the *direction* of the milk-yield and pregnancy effects follows a real source (Kumar et al. 2014, Indian J. Animal Sciences 84(11), Table 2). Base price, breed multipliers, inflation, seasonality and noise are arbitrary. Breed multipliers are random draws and are not a claim that any breed is worth more than another.

## Parameters used

```json
{
  "seed": 42,
  "start": "2019-01",
  "end": "2025-12",
  "sales_per_month": 6,
  "base_price_inr": 30000,
  "breed_multiplier_range": [
    0.8,
    1.3
  ],
  "price_per_litre_inr": 1800,
  "pregnancy_premium_inr": 2800,
  "annual_inflation": 0.06,
  "seasonal_amplitude": 0.05,
  "noise_sigma_log": 0.12,
  "milk_yield_litres_range": [
    3,
    18
  ],
  "pregnant_probability": 0.35,
  "age_years_range": [
    2,
    10
  ],
  "note": "ALL VALUES ARBITRARY. Not a model of any real market."
}
```
