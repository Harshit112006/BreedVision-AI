# Dataset Pipeline (Phase 1)

**Status:** Pipeline complete and verified. **The real dataset has not been
processed yet** — blocked on Kaggle credentials (see §6).

---

## 1. What this is

A reproducible, four-stage pipeline that turns a raw image dataset into
leakage-free train/validation/test splits plus an evidence-based report. It is
designed around one specific failure mode: **near-identical photographs of the
same animal landing on both sides of a split boundary**, which silently
inflates validation accuracy.

```
raw images
    │
    ├─ 1. inspect_dataset.py    validate, measure, hash          → inventory.parquet
    ├─ 2. detect_duplicates.py  exact + perceptual dedupe        → groups.parquet
    ├─ 3. build_splits.py       group-aware split + leakage test → splits.parquet
    └─ 4. make_report.py        figures + markdown report        → docs/dataset-report.md
```

Each stage reads the previous stage's artefact, so any stage can be re-run
independently.

## 2. Layout

| Path | Purpose |
|---|---|
| `ml/config.yaml` | Single source of truth: paths, seed, thresholds |
| `ml/dataset/` | Library code — `inventory`, `hashing`, `splitting`, `viz`, `config` |
| `ml/scripts/` | The four stage scripts plus `download_dataset.py` |
| `ml/tests/` | Synthetic fixture + 21 end-to-end tests |
| `C:/bv-data/` | All data and artefacts — **outside** the repo (audit Risk R2) |

Data lives at `C:/bv-data/` deliberately. The repository sits inside a
OneDrive-synced folder, and a 12–15k-image dataset under continuous sync
scanning causes slow I/O and file locks during training. The virtual
environment is at `C:/bv-data/venv` for the same reason.

## 3. Design decisions

### 3.1 Two-stage image validation

`Image.verify()` catches structural damage cheaply but **passes many truncated
JPEGs**. A full `Image.load()` is therefore also performed. `LOAD_TRUNCATED_IMAGES`
is explicitly left `False` so corruption is measured rather than silently
padded. The test suite plants a truncated JPEG specifically to hold this
behaviour in place.

### 3.2 Perceptual hash size: 64-bit, not 256-bit

Measured on the fixture, comparing same-animal against different-animal pairs:

| Hash | Same-animal (med / p95 / max) | Different-animal (p1 / med) | Best threshold | Recall | False-merge rate |
|---|---|---|---|---|---|
| 64-bit (`hash_size=8`) | 2 / 8 / 14 | 22 / 32 | 14 | 1.000 | 0.0010 |
| 256-bit (`hash_size=16`) | 36 / 80 / 88 | 102 / 128 | 88 | 1.000 | 0.0018 |

The 256-bit hash separates no better and costs 4× more, so the pipeline uses
64-bit.

### 3.3 Threshold selection: pick the plateau

The configured threshold is **16**, chosen from the sweep rather than guessed:

| Threshold | Groups found | Largest group |
|---|---|---|
| 0 | 97 | 4 |
| 4 | 48 | 6 |
| 8–16 | **39** | 6 |
| 19 | 37 | 10 |
| 24 | 1 | 136 |

The fixture plants exactly **39** near-duplicate families, and thresholds 8–16
recover exactly 39 — a stable plateau. Below it, families fragment
(under-merging → leakage). Above it, distinct animals fuse, and by 24 the entire
dataset collapses into a single unsplittable group. **Neither tail is safe**, so
the rule is to choose the plateau and confirm the group count is stable around
the chosen value. `max_group_size_warn` guards against silent collapse.

> This threshold is calibrated on **synthetic** data. It must be re-derived on
> the real dataset with `detect_duplicates.py --sweep` before the splits are
> used for modelling.

### 3.4 Group-aware splitting

Near-duplicate pairs are turned into connected components via union-find; each
component is a presumed same-animal/same-source group. Splitting uses
`StratifiedGroupKFold`, so a whole group always lands in one split.

A naive image-level split is computed **in parallel, for comparison only**. The
count of near-duplicate pairs straddling a split boundary under each strategy is
what turns "we avoided leakage" into a measured number.

### 3.5 Manifests, not copies

