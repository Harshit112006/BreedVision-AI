# `POST /api/classify` — breed classification

Added to the existing FastAPI service in `backend/`. Verified working end to
end against the trained checkpoint.

---

## Why a second endpoint rather than changing `/api/detect`

They answer different questions and use different models:

| | `/api/detect` | `/api/classify` |
|---|---|---|
| Question | *Where is the animal?* | *What breed is it?* |
| Model | YOLO (ultralytics) | EfficientNet-B0 + trained linear head |
| Returns | bounding boxes, annotated image | breed, confidence, alternatives |
| Breed capability | none without a custom `breedvision.pt` | 49 Indian cattle breeds |

`/api/detect` is untouched. A YOLO breed model **cannot** be trained from this
dataset — it is a classification set with no bounding-box annotations — so the
classifier is not a drop-in replacement for the missing `breedvision.pt`.

The two compose naturally later: detect to crop, then classify the crop. That
is worth measuring before adopting, not assuming.

---

## Design decisions

**It reuses `ml/training/inference.py`.** The endpoint does not reimplement
resize/crop/normalise. Duplicating them would let the serving transform drift
from the training transform — a bug that silently degrades accuracy instead of
raising an error. One code path, one source of truth.

**It fails soft.** `backend/classifier.py` catches every failure at load time.
If torch is missing or no checkpoint is configured, the app still starts, the
YOLO path still works, and only `/api/classify` reports 503 with a message
saying exactly what to fix.

**The model loads once, at startup** — never per request.

**A hedged prediction is not written as a fact.** This is the important one:

| Table | What gets written |
|---|---|
| `detections` | always the predicted breed and its confidence — an audit log of what the model said |
| `animals` | the breed **only when the model is confident**; otherwise `Unknown` |

Below the threshold the endpoint also raises a `LOW CONFIDENCE` alert. A record
list is exactly where a maybe quietly becomes a fact nobody questions later.

---

## Configuration

All optional. The first match wins.

| Variable | Meaning |
|---|---|
| `BREEDVISION_CHECKPOINT` | full path to a `.pt` checkpoint or bundle |
| `BREEDVISION_RUNS_DIR` | directory to search (default `C:/bv-data/runs`) |
| `BREEDVISION_RUN` | run id to prefer inside that directory |

If none is set, the loader looks for
`backend/models/breedvision_classifier.pt` first — so a deployment is
self-contained and offline-capable with no environment variables at all.

### Offline deployment — solved

Two checkpoint kinds are supported, and the loader prefers whichever it finds:

| Kind | Size | Network at load |
|---|---|---|
| Training checkpoint (`C:/bv-data/runs/*.pt`) | ~265 KB | **yes** — `timm` fetches the backbone |
| Deployment bundle (`backend/models/breedvision_classifier.pt`) | 15.8 MB | **no** |

The training checkpoints are small because they store only the trained head;
the frozen backbone is byte-identical to the public ImageNet weights, so there
is no reason to duplicate it during experimentation. That is the wrong trade for
a server, where it turns first start into a network dependency.

`ml/training/export.py` produces the bundle — backbone weights, head weights,
feature statistics, class mapping and preprocessing config in one file. The
loader then constructs the architecture with `pretrained=False` and loads those
weights, so nothing is downloaded.

```bash
python ml/training/export.py --run phase2-frozen-baseline__efficientnet_b0
```

**Verified**, not assumed: re-run with `HF_HOME` pointed at an empty directory
and `HF_HUB_OFFLINE=1` / `TRANSFORMERS_OFFLINE=1`, the service loads and returns
an identical prediction (Amritmahal, 0.4048, same alternatives).

Build once with network; deploy without. The bundle is gitignored as a build
artifact, but its manifest (`breedvision_classifier.json` — sha256, backbone,
class count, validation metrics) is committed so a deployed file can be traced
back to the run that produced it.

> **`/api/detect` still needs network on first start.** `backend/models/`
> contains no `yolov8n.pt`, so `ultralytics` downloads it. That path is
> unchanged by this work and would need the same treatment (vendor the weights)
> to run fully offline.

