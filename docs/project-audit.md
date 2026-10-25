# BreedVision — Project Audit (Phase 0)

**Date:** 2026-08-19
**Branch:** `main` @ `7bdf979`
**Scope:** Discovery only. No application code, no dataset, no model was created.
**Status:** Greenfield.

---

## 1. Current Architecture

**There is no architecture yet.** The repository is a skeleton produced by two commits:

| Commit | Content |
|---|---|
| `a1f9d1a` | Initial commit — `.gitignore`, `README.md` (2 lines) |
| `7bdf979` | "initialize project structure" — 8 empty placeholder entries, `.gitignore` rewritten |

### Tracked files (10 total)

```
.gitignore
README.md
docs/api              <- 0-byte FILE (see Defect D1)
docs/architecture     <- 0-byte FILE
docs/research         <- 0-byte FILE
ml/dataset            <- 0-byte FILE
ml/evaluation         <- 0-byte FILE
ml/notebooks          <- 0-byte FILE
ml/scripts            <- 0-byte FILE
ml/training           <- 0-byte FILE
```

Working tree is clean. No untracked work in progress.

---

## 2. Existing Functionality

**None.** Verified by inspection:

- No Python source files, no `requirements.txt`, no `pyproject.toml`
- No `package.json`, no `node_modules/`, no React Native / Expo project
- No backend, no FastAPI app, no routes
- No model code, no training scripts, no checkpoints
- No dataset present anywhere on disk (searched `C:\Users\Neil` to depth 4)
- No database schema or migrations
- No `.env`, no `.env.example`
- No CI, no Dockerfile, no `docker-compose.yml`
- No tests

`README.md` contains a 3-sentence product blurb only. It already asserts
*"seamlessly integrate with national databases like the Bharat Pashudhan app"* —
see Risk R7. No such integration exists and none is currently scoped.

---

## 3. Environment

### Verified toolchain

| Tool | Version | Notes |
|---|---|---|
| Python | 3.14.3 | Single interpreter, `C:\Users\Neil\AppData\Local\Python\pythoncore-3.14-64` |
| pip | 25.3 | system `site-packages` is **not writable** — a venv is mandatory |
| Node.js | 24.14.0 | |
| npm / npx | 11.9.0 | |
| git | 2.53.0.windows.2 | |
| Docker | 29.3.1 | Available for Phase 19 |
| Kaggle CLI | **not installed** | no `~/.kaggle/kaggle.json`, no `KAGGLE_*` env vars |
| conda | not installed | use `venv` |
| Expo / EAS | not installed | no `~/.expo` |

`python -m venv` was tested in the scratchpad and **works**.
Only 43 packages are installed globally; `pillow 12.2.0` is the only relevant one.

### Hardware

| Component | Value |
|---|---|
| CPU | AMD Ryzen 7 7445HS — 6 cores / 12 threads |
| RAM | 15.27 GB |
| Active GPU | AMD Radeon 740M (integrated, 512 MB dedicated, shares system RAM) |
| Discrete GPU | NVIDIA GeForce RTX 3050 Laptop — **not connected** |
| Free disk (C:) | 86.1 GB |

### GPU finding (important)

The machine has an RTX 3050 Laptop GPU registered in Windows, but it is a
**phantom device**:

```
FriendlyName : NVIDIA GeForce RTX 3050 Laptop GPU
Status       : Unknown
Present      : False
Problem      : CM_PROB_PHANTOM
Description  : Currently, this hardware device is not connected to the computer. (Code 45)
```

