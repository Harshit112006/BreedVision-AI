# BreedVision — Explained

From plain English to full technical detail.

**Every number in this document is measured.** Nothing is estimated, and
nothing describes a feature that has not been built. Where something is planned
rather than working, it says so explicitly.

---

## ⚠️ Read this first: what actually works today

The single most important thing to understand — and the thing most likely to
trip you up in a viva — is that **the website and the AI model are not yet
connected to each other.** Both exist. Both work. They do not talk.

| Part | State |
|---|---|
| Trained breed model (49 breeds) | **Works.** Runs from the command line |
| Website (upload, results, history, breed library) | **Works.** Runs in a browser |
| The website calling the real model | **Not built.** The website currently shows placeholder predictions |
| Backend API (FastAPI) | **Exists on `main`** — 15 endpoints, but see below |
| Backend breed prediction | **Not working.** It expects a YOLO model file that does not exist |
| Database | **SQLite, exists** (not PostgreSQL) |
| Login / user accounts | **Not built** |
| Cloud image storage | **Not built** |
| GPS / location capture | **Not built** |
| Animal detection (drawing a box around the cow) | **Not built** |
| Explainability (heat-maps showing where the model looked) | **Not built** |
| Buffalo identification | **Not possible** — the dataset contains no buffalo |

If someone asks *"can I use it right now?"*, the honest answer is: you can use
the website, and you can run the breed model from the command line — but they
are not wired together.

### The two halves, and why they do not yet meet

The repository contains work from two directions that have not converged:

| | Built here | Built on `main` by a teammate |
|---|---|---|
| Frontend | `web/` — Next.js + TypeScript | `frontend/` — Vite + React (JSX) |
| Backend | none | `backend/main.py` — FastAPI + SQLite, 15 endpoints |
| Model | trained **classifier**, 49 breeds, measured | none — a placeholder file marks where YOLO weights should go |

The backend is genuine working code, but its `/api/detect` route is built around
**object detection** (YOLO / ultralytics): it draws boxes around animals. It
reads breed from the detector's own class names, so without a custom
`breedvision.pt` it returns `breed: None` and can only say "cow".

The breed classifier trained in this project is a **classification** model, not
a detector, so it is not a drop-in replacement for that file. Bridging the two
is a design decision, not a copy-paste — see "What's missing" at the end.

---

# BreedVision — What Is This Project?

## What it is

BreedVision is a system that looks at a photograph of a cow and tries to
work out which **breed** it is.

You give it a picture. It gives you back a breed name, plus a number saying how
sure it is, plus a few other breeds it thinks are possible.

That's it. That's the whole idea.

## What problem it solves

In India, identifying a cow's breed is normally done by eye, by a person, in a
field. That works — but it has three practical problems:

1. **It depends on who is looking.** An experienced officer and a new one can
   look at the same animal and disagree.
2. **The expertise isn't always where the animal is.** The people best able to
   identify a breed are not always the people standing in front of the cow.
3. **It's hard to keep consistent records.** If different districts identify
   breeds slightly differently, the combined data is hard to trust or compare.

Breed matters practically: it affects breeding decisions, livestock records,
and eligibility for various schemes. So a consistent second opinion is useful.

## Why the project was created

It was built as a Smart India Hackathon–style project: take a task currently
done by eye and judgement, and see whether a camera and a trained model can
provide a consistent, repeatable assistant for it.

The word **assistant** is doing real work in that sentence. This is not
intended to replace a qualified assessor, and — as you'll see from the accuracy
numbers later — it currently could not.

## Who would use it

- **Farmers and field workers** — the main users. They need it simple: point,
  shoot, get an answer. Minimal typing, big buttons, works one-handed on a
  phone.
- **Veterinarians, agricultural officers, cooperative staff** — they need more:
  the confidence score, the alternative breeds, a history of past
  identifications, and enough information to apply their own judgement.
- **Administrators** — would want aggregate statistics. *(Planned, not built.)*

## What a normal user does

1. Opens the app.
2. Takes a photo of the animal, or picks one from the phone.
3. Checks the preview looks right.
4. Presses **Analyse breed**.
5. Waits a moment.
6. Reads the result.
7. Optionally saves it as a record.

