# Frontend Application (Phases B–D)

**Status:** Landing page, identification workflow, breed library and record
history complete and verified in a browser. Predictions come from the mock
service layer; **records are really persisted** on the device.

See [frontend-foundation.md](frontend-foundation.md) for the design system.

---

## 1. Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | Landing — hero, problem, 4-step flow, product preview, CTA |
| `/identify` | Static shell + client flow | The identification workflow |
| `/breeds` | Static | Breed library with search and filters |
| `/breeds/[id]` | SSG, 18 paths | Breed detail |
| `/history` | Static shell + client list | Saved records with filters |
| `/history/[id]` | Dynamic | Record detail, with delete |
| `/foundation` | Static, `noindex` | Design-system reference |

## 2. Service layer

UI never calls `fetch` directly. Everything goes through `src/services/`:

```
predictBreed(file)          -> ServiceResult<Prediction>
getPredictionHistory()      -> ServiceResult<IdentificationRecord[]>
getBreeds()                 -> ServiceResult<BreedSummary[]>
getBreed(id)                -> ServiceResult<Breed>
```

`ServiceResult<T>` is a discriminated union, so callers are forced by the type
system to handle failure rather than assuming success.

Each function branches on `USE_MOCKS`. The real implementations are already
written against the intended FastAPI contract, including status-code handling
(413 → too large, 415 → unsupported format). **Switching to the live backend is
`NEXT_PUBLIC_USE_MOCKS=false`** — no component changes.

Public configuration only, in `web/.env.example`. No secret may go in a
`NEXT_PUBLIC_*` variable.

## 3. The identification flow

A state machine in `IdentifyFlow.tsx`:

```
idle ──select──▶ preparing ──▶ ready ──analyse──▶ analysing ──▶ done
  ▲                  │                                │
  └──────────────────┴────────── failed ◀─────────────┘
```

### No invented progress

Phases map to **real async boundaries**. `preparing` is the actual decode and
downscale; `analysing` is the request in flight. Sub-progress inside the request
is unknowable, so that phase shows an indeterminate spinner. There is no
percentage anywhere in this flow, because there is nothing real to derive one
from.

### Client-side image handling

`src/lib/image.ts` validates type and size before any decode, then downscales to
a 1280px longest edge at quality 0.85. Images already under that are passed
through untouched rather than re-encoded and degraded. Field users are on phone
cameras over rural connections; this is the largest single win available to the
flow.

Measured on a 1800×1350 test image: **downscaled to 1280×960, 33 KB → 17 KB**,
with the reduction surfaced to the user.

## 4. Confidence honesty

`src/lib/confidence.ts` owns the rule that the **band, not the number**, decides
what the interface asserts.

| Band | Headline | Asserts a breed? | Candidate list |
|---|---|---|---|
| `confident` | The breed name, at display size | **Yes** | Alternatives below |
| `uncertain` | "This animal could not be matched to one breed" | **No** | Top-1 folded in as a candidate |
| `low` | "The breed could not be determined" | **No** | None — photo guidance instead |

The uncertain case is the important one. The model still has a top-1 label, and
it would be easy to show it with a small confidence figure beside it. The
interface deliberately does not: the top-1 is demoted into a list of candidates
with "none is confirmed" stated above it.

> Thresholds were originally placeholders (0.70 / 0.40). They are now **derived**:
> 0.85 confident, 0.30 low, from `ml/training/calibrate.py` (see
> `model-baseline.md` section 10). They are validation-based and not yet
> confirmed on the test split.

## 5. Breed library

Search matches breed name and region. Filters for animal category and region
compose with search. `useDeferredValue` keeps typing responsive as the list
grows toward the full ~50 breeds.

### Missing content is shown, not hidden

The dataset has not been downloaded, so there are no verified breed facts and no
photographs. Rather than filling the gap:

- **`BreedImage`** renders a monogram placeholder that is unmistakably not a
  photograph, with an `aria-label` of "No photograph available for {breed}".
  Using stock imagery of the wrong animal on a breed-identification product
  would actively mislead.
- **`SourceNotice`** renders an explicit "Breed details not yet verified" panel
  when `source` is null, instead of showing unattributed prose as fact.
- Characteristics fall back to "will be added from ICAR-NBAGR records rather
  than written from memory".

### The breed list is generated, not hand-written

`web/src/services/mock/breeds.generated.ts` is produced by
`ml/scripts/export_breeds_to_frontend.py` from the dataset's
`class_mapping.json`. The model's classes are the single source of truth for
which breeds the product can identify; a hand-maintained parallel list would
drift and, worse, would invite listing breeds the model was never trained on.

It currently carries the **49 real classes** the Phase 1 pipeline produced.
Every `description`, `shortDescription`, `region` and `characteristics` field is
deliberately `null` or empty, with `source: null`, so the UI renders its
"not yet verified" state rather than unattributed prose.

### Cattle only

The dataset contains **no buffalo breeds** (dataset-report §7.4), so buffalo
identification is not offered anywhere in the product. The `AnimalCategory`
type still allows `buffalo` — the scope limit is a data fact, not a design
decision, and should disappear on its own if a buffalo dataset is added.

Filters follow the same principle: the animal and region controls render **only
when the data can actually be filtered**. With one category and no recorded
home tracts, both stay hidden and the uniform "Cattle" badge is suppressed. A
control that can only ever return everything is noise pretending to be a
feature. They reappear automatically when Phase 16 supplies regions.

## 6. Verification

Driven in a real browser, not inferred from code.

**Identification flow** — all three bands reached by computing filenames that
hash into each:

