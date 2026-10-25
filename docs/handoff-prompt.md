> **Status (26 Oct 2026):** steps 1-5 below were completed in a later session (real-model demo, fine-tuned model deployed and tested, stale text fixed, non-cattle check, Model facts page, CSV export, runbook and demo script). Still open: translating Prices/Account, opening the PR, native review of translations.

You are taking over a nearly finished university project. I must demo it to my professor TOMORROW (26 Oct 2026), so prioritise a working, honest demo over new features. Work directly in the repo and verify everything by running it.

PROJECT
BreedVision (display name; the "AI" was dropped on purpose). Image-based breed identification for Indian CATTLE, built for Smart India Hackathon SIH25004. 49 cattle breeds, about 7,800 images. There are NO buffalo in the dataset. Do not claim buffalo, Bharat Pashudhan integration, offline AI, rupee price prediction, or YOLO breed detection (it is a classifier; the dataset has no bounding boxes). Never invent metrics. Say what is implemented versus planned.

REPO AND ENVIRONMENT
- Repo: C:\Users\Neil\OneDrive\Desktop\BreedVision-AI, branch feat/ml-pipeline-and-nextjs-frontend, last pushed commit 0c6c84b. Windows 11, no GPU (CPU only), 12 threads.
- Python venv: C:/bv-data/venv/Scripts/python. Data and artefacts live OUTSIDE the repo in C:/bv-data (raw images, metadata/splits.parquet, features, runs).
- ml/: data pipeline and training (ml/training/*.py: train, evaluate, calibrate, export, inference, explain, finetune, test_eval). ml/config.yaml and ml/training/config.yaml.
- backend/: FastAPI. main.py is a TEAMMATE'S file (keep edits minimal); classifier.py is ours and serves POST /api/classify, /api/classify/info, /api/explain. Deployed model bundle: backend/models/breedvision_classifier.pt (15.8 MB, gitignored) with committed manifest breedvision_classifier.json.
- web/: Next.js 16.3.1, React 19, TypeScript, Tailwind v4. IMPORTANT: web/AGENTS.md says this Next version has breaking changes; read node_modules/next/dist/docs before using unfamiliar APIs. Local-first IndexedDB (database name "breedvision"; do not rename or saved records are orphaned). Service layer in web/src/services switches between mock and real API with NEXT_PUBLIC_USE_MOCKS.
- supabase/: migration and RLS tests (tested on PGlite only, NOT against a live project).
- docs/: all write-ups. tools/md2pdf.py turns docs into PDFs in build/ (gitignored).
- Tooling quirk: shell heredocs containing certain characters failed in my environment; write files with the file-write tool or a script file instead of long inline heredocs. Commit messages end with: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com> (or your own model line).

CURRENT MODEL FACTS (all verified by running)
- Deployed model: EfficientNet-B0 (timm efficientnet_b0.ra_in1k), frozen backbone plus linear head, temperature scaling T=1.04, thresholds confident>=0.85, low<0.30 (derived on validation, 5-fold cross-fitted).
- Validation: top-1 63.6%, macro-F1 0.605, top-3 82.8%.
- FINAL TEST SPLIT, evaluated once (1,114 images): top-1 59.3% (95% CI 56.2-62.0), top-3 81.6%, top-5 90.0%, macro-F1 0.556, ECE 0.048. Confident band: 20% of images, 89.7% accurate (target was 90%). Uncertain band 65%, 57.4% accurate. Low band 15%, 25.8% accurate. Weakest breeds: dagri, gangatari, gaolao, Krishna Valley, kherigarh. Written up in docs/test-evaluation.md; raw output docs/examples/test-eval-efficientnet_b0.json. ml/training/test_eval.py refuses to run twice (use --allow-rerun only to reproduce).
- FINE-TUNED model just finished training (ml/training/finetune.py, last 3 blocks unfrozen, augmentation, BatchNorm kept in eval mode, selected on VALIDATION only): best epoch 5, val top-1 66.1%, macro-F1 0.638, top-3 84.9% (versus 63.6 / 0.605 / 82.8). Checkpoint: C:/bv-data/runs/phase2-frozen-baseline__efficientnet_b0_ft.pt (contains backbone_state_dict, head with standardisation folded in, feature_mean=0, feature_std=1) plus its .json record. Log: C:/bv-data/finetune_b0.log. NOT yet integrated, calibrated, tested, or committed (finetune.py itself is uncommitted). The gain is modest, and selecting the best epoch on validation makes 66.1% slightly optimistic.

WHAT TO DO, IN THIS PRIORITY ORDER

1. REAL-MODEL DEMO (most important). Right now the website runs on MOCK predictions: it shows a "Demonstration data" banner and model version "not-deployed", because NEXT_PUBLIC_USE_MOCKS defaults to true. Fix: create web/.env.local (gitignored) with NEXT_PUBLIC_USE_MOCKS=false and NEXT_PUBLIC_API_BASE_URL=http://localhost:8000; start the backend (cd backend; use the venv python with uvicorn main:app; check backend/requirements.txt and that main.py starts, it may import ultralytics/YOLO; the classify routes must fail soft if not); start the web dev server (launch config named "web" in .claude/launch.json, port 3000). Upload real cattle photos and confirm: no demo banner, real breed names, model version shows the real run id, confidence bands behave, the heat-map ("Show where the model looked") works via /api/explain, duplicate-photo notice works, saving and History work. Check how the breeds list, records and other services behave with mocks off (breeds currently come from a generated file; make sure nothing breaks). Also write a one-page "how to start the demo" (docs/demo-runbook.md) with exact commands, plus a fallback plan if the backend fails (the site must still open).

2. FINE-TUNED MODEL: decide and integrate, honestly. Note that ml/training/calibrate.py and test_eval.py read CACHED FROZEN-BACKBONE FEATURES, which do not apply to a fine-tuned backbone; you must run images through the fine-tuned network to get validation and test logits. Steps: (a) update ml/training/export.py so a checkpoint containing backbone_state_dict is exported with those weights instead of re-fetching pretrained ones; (b) compute validation logits through the fine-tuned net, refit temperature and re-derive thresholds with the same cross-fitted method (confident target accuracy 90%, low-band rule top-3 >= 60%); (c) ONLY THEN score the fine-tuned model on the test split ONCE (this is a second look at the test set; the first was for the old model, so report both numbers and state this plainly; select nothing based on test); (d) if it is not clearly better, keep the old model and say so. Update backend/models manifest, web/src/lib/confidence.ts thresholds (a sync test in web/tests guards that they match the bundle manifest), and the docs. Do not quote the 66.1% validation number as the headline; the test number is the headline.

3. STALE TEXT TO FIX. web/src/lib/confidence.ts says thresholds are "not yet confirmed on the held-out test split" (THRESHOLD_BASIS and a header comment saying ~25% of photos are named; the measured test share is 20%). docs/explained.md, docs/explained-pitch.md, docs/problem-statement.md, docs/project-audit.md and build/PR_BODY.md do not cite the test results. Update them with the real numbers and the honest limits. Regenerate PDFs with tools/md2pdf.py.

4. FEATURES, ONLY IF TIME REMAINS (each small):
 a. Reject non-cattle photos: today the model names a breed for a dog or a car. Add a simple, honest out-of-distribution check (for example max-softmax/energy threshold fitted on validation, optionally plus a cheap check) and a clear "this does not look like cattle" result state, translated in all five languages. Measure it on a few non-cattle images and report what it catches and misses; do not over-claim.
 b. A "Model facts" page in the web app with the real numbers (49 breeds, split method, group-aware leakage fix, test accuracy with interval, the confidence-band table, limits).
 c. CSV export of saved records from the History page.
 d. Translate the remaining pages (Prices, Account, foundation) and service-layer error messages.

5. REHEARSAL KIT: pick about 6 test-split photos (3 confident, 2 uncertain, 1 failure) and one non-cattle photo, record the expected outputs, and write a short demo script with the likely professor questions and honest answers (docs/demo-script.md). Likely questions: why only 59% test accuracy (49 visually close breeds, small dataset, frozen backbone; the app names a breed only when confidence >= 0.85 and then it is about 90% accurate; top-3 is 82%); is it tested on real field photos (NO); is the value ranking a price (NO, it is a relative index from Kumar et al. 2014, milk yield and pregnancy only, plus a user sale log; demo prices are synthetic and labelled so).

6. HOUSEKEEPING: commit ml/training/finetune.py and any new work; push. The pull request has NOT been opened (gh CLI is not installed): the user must open https://github.com/Harshit112006/BreedVision-AI/pull/new/feat/ml-pipeline-and-nextjs-frontend manually.

KNOWN CAVEATS TO KEEP HONEST
- The i18n translations (Hindi, Marathi, Tamil, Telugu) were written by an AI and not reviewed by native speakers (docs/i18n.md).
- Supabase accounts, cloud backup and cross-account duplicate check are tested only on a local PGlite stand-in, never on a live project.
- The backend's old demo dashboard in the teammate's backend/main.py still contains buffalo demo rows.
- The user's PowerPoint deck still says "BreedVision AI"; the separate mnpr repo has a leaked API key that must be revoked by its owner.
- Duplicate check compares pictures, not animals, and misses crops and rotations.

VERIFICATION BEFORE ANY "DONE" CLAIM (run all; report real output, including failures)
- cd web: npx tsc --noEmit ; npx eslint src tests ; npm test (expect 32 passing, more if you add tests) ; npm run build
- C:/bv-data/venv/Scripts/python -m pytest ml/tests -q (expect 36 passing)
- supabase tests in supabase/tests (22) if you touch that area
- Manually exercise the demo path in a browser with the real backend, and test at phone width (375 px) with no horizontal overflow.

RULES
Work in small verified steps. Never fabricate metrics or claims. Do not touch the test split except as described in step 2. Do not rename the IndexedDB database, the repo, or the model filenames. Report plainly what is done, what failed and what is left.