That's the entire journey. Everything else in the product supports those seven
steps.

## What happens after the image is uploaded

Here is the honest version, in plain language.

**What happens today, in the website:**

1. The browser checks the file really is an image (JPG, PNG or WEBP) and isn't
   too big (12 MB limit).
2. The browser opens the image to confirm it isn't damaged.
3. The browser **shrinks it** — large phone photos are reduced so the longest
   side is 1280 pixels. This is real and measurable: a test image went from
   1800×1350 and 33 KB down to 1280×960 and 17 KB. This matters because field
   users are on slow rural connections.
4. The shrunk image is sent to the prediction service.
5. A result comes back and is displayed.
6. If the user presses **Save record**, the image and result are stored on the
   device.

Steps 1, 2, 3 and 6 are **fully real**. Step 4 currently goes to a placeholder
that invents a plausible-looking result instead of the trained model.

**What happens when the trained model is run (from the command line):**

1. The image is opened and converted to standard RGB colour.
2. It is resized and cropped to 224×224 pixels.
3. Its pixel values are normalised — adjusted to the numeric range the model
   expects.
4. The model turns the image into a list of 1,280 numbers describing its
   visual content.
5. A final layer converts those numbers into 49 scores, one per breed.
6. Those scores are turned into percentages that add up to 100%.
7. The highest one is the prediction.

Connecting these two halves is the next phase of work.

## How the system identifies the breed

The model was shown thousands of photographs of Indian cattle, each already
labelled with its correct breed. Over many passes, it adjusted itself so that
its guesses matched the labels more often.

It is **not** matching your photo against a database of stored pictures. It
does not keep the training images. What it keeps is a set of learned numerical
patterns — things like typical body shape, hump profile, horn curvature, coat
colouring and proportion — that tend to distinguish one breed from another.

When you give it a new photo, it measures those same kinds of patterns in your
image and reports which breed those measurements most resemble.

## What the AI is actually doing behind the scenes

Concretely, and without hand-waving:

The model is **EfficientNet-B0**, a convolutional neural network originally
trained on ImageNet — a large general photo collection of about a thousand
everyday categories (animals, vehicles, objects). From that, it already learned
generic visual skills: detecting edges, textures, shapes, and parts of objects.

For BreedVision, that general-purpose part is **frozen** — left exactly as it
was, not retrained. It is used purely as a "visual description machine": feed
it a picture, get back 1,280 numbers summarising what's in it.

Only a small final layer was trained on the cattle images. That layer learned
how to map those 1,280 numbers onto the 49 breeds.

This approach is called **transfer learning**, and it's a deliberate,
conventional choice rather than a shortcut — though there's an important
limitation to it, covered in the "why it makes mistakes" section.

## What the result means

You get:

- **A breed name** — the model's single best guess.
- **A confidence score**, e.g. 91.4% — how strongly the model favours that
  guess over the alternatives.
- **Alternative breeds** with their own percentages.

The confidence score is the part people most often misread, so be precise about
it: **it is the model's own degree of preference, not a probability of being
correct.** A model can be confidently wrong. Treat 91% as "the model isn't
torn between options", not "there is a 91% chance this is a Gir".

## What happens when the AI is uncertain

This is the part the project takes most seriously.

A naive system would always print its top guess, no matter how weak. That
trains users to trust it, and then it fails silently.

BreedVision instead sorts every result into one of three bands:

| Band | What the interface says | Does it name a breed? |
|---|---|---|
| **Confident** | The breed name, large | Yes |
| **Uncertain** | "This animal could not be matched to one breed" | **No** |
| **Could not identify** | "The breed could not be determined" | **No** |

In the uncertain case, the model still *has* a top guess — but the interface
deliberately refuses to present it as the answer. It demotes it into a list of
candidates labelled "none is confirmed". In the lowest band, it shows no
candidates at all, just advice on taking a better photo.

This is a designed refusal to overclaim, and it is enforced in code, not left
to whoever builds a screen later.

