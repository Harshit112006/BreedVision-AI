# Problem Statement (revised draft)

Smart India Hackathon SIH25004. This paraphrases the team deck; copy the official
wording from the SIH portal for the submission.

## The problem

India holds the world's largest livestock population (the deck cites 536 million
cattle and buffaloes, 20th Livestock Census; not independently verified here).
Yet breed identity and animal value are both recorded by hand:

- **Breed is judged by eye** by scarce experts, so it is subjective and varies
  between regions.
- **Value is negotiated without reliable reference data**, which disadvantages
  smallholders.
- Wrong or duplicated records distort breeding programmes, insurance claims,
  subsidy allocation and national livestock databases.

## The solution

BreedVision AI lets a field worker photograph an animal and get:

1. A **breed prediction with a calibrated confidence score**, which says so when
   it is unsure rather than guessing.
2. After a few basic inputs (age, milk yield, lactation stage), an **estimated
   value range** with the reasoning shown.
3. A **GPS-tagged record** that works offline and syncs later.
4. A **duplicate-animal flag**, so one animal cannot be claimed twice.

## Scope, stated honestly

| Capability | Status |
|---|---|
| Breed classification, 49 cattle breeds | Built; 63.6% top-1 / 82.8% top-3 on validation |
| Confidence bands that refuse to name a breed when unsure | Built (thresholds still provisional) |
| Optional GPS tagging | Built |
| Local records and history | Built (device only) |
| Buffalo breeds | **Not covered**: no buffalo in the dataset |
| Price estimation | **Not built**; blocked on a verified price source |
| Duplicate-animal detection | Planned; reuses the perceptual hashing already built |
| Offline capture with sync | Planned; local records already carry a sync state |
| Bharat Pashudhan integration | **Not built**; no integration exists |

## Price estimation: how it must work

A photo identifies the breed; it does not reveal age, yield, lactation or local
demand. So this is an **estimator, not a detector**:

- Breed comes from the model. Age, yield and lactation stage come from the user.
- Output is always a **range labelled as an estimate**, listing its inputs.
- Base ranges must come from a documented source. Until one is found and
  verified, no price is shown. Inventing per-breed prices would be worse than
  omitting the feature.
- Users may log actual sale prices, which builds the missing dataset over time.
