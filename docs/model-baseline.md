# Baseline Classification Model (Phase 2)

**Status:** complete. All figures below are measured on this machine; none are
estimated or carried over from published benchmarks.

---

## 1. What this phase decides

Which pretrained backbone to carry forward, judged on validation only. The
brief explicitly forbids assuming EfficientNet is best, so a residual network
and a mobile-class network are evaluated on identical terms.

**The test split is not touched in this phase.** Architecture selection is a
form of fitting; doing it against the test set would contaminate the only
honest estimate of generalisation we get. Test is opened in Phase 3, once.

## 2. Why frozen features, not fine-tuning

There is **no usable GPU on this machine**. The RTX 3050 remains a phantom
device (audit Risk R1), so all compute is 6 CPU cores.

Full fine-tuning of three backbones on ~7,800 images under that constraint is
not practical, and rushing it would produce three under-trained models whose
comparison means nothing. Instead this phase runs the standard transfer
baseline: freeze the backbone, extract pooled features once, cache them, and
train a linear head on the cached features.

That choice has three properties worth stating plainly:

- It is a **legitimate baseline**, not a shortcut — frozen-feature transfer is
  the conventional first result against which fine-tuning must justify itself.
- It makes the comparison **fair**: every backbone gets exactly the same head,
  the same features pipeline and the same hyperparameters.
- It is **honest about its ceiling**. Frozen ImageNet features will
  under-represent fine-grained cattle morphology. These numbers are a floor,
  not the model's potential.

Fine-tuning is implemented as a config switch (`finetune.enabled`) and stays
off until the baseline is understood and the GPU question is resolved.

## 3. Method

```
splits.parquet ──▶ BreedImageDataset ──▶ backbone (frozen) ──▶ cached .npz
                                                                    │
                                             linear head ◀──────────┘
                                                    │
                                          validation metrics
```

**Backbones** (ImageNet-1k pretrained, via `timm`):

| Key | Weights |
|---|---|
| `resnet50` | `resnet50.a1_in1k` |
| `efficientnet_b0` | `efficientnet_b0.ra_in1k` |
| `mobilenetv3_100` | `mobilenetv3_large_100.ra_in1k` |

**Input size: 224 px.** Chosen from the data, not convention — 60% of this
dataset has a short edge below 224 px (dataset-report §7.2), so larger inputs
would mostly upscale rather than add detail. Any larger variant must earn its
place with a measured gain.

**Preprocessing:** resize (bicubic) → centre crop → ImageNet normalisation.
Every image is converted to RGB on load, because the dataset contains 1,024
RGBA, 25 palette and 4 greyscale images (dataset-report §7.3).

**No augmentation.** Features must be cacheable, and augmentation is the
subject of Phase 4's controlled ablation rather than an unmeasured default
folded into the baseline.

**Head:** single linear layer on standardised features, AdamW, cross-entropy
with balanced class weights (class sizes span 5.1×), early stopping on
validation macro-F1.

**Feature caching** is keyed by backbone, image size and dataset version, so a
config change can never silently reuse stale features.

## 4. Metrics reported

Accuracy alone is not an adequate summary of a 49-class problem with 5.1×
imbalance and demonstrated label noise. Every run records:

- accuracy, top-3 and top-5 accuracy
- macro F1, weighted F1, macro precision, macro recall
- per-class precision / recall / F1 (Phase 3)
- backbone parameters, on-disk size, and measured CPU latency per image

## 5. What every run records

`ml/training/train.py` writes a self-describing JSON record per run: resolved
config, dataset version, seed, backbone, feature dimension, preprocessing,
head hyperparameters, optimizer, augmentation, best epoch, epochs run, wall
times, full epoch history, checkpoint path and environment (Python, torch,
device, thread count).

Checkpoints store the head weights **and** the feature standardisation
statistics fitted on train, so inference can never apply the wrong statistics.

## 6. Known limits of these numbers

- **Frozen ImageNet features are a floor.** Fine-tuning should beat this.
- **Label noise is unremoved beyond the 483 contradictory files already
  dropped.** Same-image-different-label cases were removable because they are
  provable; ordinary mislabels are not, and remain.
