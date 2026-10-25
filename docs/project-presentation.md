# BreedVision

**Image-based breed identification for Indian cattle, with honest confidence, an indicative value guide, and a multilingual field app**

Smart India Hackathon, problem statement SIH25004 · Mini-project presentation document
Status as of 26 October 2026 · A working research prototype, not a deployed product

---

## 1. At a glance

| | |
|---|---|
| **What it does** | A user photographs a cow or bull. BreedVision names the breed (one of 49 Indian cattle breeds) **only when it is confident**, otherwise shows the likeliest candidates, says when a photo does not look like cattle, shows where in the photo the model found evidence, keeps a record on the device, and gives an indicative rupee value guide. |
| **Core model** | EfficientNet-B0 (ImageNet-pretrained), last three blocks fine-tuned on 5,570 cattle photos |
| **Measured accuracy** | On 1,114 photos never used for any decision: **61.9% top-1, 83.0% top-3** (chance is 2%). When it names a breed (24% of photos) it is right **90.1%** of the time. |
| **Runs on** | A laptop CPU in about 0.05 s per photo. No GPU, no internet, no paid API keys. |
| **Interface** | Web app in English, Hindi, Marathi, Tamil and Telugu; works on a phone browser |
| **Honest limits** | Web-source photos only (no field testing yet); no buffalo; no Bharat Pashudhan integration; not load-tested; translations not yet reviewed by native speakers |
| **Tests** | 112 automated tests (50 web, 40 machine-learning, 22 database-security) |

**The one-sentence pitch:** most image classifiers always name *something*; BreedVision is built to say "I am not sure", and to show its evidence, because a wrong confident answer in a breeding or subsidy record is worse than no answer.

---

## 2. The problem

India holds the world's largest livestock population (the team's deck cites 536 million cattle and buffaloes from the 20th Livestock Census; not independently re-verified here). Yet:

- **Breed identity is judged by eye** by a small number of experts. It is subjective, varies between regions, and the expertise is not where the animal is.
- **Records are hard to standardise.** Breed data collected across districts is difficult to compare or add up without a consistent method.
- **Value is negotiated without a reference.** Smallholders often have no basis for knowing what a fair range is.
- **Wrong or duplicated records distort** breeding programmes, insurance claims, subsidy allocation and national livestock databases.

SIH25004 asks for image-based breed recognition for Indian cattle (and buffaloes). The official wording should be copied from the SIH portal for the formal submission; this document paraphrases it.

---

## 3. Target audience

These are the intended users. No user research or field trial has been done yet, so this is who the design is aimed at, not a validated market.

| Who | What they would use it for |
|---|---|
| **Field veterinary and animal-husbandry staff**, livestock-census and registration workers | A consistent, recorded second opinion on breed, with a confidence they can see and an explicit "not sure" |
| **Farmers and cattle keepers**, especially smallholders | Identify a breed, understand a likely value range before negotiating, keep a simple record in their own language |
| **Breed societies, cooperatives and breeding programmes** | Standardised breed records and a reference of the 49 breeds with sources |
| **Insurers and subsidy administrators** | Evidence that a breed claim was checked, with the confidence stated (future; not built) |
| **Students and researchers** | A reproducible, leak-free dataset pipeline and honest evaluation of a 49-class cattle problem |

---

## 4. How we are tackling it

We treated this as a **trust problem as much as an accuracy problem**. The approach, in order:

1. **Audit and clean the data first.** A public dataset was downloaded, validated image by image, and checked for duplicates and label contradictions before any model was trained.
2. **Split without leakage.** Photos that look alike are kept together on one side of the train/validation/test split, so the test score is honest.
3. **Pick a small, fast model by comparison, not assumption.** Three ImageNet-pretrained backbones were compared on equal terms; a lightweight one was chosen so it can run on ordinary hardware.
4. **Improve it by controlled fine-tuning,** choosing everything on validation data and touching the test set only to score the result.
5. **Make the confidence mean something.** Calibrate the model's probabilities, then derive two cut-offs from data that decide what the interface is allowed to claim.
6. **Show the evidence and the limits.** Heat-map of where the model looked, a check for "this is not cattle", a duplicate-photo flag, and every limit written down.
7. **Wrap it in a usable, local-first app** in several Indian languages, with sources for every breed description and for the value guide.
8. **Document everything and test it,** so each claim in this document can be traced to code or a measurement.

