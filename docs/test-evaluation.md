# Final test-split evaluation

The deployed model (EfficientNet-B0 backbone, frozen, linear head, temperature
1.04) was scored on the held-out test split **once**, by
`ml/training/test_eval.py`. Nothing was tuned on this split: the backbone,
head, temperature and confidence thresholds were all chosen on train/validation
data. The script refuses a second run. Raw output:
`docs/examples/test-eval-efficientnet_b0.json`.

| Metric (1,114 test images, 49 breeds) | Test | Validation |
|---|---|---|
| Top-1 accuracy | **59.3%** (95% CI 56.2–62.0, bootstrap) | 63.6% |
| Top-3 accuracy | 81.6% | 82.8% |
| Top-5 accuracy | 90.0% | 90.3% |
| Macro-F1 | 0.556 | 0.605 |
| Calibration error (ECE) | 0.048 | — |

Test is lower than validation by about 4 points top-1 and 5 points macro-F1.
The validation interval would have overlapped, so this is a modest drop, not a
collapse, but the honest headline is the **test** figure: about 59% top-1 and
about 82% top-3.

## Does the confidence band deliver what it promises?

| Band | Share of images | Top-1 accuracy |
|---|---|---|
| Confident (≥ 0.85) | 20.0% | **89.7%** (target was 90%) |
| Uncertain | 65.4% | 57.4% |
| Low (< 0.30) | 14.6% | 25.8% |

The thresholds were set on validation and hold up on unseen data: when the app
names a breed, it is right about 9 times in 10. The cost is that it names a
breed for only one image in five; most results are shown as "uncertain".

## Weakest breeds (F1)

dagri 0.08, gangatari 0.23, gaolao 0.25, Krishna Valley 0.26, kherigarh 0.29,
Lakhimi 0.33, Shweta Kapila 0.37, badri 0.38. Several are visually close
neighbours of other breeds; no per-pair confusion analysis has been done.

## What this does not show

- It is a Kaggle-style dataset. Field photos (dim light, partial views, dirty
  animals) are likely harder; no field data has been measured.
- The model is a frozen backbone. Fine-tuning has not been tried and would
  probably raise these numbers.
- Test images come from the same sources as training. Near-duplicates are
  grouped so none cross splits, but source-level similarity remains.