`nvidia-smi.exe` exists at `C:\Windows\system32\` but exits with code 4
("insufficient permissions"), consistent with no live NVIDIA device.

Only the AMD iGPU is enumerated as a live display adapter, so **CUDA is
unavailable right now**. Likely causes are a BIOS/MUX setting (iGPU-only mode),
a disabled dGPU, or a stale registry entry. This is a user-side hardware action,
not something the codebase can resolve — but it is the highest-leverage item in
this audit (Risk R1).

### PyTorch wheel availability (verified via `pip install --dry-run`)

Python 3.14 is new enough to be a genuine compatibility risk, so this was
tested rather than assumed:

| Index | Resolves to |
|---|---|
| PyPI (CPU) | `torch-2.13.0-cp314-cp314-win_amd64.whl` ✅ |
| `download.pytorch.org/whl/cu126` | `torch-2.13.0+cu126-cp314` ✅ |
| `download.pytorch.org/whl/cu128` | `torch-2.11.0+cu128-cp314` ✅ |

**Conclusion:** Python 3.14 is viable — cp314 wheels exist for both CPU and CUDA
builds, so no downgrade is required *for PyTorch*. Secondary dependencies
(`ultralytics`, `timm`, `albumentations`, `onnxruntime`, `opencv-python`) have
**not** been resolution-tested on cp314; that is a Phase 1 task (Risk R6).

---

## 4. Missing Components

Everything below the dataset layer. Grouped by phase:

- **Data (Ph. 1):** dataset not downloaded; no Kaggle credentials; no `data/` tree; no inspection / validation / split scripts; no dataset report
- **ML (Ph. 2–8):** no training harness, no config system, no model comparison, no evaluation, no augmentation study, no confidence / unknown handling, no explainability, no export pipeline
- **Backend (Ph. 9):** no FastAPI app, no endpoints, no schemas, no logging
- **Data layer (Ph. 10–11):** no database schema, no migrations, no object storage
- **Frontend (Ph. 12–14):** no Expo app, no screens, no offline queue, no GPS handling
- **Dashboard (Ph. 15):** none
- **Breed knowledge base (Ph. 16):** none
- **Security / testing / deployment (Ph. 17–19):** no `.env.example`, no auth, no tests, no Docker, no deployment docs

---

## 5. Technical Debt

| ID | Severity | Issue |
|---|---|---|
| **D1** | Medium | `docs/api`, `docs/architecture`, `docs/research`, `ml/dataset`, `ml/evaluation`, `ml/notebooks`, `ml/scripts`, `ml/training` are committed as **0-byte regular files**, not directories (git mode `100644`, blob `e69de29` = the empty blob). They were evidently meant to be directories. Writing `docs/api/spec.md` will fail while they exist. **Fix:** delete the 8 files, create real directories with `.gitkeep`. Deliberately *not* done in Phase 0 — this is an audit, not a change. |
| **D2** | Medium | Three competing directory conventions. `.gitignore` already references `backend/uploads/` and `backend/reports/`, implying a `backend/` tree; the committed skeleton uses `ml/`; the project spec asks for `training/` and `data/`. **Must be reconciled before Phase 1** or artifacts will scatter. Proposal in §6.1. |
| **D3** | Medium | `.gitignore` ignores `*.pt`, `*.pth`, `*.onnx` with no exception and no artifact-tracking strategy. Correct for git hygiene, but Phase 2's "keep model artifacts versioned" then has nowhere to live. Needs an explicit `artifacts/` convention plus a checksum manifest. |
| **D4** | Low | `README.md` claims Bharat Pashudhan integration that does not exist (violates Engineering Principle 13). Must be reworded. |
| **D5** | Low | `.gitignore` has no `data/` entry. Without one, a 12–15k-image dataset risks being committed. |

---

## 6. Recommended Next Steps

### 6.1 Resolve the directory layout first (blocks Phase 1)

Proposed canonical tree, reconciling D2:

```
BreedVision-AI/
├── data/                 # gitignored; dataset + splits + metadata
├── ml/                   # keep (already committed) — all ML code
│   ├── scripts/          #   dataset inspection, validation, splitting
│   ├── training/         #   train.py, evaluate.py, inference.py, config.yaml
│   ├── evaluation/       #   metrics, confusion matrices, error dirs
│   ├── notebooks/
│   └── dataset/          #   dataset-building library code
├── artifacts/            # gitignored; versioned checkpoints + manifest
├── backend/              # FastAPI (matches paths already in .gitignore)
├── mobile/               # Expo app
├── dashboard/            # admin web dashboard
└── docs/
```

This preserves the already-committed `ml/` layout, honours the `backend/` paths
already present in `.gitignore`, and maps `ml/training/` onto the spec's
`training/`. **Needs sign-off before Phase 1** — cheap now, expensive later.

### 6.2 Immediate blockers

1. **Kaggle credentials** — required to obtain the dataset
   (Kaggle → Settings → API → Create New Token → `~/.kaggle/kaggle.json`).
   No dataset ⇒ Phase 1 cannot start.
2. **Storage location decision** — see Risk R2.
3. **GPU investigation** — see Risk R1 (can proceed in parallel; needed by Phase 2).

---

## 7. Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| **R1** | **No usable training GPU.** Only the AMD iGPU is live; the RTX 3050 is a phantom device; ROCm does not support Radeon 740M on Windows. All local training would be **CPU-only on 12 threads**. | High — 50-class fine-tuning becomes hours per experiment, making the Phase 2 multi-architecture comparison and Phase 4 ablations impractical. | Preferred: re-enable the RTX 3050 (BIOS / MUX / driver reinstall) and install a `+cu126` build. Fallback: train on Kaggle Notebooks or Colab free T4, keeping this machine for inference, backend and app work. Second fallback: frozen-backbone feature caching (extract embeddings once, train only the head) — cheap on CPU and a legitimate Phase 2 baseline. Decision needed **before Phase 2**, not before Phase 1. |
| **R2** | **Repository sits inside OneDrive** (`C:\Users\Neil\OneDrive\Desktop\BreedVision-AI`). A 12–15k-image dataset plus checkpoints will be continuously sync-scanned, causing slow I/O, file locks during training, and possible cloud-quota exhaustion. | High | Keep `data/` and `artifacts/` **outside** OneDrive (e.g. `C:\bv-data\`) and reference them via config / env var. Alternatively exclude the folder from OneDrive sync. The dataset should never enter the synced tree. |
| **R3** | **Dataset entirely unverified.** It has not been downloaded. The "50 breeds / 12–15k images" figure is Kaggle description text only. Comparable Kaggle cattle datasets are frequently web-scraped, with duplicates, mislabels, and near-identical frames. | High | Phase 1 exists to measure this. Treat class count and per-class counts as **unknown** until measured. No model claims before the dataset report. |
| **R4** | **Data leakage from same-animal / same-source images.** If the dataset is scraped, multiple photos of one animal spread across splits will inflate validation accuracy substantially. | High | Phase 1 must run perceptual-hash near-duplicate clustering and group-aware splitting rather than naive image-level stratified splitting. This is the most likely source of a deceptively high accuracy figure. |
| **R5** | **Moderate disk headroom** — 86 GB free. Dataset, augmented caches, multiple checkpoints, ONNX exports and Docker images accumulate. | Medium | Budget explicitly, prune intermediates, retain only best-N checkpoints. |
| **R6** | **cp314 wheel gaps for secondary ML dependencies.** PyTorch is confirmed; `ultralytics`, `timm`, `albumentations`, `onnxruntime`, `opencv-python` are untested on 3.14. | Medium | Resolution-test the full dependency set early in Phase 1, before writing code against it. If a hard gap appears, install Python 3.12 alongside rather than fighting it. |
| **R7** | **Overclaiming in project materials.** `README.md` already asserts national-database integration; the accompanying deck reportedly claims offline AI and sub-10-second inference. | Medium | Enforce Engineering Principles 10–15. Rewrite README in Phase 22. Every claim must trace to a measured number or be labelled future scope. |
| **R8** | **Phase 6 (YOLO) may have no legal training data.** The Kaggle dataset is a classification set and almost certainly carries no bounding boxes. | Low (deferrable) | Phase 6 is explicitly conditional. Prefer a pretrained COCO detector (COCO has a `cow` class) over training from scratch, and measure whether cropping helps at all before adopting it. |
| **R9** | **Single developer, 23 phases.** Large surface for a hackathon prototype. | Medium | The phase-gate protocol already mitigates this. Recommend planning for a reduced Phase 13 (offline capture + sync, with on-device inference as documented future scope) unless Phase 8 export results are unusually strong. |

---

## 8. Verdict

Clean greenfield start; no existing work is at risk of being overwritten. Three
items must be resolved before meaningful Phase 1 work: **directory-layout
sign-off (D2)**, **Kaggle credentials**, and **where the dataset and artifacts
physically live (R2)**. The GPU question (R1) is not needed until Phase 2 but
should be investigated in parallel, since the fix may require a BIOS reboot.