```
 Photo ──▶ resize & crop ──▶ EfficientNet-B0 ──▶ 49 scores ──▶ calibrate (T=0.855)
                                   │                                  │
                                   │                                  ▼
                                   │                 confidence band: ≥85% name the breed
                                   │                                  30–85% show candidates
                                   │                                  <30% ask for a better photo
                                   ▼
                      feature distance to cattle photos ──▶ "does this look like cattle?"
                      Grad-CAM heat-map ──▶ "where did the model look?"
```

---

## 5. Features implemented

| # | Feature | What it does | Status | Where (in the IDE) |
|---|---|---|---|---|
| 1 | **Breed identification** | 49 Indian cattle breeds from one photo, with top candidates | Built, tested | `ml/training/`, `backend/classifier.py`, `web/src/components/identify/IdentifyFlow.tsx` |
| 2 | **Calibrated confidence bands** | Names a breed only at ≥85% confidence; lists candidates at 30–85%; asks for a better photo below 30% | Built, tested | `ml/training/calibrate.py`, `web/src/lib/confidence.ts`, `web/src/components/prediction/` |
| 3 | **"Not cattle" check** | Flags photos unlike any cattle photo and states no breed | Built; limits stated | `ml/training/ood.py`, `web/src/components/prediction/PredictionResult.tsx` |
| 4 | **"Where did the model look?"** | Grad-CAM heat-map over the photo, with plain-language limits | Built, measured | `ml/training/explain.py`, `web/src/components/prediction/HeatmapPanel.tsx` |
| 5 | **Duplicate-photo check** | Flags a photo that looks like one already saved (perceptual hash) | Built, device-only | `web/src/lib/phash*.ts`, `web/src/services/duplicates.ts` |
| 6 | **Records and history** | Saves each result on the device with time and optional GPS location; filters; delete | Built | `web/src/services/records.ts`, `localdb.ts`, `web/src/components/history/` |
| 7 | **CSV export** | Exports records; never states a breed the app did not state | Built, tested | `web/src/lib/csv.ts` |
| 8 | **Breed library** | All 49 breeds with description, traits, sources, photos | Built, sourced | `web/src/services/mock/breed-info.ts`, `web/src/app/breeds/` |
| 9 | **Cattle value guide** | Indicative rupee value and range from breed, milk yield, pregnancy | Built; indicative only | `web/src/lib/price-reference.ts`, `web/src/components/prices/ValueCalculator.tsx` |
| 10 | **Five languages** | English, Hindi, Marathi, Tamil, Telugu | Built; unreviewed | `web/src/i18n/` |
| 11 | **Model facts page** | The real numbers and limits, for anyone to read | Built | `web/src/app/model/page.tsx` |
| 12 | **Accounts and cloud backup** | Sign-in, private backup, cross-account duplicate check | Built and security-tested, **switched off** | `supabase/`, `web/src/services/cloud.ts` |

**Built but deliberately not shown:** accounts and cloud backup (switch `ACCOUNTS_ENABLED` in `web/src/services/config.ts`); a synthetic sales dataset (`ml/synthetic/`).
**Not built:** buffalo identification (no buffalo in the dataset), Bharat Pashudhan integration, offline-installable app (PWA), model compression for phones, live field testing.

---

## 6. System architecture

```
BROWSER (phone or laptop)  - Next.js web app, folder web/
  pages: Home, Identify, Breeds, History, Cattle value, Model facts
  on-device storage (IndexedDB): records and photos
  language picker (5), duplicate-photo hash, CSV export, optional GPS
        |
        |  photo sent to  POST /api/classify  and  POST /api/explain
        v
BACKEND - FastAPI, folder backend/
  classifier.py -> ml/training/inference.py -> model bundle (22 MB, offline)
  returns: breed, confidence, band, alternatives, looks_like_cattle, model version
  explain: Grad-CAM heat-map

OPTIONAL (built, switched off):  Supabase = Postgres + row-level security + private storage
OFFLINE TRAINING PIPELINE (ml/):  dataset audit -> leak-free split -> train -> calibrate -> export
```