> **How the cut-offs were chosen:** they were measured, not guessed. On
> validation data the model is confident at 85% and above, and gives up below
> 30%. At 85%, a named breed is right about 90% of the time, but that happens for
> a quarter of photos. The 90% target is a policy choice: a lower
> target names more breeds and is wrong more often. The cut-offs were chosen on
> validation data and then confirmed once on the held-out test set, where the
> model names a breed for 24% of photos and is right 90% of the time when it does.

## What information the user receives

- The photo they submitted
- The predicted breed (or the honest "uncertain" message)
- A confidence score, shown three ways at once: as a written label, a segmented
  bar, and a number — so it never depends on being able to distinguish colours
- Up to five alternative breeds with percentages
- Date and time
- Which model version produced it
- How long the analysis took
- A link to that breed's page in the library

## Why it's useful in the real world

Because it's **consistent**. The same photo gets the same answer every time,
regardless of who is holding the phone or how tired they are.

It doesn't need to be better than an expert to be useful. It needs to be a
reliable second opinion that flags its own uncertainty — which is exactly what
it's built to do.

---

# 0.1 Explain It Like I'm A Beginner

**Input → Processing → AI → Prediction → Output**

**Input.** The user gives the system a photograph of a cow, taken with a phone
camera or chosen from their gallery.

**Processing.** The system checks the file is a valid image of an acceptable
type and size, then shrinks and reformats it into exactly the shape the AI
expects: a 224×224 pixel RGB square with adjusted brightness values.

**AI.** The prepared image goes into a neural network that has already learned,
from thousands of labelled cattle photographs, which visual patterns tend to go
with which breed.

**Prediction.** The network outputs 49 numbers — one per breed — which are
converted into percentages that add up to 100%.

**Output.** The app shows the highest-scoring breed and its percentage, plus
the runners-up. If no breed scores highly enough, it says it is unsure instead
of guessing.

---

# 0.2 An Everyday Analogy

Imagine a student who has never seen a cow.

You show them 5,570 photographs, each labelled with its breed. At first they
guess randomly. Over time they start noticing things: *this breed usually has a
pronounced hump; that one has lyre-shaped horns; this one is reddish-brown with
a particular face shape.* Nobody tells them which features to look for — they
work it out from repeated exposure.

Eventually you show them a photo they've never seen, with the label hidden.
They say "that looks like a Gir, though it could be a Sahiwal." That's what
BreedVision does.

Now the important refinements, so the analogy doesn't mislead:

**What the model "learns"** — not facts about cattle. It has no concept of an
animal, a farm, or a breed. It learns numerical patterns in pixel arrangements
that happen to correlate with the labels it was given.

**Training** — the process of repeatedly showing labelled examples and nudging
the model's internal numbers whenever it gets one wrong. Done once, in advance.
Roughly four minutes of computation for this model.

**Inference** — using the finished model on a new photo. Fast: about 22
milliseconds per image on this laptop's processor.

**Confidence** — how strongly the model favours its top answer. If one breed
scores 91% and the rest are near zero, it isn't torn. If the top three are 35%,
30% and 25%, it effectively is.

**Why it still makes mistakes:**

- Its training photos were a limited, imperfect sample of the world
- Some of those photos were **wrongly labelled** — provably so (see below)
- Many were low-resolution, so fine detail was never available to learn from
- Breeds that genuinely look alike are genuinely hard
- A photo unlike anything in training — odd angle, bad light, half the animal —
  produces an unreliable answer

Extending the analogy: our student studied from a textbook where some pictures
had the wrong captions, many were blurry, and some breeds had far fewer pages
than others. They'd still learn a lot. They'd also have specific, predictable
blind spots.

---

# 0.3 The Complete User Journey

Following one photo from start to finish. **[REAL]** means working today;
**[PLACEHOLDER]** and **[PLANNED]** mean what they say.

### 1. User opens BreedVision **[REAL]**
*Sees:* A landing page explaining the product, with "Identify an animal" as the
obvious main action.
*Behind the scenes:* A Next.js web application serving pre-rendered pages.

### 2. User uploads an image **[REAL]**
*Sees:* A large drop area with "Take photo" and "Upload image" buttons, plus
short guidance — show most of the animal, photograph from the side, use
daylight, keep it unobstructed.
*Behind the scenes:* On a phone, "Take photo" opens the rear camera directly.
Drag-and-drop also works on desktop.

