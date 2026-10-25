# Duplicate-photo check

Flags when a photo being identified looks like one already saved on this device.

## What it is, precisely

A **perceptual hash** (64-bit pHash) is computed for each photo. Two photos whose
hashes differ by only a few bits are almost certainly the same picture, even
after re-saving, resizing, recompression or a brightness change.

**It compares pictures, not animals.** It cannot tell that two *different*
photographs show the same cow, and it must never be described as doing so. The UI
says so wherever it reports a match.

## Measured performance

`ml/scripts/eval_duplicate_detection.py`, 400 real dataset photos sampled from
distinct near-duplicate groups (so every pair is a genuinely different photo),
seed 42. Distance is the Hamming distance between hashes (0 to 64).

### Re-submitted copies caught, by Hamming threshold

| Alteration | <=2 | <=4 | <=8 | <=10 |
|---|---|---|---|---|
| Identical file | 100% | 100% | 100% | 100% |
| Resized to 1280 px (what the app does) | 100% | 100% | 100% | 100% |
| Resized to 50% | 100% | 100% | 100% | 100% |
| JPEG quality 60 | 100% | 100% | 100% | 100% |
| JPEG quality 85 | 100% | 100% | 100% | 100% |
| Brightness -20% | 99.8% | 100% | 100% | 100% |
| Brightness +20% | 75.0% | 93.0% | 99.8% | 100% |
| **Centre crop 90%** | 0.8% | 1.2% | **28.5%** | 54.5% |
| **Centre crop 80%** | 0.0% | 0.0% | **0.5%** | 1.8% |
| **Rotated 5 degrees** | 0.0% | 0.8% | **14.8%** | 30.5% |
| **Horizontal flip** | 0.0% | 0.0% | **0.0%** | 0.0% |

### Different photos wrongly flagged

| Pair type | Pairs | Closest pair | Flagged at <=6 | Flagged at <=8 |
|---|---|---|---|---|
| Same breed, different photo | 1,683 | 12 | 0 | 0 |
| Different breed | 78,117 | 12 | 0 | 0 |
| **All pairs, mirror-aware** | 79,800 | 8 | **0** | **1** (0.0013%) |

## Design decisions

- **Two tiers.** Distance **0-4 = "same photo"**, **5-8 = "similar photo"**. Both
  are advisory: the user is shown the earlier record and can still save.
- **Mirror-aware matching.** The new photo is compared against the stored hash
  both as-is and mirrored. A flipped copy is the cheapest way to dodge a plain
  comparison and defeated the plain hash 100% of the time. It added one false
  pair in 79,800 at distance 8 and none at 6 or below.
- **Never blocks.** A failed or slow check shows no notice and cannot stop
  identification or saving.

## What it does NOT catch

Read this before claiming anything about fraud prevention.

- **Cropped copies.** An 80% crop was caught 0.5% of the time; a 90% crop 28.5%.
- **Rotated copies.** 5 degrees was caught 14.8% of the time.
- **Different photos of the same animal.** Not detectable by this method.
- **Anything on another device.** The check only sees records stored in this
  browser. It does not compare across users, so it is **not by itself a defence
  against cross-user insurance or subsidy fraud.** That would need server-side
  comparison (planned with the Supabase work) and, for same-animal identity,
  a fundamentally different method.

A person determined to evade it can crop slightly or rotate. The realistic
purpose is catching careless or honest repeat submissions, such as the same
photo saved twice.

## Browser verification (real cattle photos)

Real dataset photos pushed through the actual app:

| Check | Result |
|---|---|
| 6 different photos saved | 0 falsely flagged |
| Browser hash vs Python `imagehash` | within **0-2 bits** on all 6 |
| Identical re-upload | caught, "same photo" |
| JPEG quality 60 | caught, "same photo" |
| Resized to 50% | caught, "same photo" |
| Brightness -20% | caught, "same photo" |
| **Mirrored copy** | caught |
| **80% centre crop** | **not caught** (as measured) |
| Saving a flagged duplicate | allowed; stored as `same`, distance 2, linked to the original |
| History | badge on exactly 1 of 7 records |
| Record page | shows the link and "compares pictures, not animals" |

The 0-2 bit difference comes from the 32x32 downscale (canvas versus PIL's
Lanczos). It is well inside the 4-bit "same photo" limit, but it is a real
difference, and a photo sitting exactly on a threshold could land on either side.

## Keeping browser and measurement in step

The thresholds were measured with Python; the browser runs a TypeScript
reimplementation of the same maths. `ml/tests/test_phash_parity.py` runs the real
TypeScript against Python's `imagehash` and requires bit-exact hashes on 80
arrays, plus mirrors. It was confirmed to fail (160 mismatches) when the hash
logic is deliberately changed.