| Band | Result | Asserted a breed |
|---|---|---|
| 77.0% | "Jaffarabadi" under *Predicted breed*, 3 alternatives | yes |
| 56% | "This animal could not be matched to one breed", 5 candidates | **no** |
| 26% | "The breed could not be determined", photo guidance | **no** |

**Error paths** — each gives a specific, actionable message:

| Input | Message |
|---|---|
| `image/gif` | "That file type isn't supported. Choose a JPG, PNG or WEBP photo." |
| 13 MB JPEG | "That photo is 13.0 MB. Choose one under 12 MB." |
| Undecodable JPEG | "That image could not be opened. It may be damaged — try another photo." |

**Breed library filters:**

| Filter | Result |
|---|---|
| search "guj" | 5 (matches region as well as name) |
| animal = buffalo | 6 |
| buffalo + Gujarat | 3 — Jaffarabadi, Mehsana, Surti |
| no match | empty state, "0 breeds of 18" |
| clear filters | back to 18, control hides itself |

**Routing:** `/breeds/does-not-exist` returns a real **404**; all 18 breed pages
and the other routes return 200.

**Layout and a11y:** single `h1` per page with a valid heading outline, no
horizontal overflow at 375px or 1280px, hero and detail grids stack on mobile,
primary CTAs 52px. `tsc` clean, `eslint` clean, production build all-static,
zero console errors.

### Defects found and fixed

1. **Duplicate `<h1>`** — `PredictionResult` rendered its own `h1` inside a page
   that already had one. Demoted to `h2` with nested headings to `h3`; the
   visual size is unaffected because it comes from the type token.
2. **Broken step connector** — the "how it works" rule spanned only each list
   item, leaving a 32px gap at every column gutter. Now spans the gutter.

## 7. Known gaps

- **No real photography.** The hero uses a product visualisation (permitted by
  the brief); breed cards use monograms. Licensed cattle and buffalo imagery is
  needed and cannot be synthesised.
- **Records are device-local only** (Phase D). Saving works and persists, but
  there is no account and nothing is uploaded. Clearing site data loses them.
- **No GPS capture** (Phase G) and **no bounding-box overlay** (needs the
  Phase 6 detector). The result screen shows "Location — Not captured".
- **`modelVersion` reads `not-trained`** and `numClasses` is 0, because that is
  the truth.
- Profile, auth and the admin dashboard are Phases E–F.


---

## 8. Records and local persistence (Phase D)

### Why this is real rather than mocked

There is no backend and no account, so "save this record" had two honest
options: disable it, or make it genuinely work on the device. It works.

`src/services/localdb.ts` is a small IndexedDB wrapper; `src/services/records.ts`
is the service the UI talks to. IndexedDB rather than `localStorage` because
records carry the animal photograph: `localStorage` is synchronous, capped
around 5 MB and stores strings only, so images would need base64 encoding —
about a third larger, on the main thread. IndexedDB stores `Blob`s natively.

This is also the storage layer Phase 13 (offline capture and sync) requires, so
it was built once here rather than retrofitted. **Every record carries a
`syncState`** (`local-only` / `pending` / `synced`) from the outset, and the
record detail screen already renders it. When the API lands, `records.ts` gains
an upload step and advances that state; no component changes.

### Object URL lifecycle

`listRecords()` and `getRecord()` mint object URLs for stored blobs. Both
consumers revoke them on unmount and on a cancelled in-flight load — otherwise
every visit to History would leak one blob URL per record for the life of the
document.

### What the UI promises

The history page and the identify result both state plainly: *"Records are
stored on this device only. There is no account or server yet, so nothing is
uploaded."* No sync indicator implies a sync that does not exist.

### Filters

Date (any / today / 7 days / 30 days), breed (derived from saved records), and
confidence band, all composable, with a count line and a clear control that
hides itself when no filter is active. Filters are suppressed entirely at zero
records, since there is nothing to filter.

### Confidence honesty carries into history

A saved uncertain or low-confidence record **does not show a breed name as its
title**. The card title is the band label, and the row shows a candidate count
(uncertain) or "No usable match" (low) instead of a confidence figure. A record
list is exactly where a hedged result would otherwise silently harden into a
fact.

### Deletion

Two-step: `Delete record` reveals an inline confirm with `Yes, delete` and
`Keep it`. Verified to remove the row from IndexedDB, not just from the view.

## 9. Phase D verification

| Check | Result |
|---|---|
| Save from the result screen | 3 records saved, button becomes "View saved record" |
| Persistence across a full reload | all 3 read back from IndexedDB |
| Stored images re-served | `naturalWidth > 0` on every card and detail view |
| Ordering | newest first |
| Filter: confident only | 1 of 3 |
| Filter: uncertain only | 1 of 3 |
| Filter: breed = Jaffarabadi | 1 of 3 |
| Filter: today | 3 of 3 |
| Clear filters | back to 3, control hides |
| Delete | IndexedDB count 3 → 2, UI agrees, redirect to `/history` |
| Cancel delete | record retained |
| Empty state | shown at zero records, filters suppressed |
| Mobile 375px | no overflow, cards stack, 44px filter controls |

### Defects found and fixed in Phase D

1. **Record detail page had no `h1`.** Demoting `PredictionResult`'s heading in
   Phase B left this page starting at `h2`. The heading level is now a prop
   (`headingLevel`), defaulting to `h2` for pages that own their `h1` and set to
   `h1` where the result *is* the page subject.
2. **Heading outline skipped a level** once the above landed (`h1` → `h3`). The
   nested heading level is now derived from the parent rather than hardcoded.
3. **Duplicated label on history cards** — title and badge both read
   "Could not identify". The band badge now renders only when the title is a
   breed name.
4. **List/detail inconsistency** — a `low` card advertised "4 candidates" while
   its detail view deliberately shows none. The card now reads "No usable
   match".