### 3. The application checks the image **[REAL]**
*Sees:* Either a preview, or a specific error.
*Behind the scenes:* Three checks — file type must be JPG/PNG/WEBP, size must
be under 12 MB, and the image must actually open. Each failure gives a
different, actionable message. Not "Something went wrong", but:

> "That photo is 13.0 MB. Choose one under 12 MB."
> "That image could not be opened. It may be damaged — try another photo."

### 4. The image is prepared **[REAL]**
*Sees:* Briefly, "Preparing image — resizing the photo for upload", and
afterwards a note like "1280 × 960 · 17 KB · reduced from 33 KB".
*Behind the scenes:* The image is drawn onto a canvas at reduced size and
re-encoded as JPEG at 85% quality. Images already small enough are left
untouched rather than needlessly re-compressed.

### 5. The AI model analyses the image **[PLACEHOLDER in the app] / [REAL from the command line]**
*Sees:* "Analysing image — comparing the animal against known breeds", with a
spinner.
*Behind the scenes, in the app today:* a placeholder service produces a
plausible result. **It is not the trained model.** A visible orange banner on
the result says "Demonstration data".
*Behind the scenes, when the real model runs:* the pipeline described earlier —
RGB conversion, resize to 224×224, normalisation, EfficientNet-B0 producing
1,280 numbers, a linear layer producing 49 scores.

Note the spinner has **no percentage bar**. The system cannot know how far
along the analysis is, so it doesn't pretend to.

### 6. The model produces predictions **[REAL, standalone]**
*Behind the scenes:* 49 raw scores become percentages summing to 100% via a
softmax function.

A genuine example, from a real test image:

```
True breed: Amritmahal
  Amritmahal  40.5%
  Hallikar    10.1%
  Kangayam     9.0%
  nagori       7.3%
  Pulikulam    7.2%
```

Correct — and note the runners-up are all South Indian draught breeds, so its
confusions are anatomically sensible rather than random.

### 7. The system decides what to display **[REAL]**
*Behind the scenes:* The confidence is sorted into confident / uncertain /
could-not-identify, and that band decides what the screen is allowed to assert.

Note that the 40.5% above would land in **uncertain** — so the app would
*decline* to name Amritmahal even though it was right. That's the honest
behaviour. Under the measured cut-offs a result needs 85% to name a breed, and
this one scored about 40%, so it is correctly treated as uncertain.

### 8. The confidence score is shown **[REAL]**
*Sees:* A written status ("Confident match"), a ten-segment bar, and the number
— three independent signals, so it's readable without relying on colour.

### 9. The result is displayed **[REAL]**
*Sees:* Their photo, the breed (or honest uncertainty message), the confidence,
the alternatives, date and time, model version, analysis time, and buttons to
save, identify another, or view the breed.

### 10. The record is stored **[REAL, on-device only]**
*Sees:* "Saved on this device."
*Behind the scenes:* Stored in IndexedDB, a database built into the browser.
The photo is kept as a real image file, not text.

**Important:** nothing is uploaded anywhere. There is no server and no account.
Clearing browser data deletes the records. The interface says this plainly.
Each record already carries a `syncState` field of `local-only`, ready for the
day a server exists.

**Not in this journey, because they don't exist:** logging in, GPS capture,
a box drawn around the animal, a heat-map of where the model looked, an admin
dashboard.

---

# 0.4 From Simple To Technical

## Level 1 — What does it do?

Give it a cow photo, it tells you the likely breed and how sure it is.

## Level 2 — How does an AI recognise a breed from an image?

A digital photo is a grid of numbers — brightness values for red, green and
blue at every pixel. A **neural network** is a long chain of mathematical
operations applied to that grid.

Early stages detect very simple things: edges, corners, colour changes. Later
stages combine those into textures and shapes. Later still, into recognisable
parts — a leg, a horn, a hump. The final stage combines everything into a
verdict.

Nobody programs those stages by hand. During **training**, the network makes a
guess, is told the right answer, and adjusts itself slightly. Repeat this
across thousands of images many times over, and the useful patterns emerge on
their own.