Splits are recorded as manifests (`splits.parquet`, `train/val/test.csv`) rather
than by copying files. Copying would triple the dataset on disk for no benefit.
`build_splits.py --materialize` exists for when a physical tree is genuinely
required.

### 3.6 Small classes are excluded, not silently split

Classes with fewer than `split.min_images_per_class` (10) images cannot be split
three ways meaningfully. They are excluded from the modelling set, listed
explicitly in the report, and retained in the inventory for audit.

## 4. Verification

The pipeline was validated against a synthetic fixture with **known planted
defects** (`ml/tests/make_fixture.py`): 141 files across 6 classes, containing 3
corrupt files (zero-byte, garbage bytes, truncated JPEG), 2 undersized images, 2
byte-identical duplicates, 39 near-duplicate families, and one class below the
minimum size.

Measured results:

| Check | Expected | Found |
|---|---|---|
| Total files | 141 | 141 |
| Valid images | 136 | 136 |
| Corrupt files | 3 (exact set) | 3 (exact set) |
| Undersized files | 2 (exact set) | 2 (exact set) |
| Exact-duplicate redundant files | 2 | 2 |
| Near-duplicate groups | 39 | 39 |
| Class below minimum excluded | `RareBreed` | `RareBreed` |

**Leakage result — the central Phase 1 outcome:**

| Split strategy | Cross-split near-duplicate pairs |
|---|---|
| Naive image-level | **80** of 177 (45%) |
| Group-aware (production) | **0** |

Naive splitting scattered 80 near-duplicate pairs across boundaries
(`train↔val` 43, `test↔train` 30, `test↔val` 7). Group-aware splitting scattered
none, with zero groups spanning multiple splits. Achieved fractions were
0.697 / 0.159 / 0.144 against a requested 0.70 / 0.15 / 0.15 — drift is expected
because groups are indivisible.

Determinism was verified by re-running stages 1–3 from scratch and confirming
`groups.parquet` and `splits.parquet` are identical across runs.

**Test suite: 21 passed** (`python -m pytest ml/tests -v`, 11.6 s).

A sample of the generated report is at
[`docs/examples/fixture-dataset-report.md`](examples/fixture-dataset-report.md).
It is generated from the fixture, **not** the cattle dataset, and is labelled as
such.

## 5. Running it

```bash
C:/bv-data/venv/Scripts/python -m pip install -r ml/requirements.txt
```

```bash
python ml/scripts/download_dataset.py
```

```bash
python ml/scripts/inspect_dataset.py
```

```bash
python ml/scripts/detect_duplicates.py --sweep
```

```bash
python ml/scripts/detect_duplicates.py
```

```bash
python ml/scripts/build_splits.py
```

```bash
python ml/scripts/make_report.py
```

All stochastic steps are seeded from `ml/config.yaml` (`seed: 42`).
`build_splits.py` exits non-zero if the leakage acceptance check fails, so it is
safe to use as a gate in CI.

## 6. Blocked

`docs/dataset-report.md` **does not exist yet** and will not be hand-written.
It is produced by stage 4 from real measurements. Producing it requires:

1. Kaggle API credentials at `%USERPROFILE%\.kaggle\kaggle.json`
   (Kaggle → Settings → API → Create New Token), and
2. accepting the dataset's terms once on its Kaggle page.

`download_dataset.py` detects missing credentials and exits 2 with instructions.

## 7. Known limitations

- Near-duplicate grouping is a **proxy** for same-animal identity. The dataset
  carries no animal ID, so groups are inferred from perceptual similarity alone.
  Two photographs of one animal from very different angles will not group, so
  some same-animal leakage may remain. The reported cross-split count is a
  **lower bound**, not a guarantee of zero leakage.
- The threshold is calibrated on synthetic images whose statistics differ from
  real photographs. Re-sweeping on real data is mandatory.
- Breed labels come from directory names and are unverified against an authority
  such as ICAR-NBAGR. Label noise is unmeasured.
- No bounding-box annotations exist in a classification dataset, so Phase 6
  cannot train a detector from it (audit Risk R8).
- Class imbalance is preserved into the splits by design. Rebalancing is a
  Phase 2/4 modelling decision, not a dataset decision.
