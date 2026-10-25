# Final test-split evaluation

Two models have been scored on the held-out test split. **The test split has been
looked at twice**, once per model, and nothing was chosen or tuned from either
result. Both scores are reported here. The script is `ml/training/test_eval.py`;
raw output is in `docs/examples/test-eval-efficientnet_b0.json` (frozen baseline)
and `docs/examples/test-eval-efficientnet_b0_finetuned.json` (fine-tuned).

How the fine-tuned model was chosen: its training run (`ml/training/finetune.py`)
selected the best epoch on **validation** only; its temperature and confidence
thresholds were fitted on **validation** only; it was then exported and scored on
test. The test result confirmed the choice and did not drive it.

## Headline (1,114 test images, 49 breeds)

| Metric | Frozen baseline | **Fine-tuned (deployed)** |
|---|---|---|
| Top-1 accuracy | 59.3% (95% CI 56.2–62.0) | **61.9%** (95% CI 58.8–64.6) |
| Top-3 accuracy | 81.6% | **83.0%** |
| Top-5 accuracy | 90.0% | **90.5%** |
| Macro-F1 | 0.556 | **0.583** |
| Calibration error (ECE) | 0.048 | 0.048 |
| Validation top-1 / macro-F1 | 63.6% / 0.605 | 66.1% / 0.638 |

Quote the **test** figures, not the validation ones: validation is where the
epoch was picked, so it flatters the model a little.

**Is the improvement real?** On the same 1,114 images the fine-tuned model is
right on 97 that the baseline got wrong and wrong on 67 that the baseline got
right: +2.7 points top-1. A paired bootstrap puts the difference at +0.5 to +4.9
points (95%), which only just excludes zero. It is a modest, consistent gain
across every metric, not a large one.

## Does the confidence band deliver what it promises?

The thresholds are unchanged (confident at 0.85, low below 0.30); they were
re-derived for the fine-tuned model and came out the same.

| Band | Share of images (baseline → fine-tuned) | Top-1 accuracy (baseline → fine-tuned) |
|---|---|---|
| Confident (≥ 0.85) | 20.0% → **24.4%** | 89.7% → **90.1%** |
| Uncertain | 65.4% → 66.1% | 57.4% → 57.1% |
| Low (< 0.30) | 14.6% → 9.5% | 25.8% → 23.6% |

The fine-tuned model names a breed for one image in four instead of one in five,
at the same reliability (about 9 in 10 right when it names one).

## Weakest breeds (F1, fine-tuned)

dagri 0.00, gaolao 0.22, kherigarh 0.22, gangatari 0.28, Krishna Valley 0.30,
malvi 0.34, Shweta Kapila 0.35, Lakhimi 0.42. **dagri got worse** (0.08 → 0.00):
fine-tuning is not an improvement for every breed. No per-pair confusion analysis
has been done, so why these fail is a guess (several are visually close
neighbours of other breeds).

## What this does not show

- The photos come from the same kind of web sources as the training data. Field
  photos (dim light, partial views, dirty animals) are likely harder; none has been
  measured.
- Only the last three backbone blocks were fine-tuned, on CPU, for 8 epochs. More
  of the network, more epochs or a larger input might help; none was tried.
- Near-duplicate photos are grouped so none cross splits, but source-level
  similarity (the same photographer or website) remains.