The specific type used here is a **convolutional neural network** (CNN),
designed for images: it looks for patterns in small patches and slides that
search across the whole picture, so a cow is recognisable wherever it appears
in frame.

## Level 3 — How do the parts communicate?

Here is the honest architecture. Solid lines exist; dashed lines don't yet.

```
┌──────────────────────────────────────────┐
│  BROWSER  (Next.js 16 · React 19 · TS)   │
│                                          │
│  Landing · Identify · Breeds · History   │
│                │                         │
│      Image validation + downscaling      │  ← REAL
│                │                         │
│         Service layer (typed)            │
│         ├── mock predictor ──────────────┼─→ REAL, in use today
│         └── real API client ─ ─ ─ ─ ─ ─ ─┼─→ WRITTEN, nothing to call
│                │                         │
│         IndexedDB (records + photos)     │  ← REAL, device-only
└──────────────────────────────────────────┘
                 ╎
                 ╎  ← THE MISSING LINK
                 ▼
┌──────────────────────────────────────────┐
│  FastAPI + SQLite  (backend/main.py)     │  ← EXISTS on main,
│  15 endpoints · /api/detect uses YOLO    │    but has no breed
│  breed = None without breedvision.pt     │    model to load
└──────────────────────────────────────────┘
                 ╎
                 ▼
┌──────────────────────────────────────────┐
│  ML  (Python · PyTorch · timm)           │
│  EfficientNet-B0 + trained linear head   │  ← REAL, CLI only
│  49 breeds                               │
└──────────────────────────────────────────┘

┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
   Object storage · Auth · PostgreSQL
   NOT BUILT  (backend uses local SQLite)
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

The frontend was deliberately built so that swapping the placeholder for the
real backend is a **configuration change**, not a rewrite. Every screen calls
typed service functions — `predictBreed(file)`, `getBreeds()`, `getBreed(id)` —
and each function already contains both implementations. Setting
`NEXT_PUBLIC_USE_MOCKS=false` switches them over. The real client already
handles HTTP error codes for oversized and unsupported files.

## Level 4 — How was the model trained and evaluated?

**The data.** A public Kaggle dataset of Indian cattle images: 8,539 files,
2.48 GB, arranged in 50 folders named after breeds.

**Inspecting it before trusting it.** Every image was opened and validated. The
findings mattered:

| Finding | Measured |
|---|---|
| Files / valid images | 8,539 / 8,515 |
| Corrupt | 0 |
| Too small to use | 24 |
| Median short edge | **197 pixels** |
| Images below 224 px on the short edge | **60%** |
| Class sizes | 83 (Nimari) to 421 (Sahiwal) — 5.1× imbalance |
| Identical images filed under *different* breeds | **216 sets, 483 files, touching 44 of 50 breeds** |
| Buffalo breeds present | **none** |

That row about identical images is the serious one. The same file, byte for
byte, appears under multiple breed labels — one image is filed simultaneously
as `Hariana`, `Ongole`, `Tharparkar` **and** `gaolao`. Those labels cannot all
be right. This is proven label noise, not a guess, and it places a hard ceiling
on achievable accuracy.

**Cleaning.** Two removals, both recorded as reversible configuration:
`Ayrshire` (a Scottish breed, outside scope) and all 483 contradictory files.
Result: **7,799 images across 49 breeds.**

**Splitting — and the trap avoided.** The data is divided into training
(5,570), validation (1,115) and test (1,114).

The obvious way to split is at random. That would have been a serious mistake
here. Scraped datasets contain many near-identical photos of the same animal.
Split randomly, near-twins land on both sides, the model effectively sees the
validation answers during training, and the score comes out flattering and
false.

So every image was fingerprinted with a **perceptual hash** — a short code
summarising appearance, such that visually similar images get similar codes.
Near-duplicates were grouped, and whole groups were kept together in one split.

The measured difference:

| Strategy | Near-duplicate pairs straddling a split |
|---|---|
| Naive random split | **609** |
| Group-aware split (used) | **0** |

**A calibration lesson worth telling.** The similarity threshold was first
tuned on synthetic test images, giving a value of 16. On the real photographs,
16 merged **7,084 of 8,515 images into a single group** — 83% of the dataset,
which would have made splitting impossible. Real photos of *different* animals
of the *same* breed are far more alike than synthetic textures. The threshold
was re-derived from the real data to 8. Parameters tuned on stand-in data must
be re-derived on real data.

**Training.** Three architectures were compared on equal terms, because the
brief specifically forbade assuming EfficientNet would win. No GPU was
available, so the frozen-feature approach was used — legitimate as a baseline,
and it makes a three-way comparison affordable.

## Level 5 — Full technical specification

### Data pipeline
| Item | Value |
|---|---|
| Source | Kaggle `atharvadarpude/indian-cattle-image-dataset` |
| Raw / valid / modelled | 8,539 / 8,515 / 7,799 |
| Classes | 49 (cattle only) |
| Splits | 5,570 / 1,115 / 1,114 (0.714 / 0.143 / 0.143) |
| Split method | `StratifiedGroupKFold`, groups from perceptual-hash clusters |
| Perceptual hash | 64-bit pHash, Hamming threshold 8 |
| Seed | 42 |
| Leakage | 0 cross-split near-duplicate pairs |

### Preprocessing
Convert to RGB → bicubic resize to 224 → centre crop 224×224 → ImageNet
normalisation (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`).

