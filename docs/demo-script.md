# Demo script and honest answers

About 8 minutes. The point is not "look how accurate": it is "look how honest the
system is about what it knows". All outputs below were produced by the running
system on 26 Oct 2026 (files in `C:\bv-data\demo`; see `demo-runbook.md`).

**Say once, up front:** the demo photos were picked from the held-out test set, not
cherry-picked for the model: three right, two uncertain, one confidently wrong, one
low. The set deliberately includes failures. Nothing was tuned on those photos.

## Walk-through

1. **Home page** (30 s). One sentence: photograph a cattle breed, get a prediction
   with a confidence you can trust, keep a record. Show the language picker, switch
   to Hindi and back (translations are AI-written and not yet reviewed by native
   speakers; say so if asked).

2. **A confident, correct result**: `confident_right_2.jpg`. Expect **Purnea,
   confident match, 96.9%**. Point out the three ways the confidence is shown (a
   written label, a meter, a number), the alternatives, the model version, and the
   analysis time (a few hundredths of a second, on a CPU).

3. **Where did the model look?** Press "Show where the model looked". Say: this
   shows image regions that influenced the result. It does not show *which body
   feature* the model used, and it is not proof of how the breed was recognised.

4. **An honest "I'm not sure"**: `uncertain_1.jpg` (true breed Ghumsari). Expect
   **Ghumsari 47%, "Identification uncertain"**: the app lists candidates and does
   *not* name one breed. This is a design decision: the app names a breed only when
   it is confident enough to be right about 9 times in 10.

5. **A failure, shown on purpose**: `confident_wrong_1.jpg` (true breed Kangayam).
   Expect **Pulikulam, 95%, confident**, which is wrong. Say: this happens; on the
   test set about 1 in 10 "confident" answers is wrong, which is exactly the rate
   the threshold was chosen for. This is why the output is advisory.

6. **A near miss that top-3 rescues**: `uncertain_2.jpg` (true breed Dagri). Expect
   Deoni 52%, with the true breed Dagri in the candidates. Top-3 accuracy is 83%
   against 62% for top-1.

7. **Not cattle**: `not_cattle_china.jpg` (a photo of a pagoda). Expect "This does
   not look like a photo of cattle" and no breed. Be honest about the limit: this
   check flags unrelated pictures. It has **not** been shown to reject dogs, horses
   or buffalo, because there are no such photos in the project to measure on, and it
   flags about 1–2% of real cattle photos by mistake.

8. **The record**: save a result, open History, filter, export CSV. Show that the
   CSV has a `stated_breed` column that is empty for uncertain results.

9. **Model facts page** (`/model`): the real numbers and limits on one page.

## Numbers to have in your head (all on 1,114 unseen test photos, 49 breeds)

- Top-1 **61.9%** (95% CI 58.8–64.6), top-3 **83.0%**, top-5 90.5%. Chance is 2%.
- When the app names a breed (24% of photos), it is right **90.1%** of the time.
- Fine-tuning improved top-1 from 59.3% to 61.9% (+2.7 points, paired 95% interval
  +0.5 to +4.9). A modest gain.
- The test set was looked at twice, once per model; nothing was chosen from it.

## Likely questions

**"Why only 62%?"** Forty-nine breeds, many of which look alike even to experts, a
small dataset (about 5,600 training photos) and only the last three network blocks
trained. The system is designed around that: it names a breed only when it is
confident, and shows the top three otherwise (83% contain the right one).

**"Is it tested on real field photos?"** No. All photos come from web sources. Field
conditions are likely harder. That is the main next step.

**"Why not YOLO or detection?"** The dataset has no bounding boxes, so a detector
cannot be trained from it. This is a classifier on the whole photo. The backend also
has a separate YOLO detection route from a teammate's earlier work; it is not part
of the breed model.

**"What about buffalo?"** Not covered: the dataset contains no buffalo.

**"Is it connected to Bharat Pashudhan?"** No. That is future scope.

**"Can it run offline?"** The model runs on a laptop with no internet. The mobile
app/PWA offline mode is not built; the web app currently needs the laptop backend.

**"Where do the rupee values come from?"** They are an *indicative estimate*, not a
market quote. The base is a breed guide's listed price range (10 of 49 breeds have
one; the rest get a general desi-cow range and the page says so). Milk yield adds
Rs 4,000 a litre (an assumption from one project report) and pregnancy adds the
ratio from Kumar et al. 2014. No verified livestock price series exists, so the
estimate cannot be checked against real sales; that is a stated limit. (A synthetic
sales dataset generated around the same ranges exists in the repository but is not
shown in the app, and could not validate the estimate anyway.)

**"How do you know there is no data leakage?"** Near-duplicate photos (perceptual
hash) were grouped so they stay on one side of the split. A plain random split would
have leaked 609 near-duplicate pairs from training into test; this one leaks none.

**"Did you tune on the test set?"** No. The model, epoch, temperature and thresholds
were all chosen on validation. The test set was scored once for each of the two
models and both results are reported.

**"Does the heat-map show what the model sees?"** It shows image regions that
influenced the result. It does not identify body features, and a map can be
faithful and still uninformative; a deletion test was run on 300 validation photos
(`docs/explainability.md`).

**"Who wrote the translations?"** An AI, not native speakers. They are labelled as
unreviewed and need checking before field use.
