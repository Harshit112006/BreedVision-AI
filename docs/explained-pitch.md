# BreedVision — Four Explanations

Timed versions for different audiences. Written to be *said aloud*, not read
off a slide. Every figure is measured.

---

## One sentence

> BreedVision identifies the breed of Indian cattle from a photograph, using
> a neural network trained on about 7,800 labelled images across 49 breeds, and
> it tells you how confident it is — including saying when it isn't sure.

---

## 30 seconds — "So, what exactly is your project?"

> Identifying a cow's breed is normally done by eye, in the field, and it
> depends a lot on the individual's experience — two people can look at the
> same animal and disagree.
>
> BreedVision is a system where you photograph the animal and a trained
> model tells you the most likely breed, with a confidence score and the next
> most likely alternatives.
>
> It covers 49 Indian cattle breeds. Right now it gets the breed right about
> 64% of the time as its first guess, and the correct breed is in its top three
> about 83% of the time.
>
> The part I'd emphasise is that when it isn't confident, it says so rather
> than guessing — because a system that always answers teaches people to trust
> it, and then fails quietly.

---

## 60 seconds — with the technical outline

> **The problem.** Breed identification for Indian cattle is done visually, in
> the field, and it varies between assessors. That matters because breed feeds
> into livestock records and breeding decisions.
>
> **The solution.** A phone photo goes into a computer-vision model, which
> returns a ranked list of likely breeds with confidence scores.
>
> **The AI.** I used transfer learning. EfficientNet-B0, pretrained on
> ImageNet, is frozen and used as a feature extractor — it turns each image
> into 1,280 numbers describing its visual content. I trained a linear
> classifier on top to map those onto 49 breeds. I compared it against ResNet50
> and MobileNetV3 on identical settings rather than assuming EfficientNet was
> best; ResNet50 lost on accuracy, size and speed simultaneously.
>
> **The dataset.** A public Kaggle set of Indian cattle images — 8,539 files.
> I inspected it before training and found real problems: 216 images are filed
> under more than one breed, so their labels contradict each other. I removed
> those, plus one non-Indian breed, leaving 7,799 images across 49 breeds.
>
> **Results.** 63.6% top-1 and 82.8% top-3 on validation, against 2% chance.
> The test set is untouched, held for final evaluation.
>
> **Stack.** PyTorch and timm for the model; Next.js, React and TypeScript for
> the web application; FastAPI and SQLite for the backend that exists on `main`.
> Wiring the trained classifier into a service is the next piece of work — my
> frontend currently runs on a clearly-labelled mock.

---

## 3 minutes — the full account