224 px was chosen from the data, not convention: 60% of images have a short
edge below 224, so larger inputs would mostly upscale rather than add detail.

No augmentation in this phase — features are cached, and augmentation is a
later controlled experiment rather than an unmeasured default.

### Model
- Backbone: `efficientnet_b0.ra_in1k` via `timm`, ImageNet-1k pretrained,
  **frozen**, classifier removed, outputting 1,280-dimensional pooled features
- Head: single linear layer, 1,280 → 49, on standardised features
- Optimiser AdamW, lr 1e-3, weight decay 1e-4, batch 256, max 40 epochs
- Cross-entropy with balanced class weights (inverse frequency, mean-normalised)
- Early stopping on validation macro-F1, patience 8 — stopped at epoch 16

### Results — validation split

| Backbone | Accuracy | Macro F1 | Weighted F1 | Top-3 | Top-5 | Params | Size | ms/img |
|---|---|---|---|---|---|---|---|---|
| **efficientnet_b0** | **0.6359** | **0.6049** | **0.6324** | 0.8278 | 0.9031 | 4.0M | 15.3 MB | 21.7 |
| mobilenetv3_100 | 0.6251 | 0.5965 | 0.6225 | **0.8493** | **0.9121** | 4.2M | 16.0 MB | **17.5** |
| resnet50 | 0.5794 | 0.5405 | 0.5724 | 0.8009 | 0.8852 | 23.5M | 89.7 MB | 61.0 |

Chance accuracy on 49 classes is about 2%.

Reading these properly:

- **ResNet50 lost on every axis** — 5.9× the parameters and 2.8× the latency,
  for 5.7 points *worse* accuracy.
- **EfficientNet wins top-1 by only 1.1 points** — small enough that a
  different random seed could plausibly reverse it.
- **MobileNet wins top-3** (0.8493 vs 0.8278) while being 19% faster. Since the
  interface shows three alternatives, top-3 is arguably closer to the real
  user-facing quality measure. **Both are carried forward** rather than
  declaring a winner on a 1-point gap.
- **Macro F1 trails accuracy by ~3 points everywhere.** Macro F1 weights all 49
  breeds equally; accuracy is dominated by the larger ones. The gap means
  smaller breeds are predicted worse — expected at 5.1× imbalance.

**The test split was used only for final scoring.** Choosing a model against it
would contaminate the only honest estimate of real-world performance, so the
architecture, the fine-tuning epoch, the temperature and the thresholds were all
chosen on validation. The test split has been scored twice, once for the frozen
baseline and once for the fine-tuned model, and both results are reported
(`docs/test-evaluation.md`).

### Frontend
Next.js 16.3.1, React 19.2, TypeScript 5, Tailwind CSS v4. Routes: `/`,
`/identify`, `/breeds`, `/breeds/[id]` (49 statically generated pages),
`/history`, `/history/[id]`, `/foundation`. Records in IndexedDB. WCAG AA
verified by measuring rendered pixels — 76 colour/size combinations, zero
failures.