Design rules that shape everything: **the model is read-only and self-contained** (no network at load time); **records stay on the device by default**; **the interface only claims what the confidence band allows**; **every threshold is derived from data, not guessed**.

---

## 7. Models used

### 7.1 The deployed model

| | |
|---|---|
| **Architecture** | EfficientNet-B0 (`efficientnet_b0.ra_in1k` from the `timm` library), about 4.0 million parameters |
| **Pretraining** | ImageNet-1k (general object recognition), used as a starting point (transfer learning) |
| **Our training** | Stage 1: frozen backbone + linear layer on cached features. Stage 2: last three backbone blocks (3.76 million parameters) fine-tuned with augmentation (random crop, flip, ±10° rotation, colour jitter), label smoothing 0.1, class-balanced loss, one-cycle learning rate, 8 epochs on CPU; the best epoch (5) was chosen on **validation** only |
| **Input** | 224 × 224 pixels (60% of the dataset's photos have a short edge below 224, so larger input would mostly stretch pixels) |
| **Output** | 49 scores, converted to probabilities, calibrated with temperature scaling (T = 0.855) |
| **File** | `backend/models/breedvision_classifier.pt` (22.3 MB), manifest `breedvision_classifier.json` |
| **Speed** | About 0.04–0.05 s per photo on a laptop CPU, measured end to end through the API |

### 7.2 How the backbone was chosen (validation split)

| Backbone | Top-1 | Macro-F1 | Top-3 | Parameters | Size | Time per photo (CPU) |
|---|---|---|---|---|---|---|
| **EfficientNet-B0 (chosen)** | 63.6% | 0.605 | 82.8% | 4.0 M | 15 MB | 21.7 ms |
| MobileNetV3-Large | 62.5% | 0.597 | 84.9% | 4.2 M | 16 MB | 17.5 ms |
| ResNet-50 | 57.9% | 0.541 | 80.1% | 23.5 M | 90 MB | 61.0 ms |

ResNet-50 lost on every measure. EfficientNet-B0 and MobileNetV3 were within about a point of each other (MobileNetV3 was slightly better on top-3). We continued with EfficientNet-B0; a full test-set comparison of the two was not run.

### 7.3 Supporting models and methods (all derived from the same network)

| Component | Method | File |
|---|---|---|
| Calibration | Temperature scaling, 5-fold cross-fitting; thresholds 0.85 / 0.30 | `ml/training/calibrate.py` |
| "Not cattle" check | Smallest Mahalanobis distance from the photo's features to any breed's average; cut-off at the 98th percentile of validation scores | `ml/training/ood.py` |
| Heat-map | Grad-CAM, computed in closed form (exact for this architecture) | `ml/training/explain.py` |
| Duplicate-photo check | 64-bit perceptual hash, compared by Hamming distance | `web/src/lib/phash-core.ts` |
| Value guide | Listed price ranges adjusted for milk yield and pregnancy | `web/src/lib/price-reference.ts` |

### 7.4 Why no external AI service

There is **no OpenAI/Claude/Gemini or other paid API key anywhere in the project**. Everything runs locally. That keeps cost at zero, keeps photos private, and means the demo works without internet.

---

## 8. Dataset

| | |
|---|---|
| **Source** | Kaggle, `atharvadarpude/indian-cattle-image-dataset` (public) |
| **As downloaded** | 8,539 files, 8,515 valid images, 50 folders (classes), 2.48 GB |
| **After cleaning** | **7,799 images, 49 breeds** |
| **Split** | Train 5,570 · Validation 1,115 · Test 1,114 (716 excluded) |
| **Class sizes** | 83 to 421 images per breed (5.1× imbalance); handled with class-balanced loss |
| **Typical photo** | median 275 × 225 pixels; JPEG/PNG; web-sourced |

### What we found and fixed

| Problem found | What we did |
|---|---|
| **216 sets of byte-identical images filed under more than one breed** (483 files, 44 of 50 breeds): the dataset contradicts itself | Removed them; documented as a ceiling on achievable accuracy |
| **Ayrshire** is a Scottish breed, outside "Indian cattle" | Removed (hence 49 breeds) |
| **Near-duplicate photos** would let the model "see" test photos in training | Grouped by perceptual hash and kept each group on one side. A naive split leaks **609** near-duplicate pairs from train into test; ours leaks **0** (a lower bound: the dataset has no animal IDs) |
| **No buffalo** in the dataset | Stated plainly: buffalo are not covered |
| **No bounding boxes** | A detector such as YOLO cannot be trained from it; the model is a classifier |

Pipeline code: `ml/dataset/` and `ml/scripts/` (inventory, hashing, splitting, report). Report: `docs/dataset-report.md`.

---

## 9. Results and how honest they are

### 9.1 Final test results (1,114 photos, 49 breeds)

| Measure | Before fine-tuning | **Deployed model** |
|---|---|---|
| Top-1 accuracy | 59.3% | **61.9%** (95% CI 58.8–64.6) |
| Top-3 accuracy | 81.6% | **83.0%** |
| Top-5 accuracy | 90.0% | **90.5%** |
| Macro-F1 | 0.556 | **0.583** |

Fine-tuning improved top-1 by 2.7 points (paired 95% interval +0.5 to +4.9): real, but modest.

### 9.2 What the confidence bands deliver

| Band | Share of photos | Right when so | What the app does |
|---|---|---|---|
| Confident (≥ 85%) | **24.4%** | **90.1%** | Names the breed |
| Uncertain (30–85%) | 66.1% | 57.1% | Lists candidates, names none |
| Low (< 30%) | 9.5% | 23.6% | Asks for a better photo |

The cut-offs were derived on validation data and then **held** on the unseen test set.

### 9.3 Weaknesses we report ourselves

- Weakest breeds (F1): dagri 0.00, gaolao 0.22, kherigarh 0.22, gangatari 0.28, Krishna Valley 0.30. Dagri got worse after fine-tuning.
- The test photos come from the same web sources as the training photos. **Field photos (poor light, partial views) are likely harder and have not been measured.**
- The test set was scored twice, once per model. Nothing was chosen or tuned from either result.
- The "not cattle" check flagged 4 of 6 non-cattle stand-in images (it missed random noise and a solid colour), wrongly flags about 1.4% of real cattle photos, and has **not** been shown to reject other animals such as dogs or buffalo.
- The heat-map beats random and a fixed centre blob in a deletion test on 300 validation photos, but shows regions, not body features.

Full write-ups: `docs/test-evaluation.md`, `docs/non-cattle-check.md`, `docs/explainability.md`.

---

## 10. The frontend

**Stack:** Next.js 16.3.1, React 19, TypeScript, Tailwind CSS v4. Folder: `web/`.

| Page (URL) | Purpose | Code |
|---|---|---|
| Home `/` | Introduction and how it works | `web/src/app/page.tsx` |
| Identify `/identify` | Upload or take a photo, see the result, heat-map, save, estimate value | `web/src/components/identify/IdentifyFlow.tsx` |
| Breeds `/breeds`, `/breeds/[id]` | Library of 49 breeds with sourced descriptions | `web/src/app/breeds/`, `web/src/components/breed/` |
| History `/history`, `/history/[id]` | Saved results, filters, delete, CSV export | `web/src/components/history/` |
| Cattle value `/prices` | Indicative rupee value guide | `web/src/components/prices/ValueCalculator.tsx` |
| Model facts `/model` | Measured accuracy and limits | `web/src/app/model/page.tsx` |
| Account `/account` | Built but switched off (shows 404) | `web/src/components/account/` |

| Folder | Contents |
|---|---|
| `web/src/components/` | UI building blocks: `ui/` (buttons, cards, fields), `prediction/`, `identify/`, `breed/`, `history/`, `prices/`, `navigation/`, `states/` |
| `web/src/lib/` | Pure logic: confidence bands, hashing, CSV, geolocation, value estimate |
| `web/src/services/` | Everything that touches data: predictions (API), records and sales (IndexedDB), cloud (Supabase), config |
| `web/src/i18n/` | Language catalogues (`messages/en|hi|mr|ta|te.ts`) and the language engine |
| `web/tests/` | 50 automated tests |

Design choices: **local-first** (records and photos stay in the browser's storage), **a single light theme** chosen for outdoor phone use, **text contrast measured and heading structure checked**, and **nothing is presented as more certain than it is**.

---

## 11. The backend

**Stack:** FastAPI (Python). Folder: `backend/`.

| Endpoint | Purpose | Owner |
|---|---|---|
| `POST /api/classify` | Breed, confidence, band, alternatives, `looks_like_cattle`, model version | ours (`backend/classifier.py`) |
| `GET /api/classify/info` | Which model is loaded, its thresholds | ours |
| `POST /api/explain` | Grad-CAM heat-map for the predicted breed | ours |
| `POST /api/detect`, `/api/animals`, `/api/dashboard`, `/api/farmers`, `/api/alerts`, `/api/reports/csv`, `/api/analytics`, `/api/settings` | The team's earlier demo dashboard and YOLOv8 detection route | teammate (`backend/main.py`); not used by the web app |

The classify route **fails soft**: if no model is present the app still starts and reports it unavailable. Serving reuses the training code (`ml/training/inference.py`), so the photo is preprocessed exactly as it was in training.

**Database and security (optional, switched off):** `supabase/migrations/20261025000000_core.sql` defines tables, row-level security (each user sees only their own rows), a private photo bucket and a safe duplicate-lookup function. 22 tests (`supabase/tests/`) check the rules on a local stand-in; it has **not** been run against a live Supabase project.

---

## 12. Where everything is in the IDE

```
BreedVision-AI/
├─ README.md                      project summary and status
├─ web/                           FRONTEND (Next.js)
│   ├─ src/app/                   pages (identify, breeds, history, prices, model)
│   ├─ src/components/            UI components
│   ├─ src/lib/                   confidence, hashing, CSV, value guide
│   ├─ src/services/              API, on-device storage, cloud, breed data
│   ├─ src/i18n/                  5-language catalogues
│   └─ tests/                     web tests
├─ backend/                       BACKEND (FastAPI)
│   ├─ main.py                    app, routes (teammate's base + our routes)
│   ├─ classifier.py              our classify/explain service
│   └─ models/                    the trained model file + manifest
├─ ml/                            MACHINE LEARNING
│   ├─ dataset/                   audit, hashing, leak-free splitting
│   ├─ training/                  train, finetune, calibrate, export, ood, explain
│   ├─ scripts/                   dataset report, photos, demo kit, prices
│   ├─ synthetic/                 price anchors and the synthetic sales dataset
│   └─ tests/                     40 tests
├─ supabase/                      database schema + security tests (optional layer)
├─ docs/                          all write-ups (this document, results, runbook)
├─ tools/md2pdf.py                turns docs into PDFs
└─ frontend/                      teammate's earlier Vite prototype (not used)
```

Data and trained artefacts sit **outside** the repository in `C:\bv-data\` (raw images, splits, features, run records, checkpoints) because the repository lives in OneDrive and training files are large.

**Key documents:** `docs/project-presentation.md` (this), `docs/test-evaluation.md`, `docs/dataset-report.md`, `docs/model-baseline.md`, `docs/non-cattle-check.md`, `docs/explainability.md`, `docs/duplicate-detection.md`, `docs/price-reference.md`, `docs/breed-descriptions.md`, `docs/i18n.md`, `docs/supabase.md`, `docs/demo-runbook.md`, `docs/demo-script.md`.

---

## 13. The cattle value guide

A photo does not reveal age, yield or local demand, so this is a **guide, not a detector**:

```
typical value = breed's typical price
              + ₹4,000 × (daily milk yield − 6 litres)
              + ₹6,200 if pregnant
likely range  = the breed's listed price range, scaled the same way
```

| Input | Source |
|---|---|
| Breed price ranges (e.g. Gir and Sahiwal ₹50,000–₹1,50,000; Vechur ₹65,000–₹1,10,000) | One 2026 breed-guide table (Kamdhenu Gauveda, 3 Oct 2026) for **10 of the 49 breeds**; the other 39 use a general desi-cow range and the page says so |
| ₹4,000 per daily litre | **Our assumption** from one project report (about ₹4,400 per litre for a crossbred cow), rounded down |
| Pregnancy ≈ 1.5 litres' worth | The ratio in Kumar et al. (2014), Table 2; that paper's own 2010–11 rupee amounts are not used |

It is labelled "An indicative guide, not a quote". These are asking prices from a guide, not completed sales, it assumes a milch cow, and pedigree and region are not included. A synthetic sales dataset (414 invented sales anchored to the same ranges) exists in the repository for testing and is not shown in the app; it cannot validate the estimate. Details: `docs/price-reference.md`.

---

## 14. Scalability

**What is true today:** a single-machine prototype. Identification takes about 0.05 s per photo on a laptop CPU. **No load test has been run**, so we do not quote a throughput number.

**Why it can scale (design properties, not measured claims):**

| Dimension | How the design helps | What would still be needed |
|---|---|---|
| **More users** | The inference service is stateless and the model is a read-only 22 MB file, so copies can run side by side behind a load balancer; photos are processed in memory | Containerise, deploy, load-test, monitor |
| **More breeds** | The pipeline is config-driven and reproducible: add folders of photos, rerun split, train, calibrate, export; the interface reads the breed list from the model's class mapping | New labelled photos per breed; buffalo need an entirely new dataset |
| **Better accuracy** | Fine-tuning more blocks, more epochs, larger input or a newer backbone are one-line config changes | A GPU, and field photos |
| **More languages** | A new language is one catalogue file plus a test | Native-speaker review |
| **Phones and low connectivity** | Small model; records are already stored on the device with a sync state | Export to an on-device runtime (ONNX/TFLite), an installable offline app (PWA) |
| **Many users' data** | A Postgres schema with row-level security and private storage is written and security-tested | Run it against a live project, add moderation and consent flows |
| **Government integration** | Clean JSON API | Agreements and formats for any national database; none exists today |

---

## 15. Our USP: what makes this different

1. **It says "I'm not sure."** Calibrated confidence bands decide what the screen may claim: a breed name only when confidence is high, candidates when it is not, a request for a better photo when it is low. On the test set the named answers were right 90.1% of the time.
2. **It says "this is not cattle"** instead of naming a breed for a photograph of anything.
3. **It shows its evidence** with a heat-map, and says plainly what the heat-map does not show.
4. **The evaluation is leak-free and reported twice, honestly:** near-duplicate photos grouped so none cross splits (609 leaking pairs removed), a test set touched only for scoring, intervals instead of single numbers, and weak breeds named.
5. **It found and reports the dataset's own flaws:** 216 contradictory-label sets, a non-Indian breed, no buffalo.
6. **Runs anywhere, costs nothing:** a 22 MB model on a CPU, no GPU, no internet, no paid AI service; photos stay private.
7. **Built for Indian users:** five languages (Hindi, Marathi, Tamil, Telugu, English), rupee value guide with Indian digit grouping, optional GPS, local-first records.
8. **Every claim is traceable:** each breed description lists its sources, each limit is written down, and 112 automated tests guard the behaviour.

---

## 16. Research and references

### Studied and used directly
- **Kumar, Nisha, Kumar & Kumar (2014).** "Development of valuation index for dairy cattle and buffalo in Tamil Nadu." *Indian Journal of Animal Sciences* 84(11). We used the *ratio* of its significant milk-yield and pregnancy effects (Table 2, overall dairy-cow model). Its own rupee amounts (2010–11, Tamil Nadu, no indigenous breeds of the kind identified here) are not used.
- **Breed information sources** (see `docs/breed-descriptions.md`): ICAR-NBAGR registered cattle breeds list (home tracts); TNAU Agritech Portal indigenous cattle breeds; ICAR journal papers on Nari, Dagri, Kosali, Purnea and Poda Thurpu cattle; Odisha Livestock Resources Development Society breed pages; Wikipedia breed pages.
- **Price source:** *Desi Cow Milk Per Day: 13 Indian Breeds Compared (2026)*, Kamdhenu Gauveda Team, 3 Oct 2026.

### Methods we implemented from the literature
(Cited so the methods can be checked; we implemented them from the published descriptions and did not re-derive them.)
- Tan & Le (2019). *EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks.* ICML.
- Guo, Pleiss, Sun & Weinberger (2017). *On Calibration of Modern Neural Networks.* ICML. (temperature scaling)
- Selvaraju et al. (2017). *Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization.* ICCV.
- Lee, Lee, Lee & Shin (2018). *A Simple Unified Framework for Detecting Out-of-Distribution Samples and Adversarial Attacks.* NeurIPS. (Mahalanobis distance check)
- Transfer learning from ImageNet; perceptual hashing for near-duplicate detection.

### Data
- Kaggle `atharvadarpude/indian-cattle-image-dataset`.

### Tools
Python, PyTorch, `timm`, scikit-learn, FastAPI, Next.js, React, TypeScript, Tailwind CSS, IndexedDB, Supabase (optional).

---

## 17. Limitations and roadmap

**Known limitations (all stated in the app or docs):**
- Not tested on real field photos; expect lower accuracy there.
- 49 cattle breeds only; no buffalo; no individual-animal identification.
- 62% top-1 is a research-grade result, not a production one; the design (confidence bands, top-3) is what makes it usable.
- The value guide is indicative, from one guide for 10 of 49 breeds.
- Translations are AI-written and need native-speaker review.
- Accounts and cloud backup are built but untested against a live database and switched off.
- Not load-tested; no mobile app or offline-install yet.

**Next steps, in priority order:**
1. Collect and test on real field photographs; retrain with them.
2. Native-speaker review of the four translations and the breed text.
3. Fine-tune more of the network on a GPU; try a larger input and a newer backbone.
4. Add buffalo with a new labelled dataset.
5. Offline-installable app and a compressed on-device model.
6. Live pilot with a veterinary department; wire accounts and backup against a real project.
7. Real sale-price collection to replace the indicative value guide with a measured one.
8. Integration with national livestock databases, once formats and permissions exist.

---

## 18. Appendix

### A. The 49 breeds the model identifies
Amritmahal, Bachaur, Badri, Bargur, Bhelai (Belahi), Dagri, Dangi, Deoni, Gangatari, Gaolao, Ghumsari, Gir, Hallikar, Hariana, Himachali Pahari, Kangayam, Kankrej, Kenkatha, Kherigarh, Khariar, Khillari, Konkan Kapila, Kosali, Krishna Valley, Ladakhi, Lakhimi, Malnad Gidda, Malvi, Mewati, Motu, Nagori, Nari, Nimari, Ongole, Poda Thirupu, Ponwar, Pulikulam, Punganur, Purnea, Rathi, Red Kandhari, Red Sindhi, Sahiwal, Shweta Kapila, Siri, Tharparkar, Thutho, Umblachery, Vechur.

### B. How to run it
```
Backend:  cd backend
          C:\bv-data\venv\Scripts\python -m uvicorn main:app --port 8000
Web app:  cd web
          npm run dev           (then open http://localhost:3000)
Needs web/.env.local:  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
                       NEXT_PUBLIC_USE_MOCKS=false
Tests:    cd web && npm test              (50)
          python -m pytest ml/tests       (40)
          cd supabase/tests && npm test   (22)
```
Full steps and a troubleshooting table: `docs/demo-runbook.md`.

### C. Glossary
- **Top-1 / top-3 accuracy:** how often the right breed is the first / among the first three suggestions.
- **Confidence (calibrated):** the model's probability, adjusted so that "90%" means right about 90% of the time.
- **Macro-F1:** a score that weights every breed equally, so small breeds count as much as large ones.
- **Fine-tuning:** continuing to train part of a pretrained network on our own photos.
- **Leakage:** when near-identical photos appear in both training and test data, which inflates scores.
- **Grad-CAM heat-map:** a picture of which parts of the photo pushed the model's decision.
- **Local-first:** data is kept on the user's device and works without a server.

### D. Contributors
From the repository history: Subhronil Chattoraj; Harshit Neeraj Lahari / Harshit112006 (as the names appear in commits). The base FastAPI file and an earlier React (Vite) prototype in `frontend/` predate the work described here. Built with AI assistance (Claude) for engineering, evaluation and documentation; all numbers in this document were produced by running the code and are traceable to the files listed.
