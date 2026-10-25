# "Does this look like cattle?" check

The classifier always names *some* breed, even for a photo of a building. This
check lets the app say "this does not look like cattle" instead.

## How it works

`ml/training/ood.py`. For each photo the model's own feature vector (1,280
numbers from the network just before the breed layer) is compared with the average
feature vector of each of the 49 breeds, using the Mahalanobis distance (distance
measured in units of how much the training photos normally vary). The smallest
distance to any breed is the photo's score; a high score means the photo is far
from every breed (Lee et al., 2018).

- Fitted on **training** photos only.
- The cut-off is the **98th percentile of validation** scores, so about 2% of real
  cattle photos are flagged by construction.
- Shipped inside the model bundle (it adds about 6.5 MB). `/api/classify` returns
  `looks_like_cattle: true | false | null`. When `false`, the web app states no
  breed, whatever the confidence number says, and the CSV export leaves the breed
  columns empty.

## What was measured

| Check | Result |
|---|---|
| Real cattle photos wrongly flagged, validation | 2.1% (by construction) |
| Real cattle photos wrongly flagged, **test** (a held-out check, nothing chosen from it) | **1.4%** |
| Pagoda photo (scikit-learn sample "china") | flagged |
| Flower photo (scikit-learn sample "flower") | flagged |
| Gradient image | flagged |
| Checkerboard | flagged |
| Random-noise image | **not flagged** |
| Solid grey image | **not flagged** |

Raw numbers: `C:\bv-data\runs\phase2-frozen-baseline__efficientnet_b0_ft__ood.json`.

## What it does not show

- **Only six non-cattle images were available** (two photos shipped with
  scikit-learn plus four synthetic images). That is a tiny, weak sample. It says the
  check notices pictures unlike cattle photos; it does not measure how well.
- **Other animals are untested.** A dog, horse or buffalo may well pass as "cattle".
  The dataset contains no such images, and none were added.
- **Two synthetic images slipped through** (pure noise, a solid colour).
- It will flag about 1–2% of genuine cattle photos, typically unusual crops or
  lighting. In the demo kit, an earlier model's "confidently wrong" picture happened
  to be one of these.
- A stronger version would need a set of real non-cattle photos, including other
  livestock, to set the cut-off against.
