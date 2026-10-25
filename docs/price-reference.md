# Cattle value: where the rupee figures come from

The **Cattle value** page ("Find the value of your cattle") shows an *indicative*
rupee estimate for a milch cow. It is a guide to the likely range before a
negotiation, **not a market quote and not a model trained on sales**. This note
says exactly where each number comes from and what it cannot tell you.

## The estimate

```
typical value = breed's typical price
              + Rs 4,000 x (daily milk yield - 6 litres)
              + Rs 6,200 if the cow is pregnant

likely range  = the breed's listed low-high range, scaled by the same factor
                (never below 40% of the typical price)
```

Code: `web/src/lib/price-reference.ts`. Data: `ml/synthetic/price_anchors.json`,
turned into `web/src/lib/price-anchors.generated.ts` by
`ml/scripts/make_synthetic_prices.py`. Tests: `web/tests/price-reference.test.mts`.

## Where each input comes from

| Input | Value | Source and honesty note |
|---|---|---|
| Listed price range per breed | Sahiwal and Gir Rs 50,000-1,50,000; Red Sindhi 40,000-1,00,000; Tharparkar and Rathi 40,000-90,000; Kankrej, Hariana and Ongole 35,000-80,000; Punganur 50,000-1,50,000; Vechur 65,000-1,10,000 | One breed-guide table, *Desi Cow Milk Per Day: 13 Indian Breeds Compared (2026)*, Kamdhenu Gauveda Team, 3 Oct 2026, https://kamdhenugauveda.com/desi-cow-milk-per-day/ . The page was fetched and read on 26 Oct 2026. It is a guide, not transaction data. |
| Typical price | Geometric mean of low and high, to the nearest Rs 1,000 | Arithmetic on the listed range. |
| Breeds without a source | Rs 40,000-90,000, typical Rs 60,000 | **No price was found for 39 of the 49 breeds.** The default is the median of the sourced breeds' typical values, bounded by the Tharparkar/Rathi range. The page says "No price source found" for these. |
| Rupees per daily litre | Rs 4,000 | **An assumption.** One Karnataka project report prices a crossbred cow at Rs 1,10,000 giving 25 litres a day, about Rs 4,400 per litre (own arithmetic, one data point, crossbred not indigenous), rounded down. |
| Pregnancy | 1.548 litres' worth, Rs 6,200 | Ratio of the pregnancy effect (1,114.07) to the milk effect (719.54 per litre) in Kumar et al. (2014), Indian Journal of Animal Sciences 84(11), Table 2. Only the ratio is used; that study's own 2010-11 rupee amounts and its Tamil Nadu sample are not. |
| Reference yield | 6 litres a day | Assumption: the listed ranges are treated as describing an average animal. |

Other dealer listings seen in search results (not independently opened) broadly
agree: Gir about Rs 1-1.25 lakh at a Karnal dairy but Rs 35,000-85,000 in
TradeIndia listings; Sahiwal and Tharparkar Rs 40,000-60,000 at the same dairy;
Rathi Rs 45,000-60,000; Tharparkar listings Rs 20,000-1,40,000. The spread is
the point: **dealer prices for the same breed differ by a factor of two or
three**, which is why the page shows a range.

## What it cannot tell you

- These are **asking prices from a guide**, not completed sales.
- It assumes a **milch cow**. Bulls and draught animals are priced differently (a
  village-fair report put Kangayam bulls at Rs 40,000-70,000, up to Rs 1-1.5 lakh
  for strong bloodlines) and are not modelled.
- Pedigree, milk records (a recorded-pedigree cow can fetch 50-70% more), region
  (the same cow costs far more in a city than at the breeding tract), season, age
  and lactation stage are **not** in the estimate.
- Only the milk and pregnancy effects have any published support, and that
  support is a 2010-11 study in one state whose sample includes no indigenous breeds of the kind identified here.

## The synthetic sales dataset (not shown in the app)

> **Status (26 Oct 2026):** the sale log, ranking, price-history chart and observed
> prices were removed from the Cattle value page. The app now shows only the
> estimator. The dataset and its generator remain in the repository as the way the
> price anchors are produced and documented; nothing in the interface displays it.

`ml/synthetic/SYNTHETIC_sales.csv` (and `web/public/demo/synthetic-sales.json`):
414 invented sales, Jan 2021 to Sep 2026, six a month. Each price is a random draw
around the same anchors, scaled by the same milk and pregnancy rule, with an
**assumed** 6% yearly trend (latest month pinned to the anchors), an assumed +-5%
seasonal swing, and noise sized so that the listed range is roughly a 90% interval.
Every row is flagged `synthetic` and the database rejects any attempt to upload
one.

**It cannot validate the estimator**, because the estimator and the dataset share one formula: any
agreement between them is circular. Real validation needs real sale prices, which
this project does not have.