- **Low resolution caps fine-grained discrimination.** Breeds separated by coat
  pattern or horn detail are disadvantaged at 224 px from a 197 px median
  source.
- **CPU latency figures are for this laptop** (6 cores, no GPU). They are real
  measurements on this hardware, not projections for a server or a phone.

## 7. Reproduction

```bash
python ml/training/train.py
```

```bash
python ml/training/evaluate.py
```

Configuration lives in `ml/training/config.yaml`; nothing is hardcoded in the
scripts. Seed 42 throughout.

---

## 8. Results (validation split)

Dataset v1 cleaned: 7,799 images, 49 classes, train 5,570 / val 1,115.
Latency is single-image, batch size 1, on 6 CPU cores with no GPU.

| Backbone | Accuracy | Macro F1 | Weighted F1 | Top-3 | Top-5 | Params | Size (MB) | ms/img |
|---|---|---|---|---|---|---|---|---|
| **efficientnet_b0** | **0.6359** | **0.6049** | **0.6324** | 0.8278 | 0.9031 | 4,007,548 | 15.3 | 21.7 |
| mobilenetv3_100 | 0.6251 | 0.5965 | 0.6225 | **0.8493** | **0.9121** | 4,202,032 | 16.0 | **17.5** |
| resnet50 | 0.5794 | 0.5405 | 0.5724 | 0.8009 | 0.8852 | 23,508,032 | 89.7 | 61.0 |

Chance accuracy on 49 classes is about 2%.

### What the comparison actually shows

**ResNet50 lost on every axis.** It has 5.9x the parameters, 5.9x the disk
footprint and 2.8x the latency of EfficientNet-B0, and it is 5.7 points *worse*
on accuracy. There is no argument for carrying it forward.

**EfficientNet-B0 wins on top-1, but not decisively, and not everywhere.**
It leads accuracy by 1.1 points and macro F1 by 0.8 points over
MobileNetV3 — margins small enough that a different seed could plausibly
reorder them. Phase 3 should check whether the gap survives on the test split
before it is treated as real.

**MobileNetV3 wins the metric this product actually leans on.** It leads top-3
by 2.2 points (0.8493 vs 0.8278) and top-5 by 0.9, while being 19% faster. The
result screen shows three alternatives, so top-3 accuracy is closer to the
user-facing quality measure than top-1 is.

The brief warned against assuming EfficientNet is best. On top-1 it is; on the
metric tied to the interface, it is not. **Both lightweight backbones are
carried into Phase 3** rather than picking one now on a 1-point validation gap.

### Macro F1 well below accuracy

Macro F1 trails accuracy by roughly 3 points on every backbone (e.g. 0.6049 vs
0.6359). Macro F1 weights all 49 breeds equally while accuracy is dominated by
the larger ones, so the gap says smaller classes are being predicted worse.
With class sizes spanning 5.1x, that is the expected direction. Phase 3's
per-class breakdown will identify which breeds specifically.

### Extraction throughput (6 CPU cores)

| Backbone | img/s | Time for 7,799 images |
|---|---|---|
| mobilenetv3_100 | 41.9 | 3.1 min |
| efficientnet_b0 | 31.6 | 4.1 min |
| resnet50 | 14.6 | 8.9 min |

A note on measuring this: an early run recorded under 5 img/s and was almost
misdiagnosed as I/O-bound. The actual cause was CPU contention from a Next.js
build and browser automation running concurrently. Benchmarks on a shared
6-core machine are only valid when nothing else is running — a caution that
applies to every timing in this document.

## 9. What these numbers are not

- **Not a test-set result.** These are validation figures used to choose
  architectures. The test split remains untouched for Phase 3.
- **Not the model's ceiling.** Frozen ImageNet features with a linear head is
  the floor. Fine-tuning is expected to beat this substantially and is the
  obvious next lever once a GPU is available.
- **Not a claim of field accuracy.** 63.6% on a curated dataset with known
  label noise, low resolution, and no augmentation says nothing yet about a
  photograph taken in a field. Robustness is Phase 4.
- **Not server or phone latency.** 17-61 ms/img is this laptop's 6 CPU cores.
