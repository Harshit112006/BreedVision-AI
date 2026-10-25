# Explainability: where did the model look?

`POST /api/explain` and the "Show where the model looked" panel on the result
screen. Implemented in `ml/training/explain.py`.

## What it shows, precisely

A heat-map over the **centre 224 x 224 crop the model actually received**, showing
which regions supplied the evidence for the breed it predicted. Darker means more
evidence, scaled per image.

It shows **image regions, not body parts.** It cannot say the model used the
horns, the hump or the coat, and the interface and API never claim it did. The
plain-language summary names positions only ("the upper left part of the image").

## Method, and why it is exact here

The classifier is a frozen backbone, global average pooling, feature
standardisation, then one linear layer. For that architecture Grad-CAM needs no
approximation. The class score splits exactly into per-cell contributions:

```
logit_c = const_c + sum over cells of M_c[i, j]
M_c[i, j] = (1 / HW) * sum_k (W[c,k] / sd_k) * F[k, i, j]
```

Tested (`ml/tests/test_explain.py`, 7 tests): the closed form equals autograd
Grad-CAM; the pooled feature is the spatial mean of the last conv map; the cells
sum to the class score plus a constant that does not depend on the image; the
explanation matches the prediction; the explained view is the centre crop, not
the whole photo; the text summary names no anatomy.

## Is it informative? Measured, not assumed

`ml/scripts/eval_explainability.py`, 300 real validation photos, test split
untouched. A map can be faithful and still useless, for example by lighting up
the centre of every image, so three checks were run.

**Deletion test.** Blank the cells the map ranks most important and measure the
fall in the predicted breed's probability.

| Cells blanked (of 49) | By the map | Fixed centre blob | Random cells | Least important |
|---|---|---|---|---|
| 5 (10%) | **0.174** | 0.042 | 0.019 | -0.054 |
| 10 (20%) | **0.272** | 0.110 | 0.042 | -0.074 |
| 15 (31%) | **0.351** | 0.198 | 0.067 | -0.081 |

- About 9x the damage of random cells at 10%, and 4x a fixed centre blob.
- The per-image map hurts more than random cells in 80-89% of images, and more
  than the fixed centre prior in 71-76%.
- The *least* important cells have negative values: removing them **raises** the
  probability, so the map separates helpful regions from misleading ones.

**Class sensitivity.** Rank correlation between the map for the top breed and the
runner-up: mean **0.28**, above 0.9 in only 1% of images. The map depends on
which breed is asked about; it is not a generic "where is the animal" detector.

**Centre bias.** The central 3 x 3 cells hold 25% of the average evidence
(18% if uniform). Mild.

### Re-run on the fine-tuned model (the one now deployed)

The tables above were measured on the earlier frozen-backbone model. The same
script (`ml/scripts/eval_explainability.py`, same 300 validation photos) was re-run
on the fine-tuned bundle on 26 Oct 2026, and the heat-map is still informative:

| Cells blanked (of 49) | By the map | Fixed centre blob | Random cells | Least important |
|---|---|---|---|---|
| 5 (10%) | **0.185** | 0.052 | 0.022 | -0.052 |
| 10 (20%) | **0.298** | 0.163 | 0.054 | -0.082 |
| 15 (31%) | **0.378** | 0.236 | 0.093 | -0.084 |

The per-image map hurts more than random cells in 82-90% of images and more than
the fixed centre prior in 72-76%. Class sensitivity is higher still than before
(mean rank correlation 0.14, never above 0.9), and the central 3 x 3 cells hold
24% of the evidence (18% if uniform). The captioned-thumbnail and centre-crop
findings below were made on the earlier model; the crop behaviour is unchanged
(same preprocessing), and the text-shortcut question remains open.

## Findings from looking at real examples

Numbers about a picture are no substitute for the picture. Two things only
showed up by viewing it.

1. **Captioned thumbnails exist in the data.** The model's most confident correct
   case was a thumbnail with a caption spelling out the breed ("Pure Umblachery").
   That raised the worry that it reads such graphics instead of the animal. A
   direct test **did not support it for that image**: blanking the 18 text-only
   cells left the probability at 0.998, blanking the 26 animal-region cells
   dropped it to 0.039. This clears one photo, **not the dataset**. A systematic
   check for text or watermark shortcuts has not been done.
2. **The model sees only 70% of the average photo.** It resizes then
   centre-crops, so a wide photo can lose the animal's head. Across validation,
   79% of photos lose at least 20% of their area and 37% lose at least 40%.
   Accuracy does **not** fall with how much is cropped (rank correlation -0.004;
   64.5% for photos seeing 56% against 64.0% for near-square ones), so this is
   **not shown to hurt accuracy.** It is why the heat-map shows the crop and says
   so.

## Limits (all shown to the user or stated here)

- Regions, not features. Not proof of how the breed was recognised.
- Brightness is per image; it cannot be compared across images.
- 7 x 7 cells, each about 32 px of the 224 px view.
- Deletion tests blank patches to grey, producing unnatural images; this is a
  known limitation of the method, and the baselines above are why it is still
  informative.
- Explains the model's own top prediction, which may be wrong (about 61% correct
  on the sample). It describes what the model did, not whether it was right.
- A single trained head and backbone were evaluated. Nothing is claimed about
  other models.
- Colours: one hue (pale amber to deep terracotta) whose lightness rises with
  value, so it reads in greyscale and for colour-blind viewers, unlike a rainbow
  map.

## Availability

The panel appears only when the app is connected to the live model
(`NEXT_PUBLIC_USE_MOCKS=false`). In mock mode the predictions are invented, so
any heat-map would be too, and it is not shown.

## Verified end to end

With the real backend and real model running locally and the frontend in live
mode: identify -> result (real model version, no demo banner, 479 ms round trip)
-> "Show where the model looked" -> two 224 x 224 PNGs load, the text alternative
reads "Most of the evidence is in the upper left part of the image...", the
caption states it is not proof and that only the centre is shown, no anatomy is
named, and the show/hide checkbox is present and on by default (the toggling
itself was not clicked through). This was also the **first real run of the
frontend against `/api/classify`**, which previously had only been tested
against mocks.

Not covered: a screenshot of the rendered panel (the browser pane would not
capture frames), so the overlay was inspected from a rendered image of the same
output instead.