### Not built
FastAPI backend, PostgreSQL/Supabase, object storage, authentication, GPS,
YOLO detection, Grad-CAM, admin dashboard, model export (ONNX/TFLite),
on-device inference.

---

# 0.6 What Is Actually Happening?

Stage by stage. **What it is · why it exists · in · out · technology · status.**

**1. User** — a person with a phone and a cow. *Status: n/a*

**2. Frontend** — the web application they interact with. Exists so the system
is usable by someone with no technical training. *In:* taps and photos. *Out:*
screens. *Tech:* Next.js 16, React 19, TypeScript, Tailwind v4. **REAL**

**3. Image upload** — getting the photo from device to program. On a phone the
button opens the rear camera directly. *In:* a file. *Out:* a JavaScript `File`
object. *Tech:* HTML file input with `capture="environment"`. **REAL**

**4. Validation** — rejecting unusable files immediately rather than wasting a
slow rural upload. *In:* the file. *Out:* pass, or a specific error message.
*Tech:* MIME check, 12 MB size cap, and a real decode attempt. **REAL**

**5. Preprocessing (browser)** — shrinking large photos. Phone cameras produce
4–10 MB images; sending those over a rural connection is the biggest avoidable
cost in the flow. *In:* validated file. *Out:* JPEG with longest side ≤1280 px.
*Tech:* HTML canvas, quality 0.85. Images already small are passed through
untouched. **REAL**

**6. Backend / API** — receives the image, runs a model, stores the record,
returns the answer. *Tech:* FastAPI + SQLite (`backend/main.py`). **EXISTS on
`main`, but does not predict breeds** — its `/api/detect` runs a YOLO detector
and needs a `breedvision.pt` that has never been produced. It also isn't the
service `web/` calls; the two were built independently.

**7. Preprocessing (model-side)** — converting the image into exactly the
tensor the network expects. *In:* image file. *Out:* a 1×3×224×224 tensor.
*Tech:* PIL + torchvision. **REAL, CLI only**

**8. AI model — feature extraction** — turning pixels into a compact numerical
description. *In:* the tensor. *Out:* 1,280 numbers. *Tech:* frozen
EfficientNet-B0 (`timm`). **REAL, CLI only**

**9. Inference — classification** — mapping that description onto breeds. *In:*
1,280 numbers. *Out:* 49 raw scores. *Tech:* trained linear layer, PyTorch.
**REAL, CLI only**

**10. Probabilities** — converting scores to comparable percentages. *In:* 49
scores. *Out:* 49 percentages summing to 100%. *Tech:* softmax. **REAL**

**11. Confidence banding** — deciding how much the interface may assert. This
is the trust layer: it is what stops a weak guess being presented as a finding.
*In:* top probability. *Out:* `confident` / `uncertain` / `low` and a flag for
whether a breed may be named. *Tech:* `src/lib/confidence.ts`. **REAL — with
thresholds (0.85 / 0.30) derived on validation data and confirmed on test**

**12. Backend response** — should return breed, confidence, alternatives and
model version. The FastAPI backend returns a *detection* shape instead
(bounding boxes, `annotated_url`), which does not match the TypeScript contract
`web/` expects. **Reconciling the two response shapes is outstanding work.**

**13. Frontend result** — presenting the outcome honestly. *In:* prediction.
*Out:* the result screen, in one of three forms depending on band. **REAL**
(currently fed by the placeholder)

**14. Database / history** — keeping records. *In:* image, prediction,
timestamp. *Out:* a browsable list. *Tech:* IndexedDB in the browser. **REAL,
device-only.** Server-side storage: **NOT BUILT**

---

# 0.7 Glossary

Each term explained before use.

**Computer vision** — the field concerned with getting useful information out
of images automatically.

**Machine learning model** — a program that learned its behaviour from
examples rather than being explicitly programmed with rules.

**Neural network** — a model built from many simple mathematical units in
layers, where each layer transforms the previous one's output.

**Convolutional neural network (CNN)** — a neural network specialised for
images. It searches for patterns in small patches and slides that search across
the whole image, so an object is recognised wherever it appears.