---

## Requests

### `GET /api/classify/info`

```json
{
  "available": true,
  "source": "phase2-frozen-baseline__efficientnet_b0.pt",
  "model_version": "phase2-frozen-baseline__efficientnet_b0",
  "num_classes": 49,
  "task": "breed classification (49 Indian cattle breeds)",
  "thresholds": { "confident": 0.7, "uncertain": 0.4, "provisional": true }
}
```

`GET /api/health` carries the same block under `classifier`.

### `POST /api/classify`

Multipart form upload, field name `file`. Optional `top_k` (default 5, capped
at 10).

Measured response for a real image from the held-out test split
(true breed **Amritmahal**):

```json
{
  "animal_id": "IND8AF18F91",
  "breed_id": "amritmahal",
  "breed_label": "Amritmahal",
  "breed_name": "Amritmahal",
  "confidence": 0.4048,
  "band": "uncertain",
  "is_confident": false,
  "alternatives": [
    { "breed_id": "hallikar",  "breed_name": "Hallikar",  "probability": 0.1011 },
    { "breed_id": "kangayam",  "breed_name": "Kangayam",  "probability": 0.0898 },
    { "breed_id": "nagori",    "breed_name": "Nagori",    "probability": 0.0733 },
    { "breed_id": "pulikulam", "breed_name": "Pulikulam", "probability": 0.0723 }
  ],
  "model_version": "phase2-frozen-baseline__efficientnet_b0",
  "inference_ms": 121.8,
  "num_classes": 49,
  "thresholds": { "confident": 0.7, "uncertain": 0.4, "provisional": true }
}
```

That example is worth reading closely. The prediction is **correct**, and the
runners-up are all South Indian draught breeds, so the confusions are
anatomically sensible. But at 40.5% the band is `uncertain`, `is_confident` is
false, and the animal record is stored as `Unknown`.

`thresholds.provisional` is `true` in **every** response. The cut-offs are
placeholders; Phase 5 derives the real operating point from validation data.
Shipping the flag means no consumer can mistake them for validated figures.

### Errors

| Status | When | Message |
|---|---|---|
| 400 | not an image | `Please upload an image file.` |
| 400 | undecodable | `That image could not be opened. It may be damaged.` |
| 413 | over 10 MB | `Image is larger than 10 MB.` |
| 503 | no model loaded | reports exactly what to configure |

---

## Verified

Run against the real checkpoint with `fastapi.testclient`:

| Check | Result |
|---|---|
| Classifier loads at startup | 49 classes, `efficientnet_b0` |
| `/api/classify/info` | reports available |
| `/api/health` | includes the `classifier` block |
| Real test image | Amritmahal, 40.5%, band `uncertain` |
| Alternatives | Hallikar / Kangayam / Nagori / Pulikulam |
| Wrong content type | 400 |
| Corrupt JPEG | 400 |
| Oversized upload | 413 |
| `detections` row written | breed `Amritmahal`, 40.5 |
| `animals` row written | breed **`Unknown`** — not confident |

---

## Frontend

`web/src/services/predictions.ts` now posts to `/api/classify` and maps the
snake_case response into the camelCase domain type. The adaptation lives in the
client so the backend stays internally consistent.

Switch over with:

```bash
NEXT_PUBLIC_USE_MOCKS=false
```

CORS on the backend now allows `localhost:3000` alongside Vite's `5173`.

The breed **list** was also decoupled from the API: it is generated from the
model's class mapping, so fetching it from a server would risk advertising
breeds the model cannot predict, and would break the library offline for no
benefit.

---

## Not done

- **`/api/detect` is still network-dependent on first start** and still cannot
  name breeds.
- **Not wired into `frontend/`** (the Vite app). Only `web/` calls it.
- **No detect-then-classify pipeline.** Cropping to the animal before
  classifying may help; it needs measuring first.
- **Thresholds remain provisional.**
- **No authentication.** The endpoint is open, like the rest of the API.