> **Problem and motivation.**
> In India, cattle breed identification is done visually by field staff. Three
> practical problems: it depends on individual expertise, the expertise isn't
> always where the animal is, and inconsistency between assessors makes
> aggregated records hard to trust. Breed affects breeding decisions, livestock
> records and scheme eligibility, so a consistent second opinion has real value.
>
> **User workflow.**
> The user opens the app, photographs the animal or picks an existing image,
> checks the preview, and presses Analyse. They get back a breed, a confidence
> score, and up to five alternatives, plus the timestamp and model version. They
> can save it as a record and browse their history with filters.
>
> **Frontend.**
> Next.js 16 with React 19, TypeScript and Tailwind. Mobile-first, because it's
> a field tool — 44-pixel minimum touch targets, camera opens directly. The
> browser validates the file type and size, and downscales large photos to
> 1280 pixels before upload; on a test image that took 33 KB to 17 KB, which
> matters on rural connections. Accessibility was verified by measuring
> rendered pixels — 76 colour and size combinations, all passing WCAG AA.
>
> **Backend and database.**
> A FastAPI backend with SQLite exists on `main` — 15 endpoints, written by a
> teammate — but it is built around YOLO object detection and has no breed
> model file, so it cannot currently name a breed. It is also not the service
> my frontend calls; the two were developed independently and their response
> shapes differ. Reconciling them is outstanding. The
> frontend was written so that switching is a configuration change: every screen
> calls typed service functions that already contain both a mock and a real HTTP
> implementation. Records currently persist in IndexedDB in the browser, and
> already carry a sync-state field for the day a server exists.
>
> **Dataset.**
> Public Kaggle dataset, 8,539 files, 2.48 GB, 50 folders. I validated every
> image before trusting any of it. Zero corrupt files, but: the median short
> edge is only 197 pixels and 60% are below 224; class sizes range 83 to 421;
> and 216 sets of byte-identical images appear under different breed labels —
> one image is filed simultaneously as Hariana, Ongole, Tharparkar and gaolao.
> Those can't all be right, so that's proven label noise and a hard ceiling on
> accuracy. I removed them, plus Ayrshire which is a Scottish breed and out of
> scope, leaving 7,799 images and 49 breeds. There are no buffalo in the
> dataset, so buffalo identification isn't offered.
>
> **The splitting problem — the part I'm most pleased with.**
> Splitting randomly would have been a serious error. Scraped datasets contain
> many near-identical photos of the same animal; split at random, near-twins
> land on both sides, the model effectively sees validation answers during
> training, and the score is inflated. So I perceptually hashed every image,
> clustered near-duplicates, and kept whole clusters within a single split.
> Measured: a naive split leaves 609 near-duplicate pairs straddling
> boundaries; the group-aware split leaves zero.
>
> I also learned something calibrating it. I first tuned the similarity
> threshold on synthetic test images and got 16. On real photographs, 16 merged
> 83% of the dataset into one group — real photos of different animals of the
> same breed are far more alike than synthetic textures. I re-derived it from
> the real data at 8.
>
> **Model and training.**
> Transfer learning. EfficientNet-B0 pretrained on ImageNet, frozen, producing
> 1,280 features per image; a linear head trained on top for 49 classes. AdamW,
> balanced class weights for the imbalance, early stopping on macro F1. I used
> 224-pixel inputs because 60% of the data is below that anyway — bigger inputs
> would upscale, not add detail. No GPU was available, so I cached the features
> once per backbone, which made a fair three-way comparison affordable.
>
> **Evaluation.**
> EfficientNet-B0: 63.6% accuracy, 0.605 macro F1, 82.8% top-3. MobileNetV3 is
> a point behind on top-1 but actually *ahead* on top-3 at 84.9%, and 19%
> faster. ResNet50 lost on every axis — 5.9× the parameters for 5.7 points
> worse. I kept both lightweight models rather than declaring a winner on a
> one-point gap. Macro F1 sits about three points below accuracy on all three,
> which tells me the smaller breeds are being handled worse — expected with
> 5.1× imbalance.
>
> **Prediction pipeline.**
> Convert to RGB, resize and crop to 224, normalise, extract features, classify,
> softmax to percentages. Then a confidence band decides what the interface is
> allowed to claim: confident names the breed; uncertain refuses to and shows
> candidates instead; lowest just asks for a better photo. The cut-offs
> are measured on validation data, not guessed: the model names a breed at 85%
> and above, where it is right about 90% of the time, which covers only about a
> quarter of photos. That 90% target is a trade-off I chose, and it is not yet
> confirmed on the held-out test set.
>
> **Security.**
> No secrets in the frontend — only public configuration. No credentials
> committed. Since there's no backend or accounts yet, there's no authentication
> to secure; that arrives with the API.
>
> **Current status.**
> The dataset pipeline is complete and reproducible with 21 passing tests. The
> baseline model is trained and evaluated. The web application works end to end
> — upload, validation, resizing, results, history. The gap is that the two
> halves aren't connected: the site runs on a labelled mock service until the
> FastAPI backend exists. The test split is deliberately untouched.
>
> **Future scope.**
> Fine-tuning instead of frozen features — that's the biggest available gain and
> needs a GPU. Then the backend, database and storage; proper threshold
> derivation; per-class error analysis; augmentation experiments; possibly a
> detector to crop the animal first; and explainability so users can see which
> regions influenced a prediction. Buffalo support would need an entirely
> separate dataset.

---

## Things not to say

Guard rails, because these are easy to drift into and none are true:

| Don't say | Say instead |
|---|---|
| "It's 99% accurate" | "63.6% top-1, 82.8% top-3 on validation" |
| "It works offline with on-device AI" | "Records save on-device; on-device inference is future scope" |
| "It integrates with Bharat Pashudhan" | "No government integration exists" |
| "It identifies cattle and buffalo" | "49 cattle breeds. The dataset has no buffalo" |
| "The app is live and predicting" | "The site works; it runs on a mock until the backend is built" |
| "It's expert-level" | "It's a consistent second opinion that flags its own uncertainty" |
| "The model understands cattle anatomy" | "It learned statistical patterns that correlate with breed labels" |