**Training** — showing the model many labelled examples and repeatedly
adjusting its internal numbers so its guesses match the labels more often.

**Inference** — using the finished model on a new input to get a prediction.
Fast; no learning happens.

**Transfer learning** — starting from a model already trained on a large
general dataset and adapting it, rather than training from scratch. Requires
far less data and time.

**Frozen backbone** — leaving the pretrained part unchanged and training only a
small new layer on top. Cheap and stable, but limited: the general-purpose
features were never specialised for cattle.

**Feature vector** — the list of numbers (1,280 here) summarising an image's
visual content.

**Softmax** — the function converting raw scores into percentages that sum
to 100%.

**Confidence score** — how strongly the model favours its top answer. **Not** a
probability of being right. Models can be confidently wrong.

**Top-3 accuracy** — how often the correct breed is among the model's top three
guesses. Relevant here because the interface shows three alternatives.

**Class imbalance** — some breeds having far more training photos than others
(5.1× here). Left unaddressed, models over-predict common classes.

**Macro F1** — a score that weights every class equally regardless of size,
unlike accuracy. A gap between them reveals that rare classes are being handled
worse.

**Data leakage** — when information from the test data influences training,
producing scores that look good but don't survive contact with reality.

**Perceptual hash** — a short code summarising how an image *looks*, so that
visually similar images get similar codes. Used here to find near-duplicates.

**Validation set / test set** — validation is used to make choices during
development; test is held back untouched for one final honest measurement.

**Precision / recall** — of the times the model said "Gir", how often was it
right (precision); of all actual Gir images, how many did it find (recall).

---

# 0.8 The Summary To Memorise

> **BreedVision is a computer-vision system that identifies the breed of
> Indian cattle from a photograph.** A user uploads or takes a picture; the
> system validates and resizes it, then a trained neural network converts the
> image into a numerical description and maps that onto 49 cattle breeds,
> returning a ranked list with confidence scores. The main technology is
> **EfficientNet-B0 with transfer learning in PyTorch**, trained on **7,799
> cleaned images across 49 breeds**, reaching **63.6% top-1 and 82.8% top-3
> accuracy on validation**, served through a **Next.js web application**. The
> goal is to give field workers a consistent second opinion on breed
> identification — one that **states clearly when it is unsure** rather than
> guessing.

### If you remember only five things

1. **What it does** — photo in, breed and confidence out, across 49 Indian
   cattle breeds.
2. **How** — transfer learning: an ImageNet-pretrained EfficientNet-B0, with
   its last three blocks fine-tuned and a linear layer mapping its 1,280 features
   to 49 breeds.
3. **How well** — 61.9% top-1 and 83.0% top-3 on the held-out test set (49
   breeds; chance is 2%). It names a breed for about 1 photo in 4, and is right
   about 9 times in 10 when it does.
4. **The honest part** — it refuses to name a breed when unsure, and the
   dataset has proven label errors (216 images filed under multiple breeds).
5. **What's missing** — the join. A frontend, a backend and a trained model all
   exist, but they were built along two separate tracks: the backend is
   detection-shaped and has no breed model, while the trained model is a
   classifier with no service around it.

### Questions you should expect

**"Is 63.6% good?"** — Against 2% chance, yes as a baseline. Against a human
expert, no. It's a frozen-feature baseline, which is the *floor*, not the
ceiling. Fine-tuning is the obvious next gain and needs a GPU.

**"Why not just use the best model?"** — All three were compared on equal
terms. ResNet50 lost outright. EfficientNet and MobileNet are within about a
point, and MobileNet actually wins top-3, so both were kept rather than
over-claiming a winner.

**"Does it work on buffalo?"** — No. The dataset contains no buffalo at all.
That would need a separate dataset, and the product deliberately doesn't offer
it.

**"Can I use it right now?"** — You can use the website, and you can run the
breed model from the command line. They aren't connected. There is also a
FastAPI backend on `main`, but it is built around YOLO detection and has no
breed model file, so it cannot name a breed either.

**"What's the biggest weakness?"** — The data. 60% of images are below 224
pixels, and 216 images are provably mislabelled across 44 of the 50 breeds. No
model can be right about an image whose ground truth contradicts itself.
