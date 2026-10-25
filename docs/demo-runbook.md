# Demo runbook

How to start BreedVision for a live demo on the real model, and what to do if
something breaks. Tested on the development machine on 26 Oct 2026.

## Start (three things, in this order)

**1. Backend** (serves the trained model on port 8000)

```
cd backend
C:\bv-data\venv\Scripts\python -m uvicorn main:app --port 8000
```

Wait for `[classifier] available=True ... breedvision_classifier.pt`. Check it:
open http://localhost:8000/api/classify/info. It should report
`"available": true` and model version `phase2-frozen-baseline__efficientnet_b0_ft`.

**2. Web app** (port 3000). The file `web/.env.local` must contain:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCKS=false
```

then:

```
cd web
npm run dev
```

Open http://localhost:3000. If a yellow "Demonstration data" banner appears,
`.env.local` is missing or the dev server was not restarted after creating it.

**3. Demo photos.** Seven real test-set photos plus two non-cattle pictures are
in `C:\bv-data\demo` (rebuild with `ml/scripts/make_demo_kit.py`). They are not
in the git repository because the cattle photos come from a third-party dataset.

## Quick health check (30 seconds before you present)

1. Home page loads, language picker works.
2. Identify page: upload `confident_right_2.jpg`. You should see **Purnea, Confident
   match, 96.9%**, model version ending `_ft`, no demo banner.
3. Press "Show where the model looked": a red/orange heat-map appears over the photo.
4. Save the record, open History, press Export CSV.

## If something breaks

| Symptom | Cause and fix |
|---|---|
| "Demonstration data" banner | `.env.local` missing or dev server not restarted. |
| Analysis fails with a network error | Backend not running or not on port 8000. Restart step 1. |
| "The breed model is not loaded" | `backend/models/breedvision_classifier.pt` missing. Restore from `C:\bv-data\backup\frozen_bundle.pt` (older model) or re-run `ml/training/export.py --run phase2-frozen-baseline__efficientnet_b0_ft`. |
| `npm run dev` crashes with "Cannot find module" | OneDrive removed files from `node_modules`. In `web`, run `npm install`. |
| Port 3000 or 8000 busy | An old process is still running; end it or use another port (and set `NEXT_PUBLIC_API_BASE_URL`). |
| Everything is broken | Switch `NEXT_PUBLIC_USE_MOCKS=true`, restart the web app, and say plainly that this is the interface on labelled demonstration data. Do not present mock output as real. |

## Notes

- The repository sits inside OneDrive, which can lock or remove files while
  syncing. For the demo, pause OneDrive sync or copy the folder to `C:\demo`.
- The first request after starting the backend is slower while the model warms up.
- Identification runs entirely on the laptop and needs no internet. The web app
  downloads its fonts from Google when it first builds, so start it once with
  internet access before you present; do not rely on starting it cold offline.
