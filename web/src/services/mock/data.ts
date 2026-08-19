/**
 * Breed data for the mock service layer.
 *
 * The breed list is GENERATED from the dataset's class mapping
 * (`breeds.generated.ts`) rather than hand-maintained, so the library can never
 * advertise a breed the model was not trained on.
 *
 * Two honesty rules govern what is exposed here:
 *
 * 1. Breed **names** are the dataset's own class labels. Those are safe to
 *    state — they are what the model predicts.
 * 2. Breed **descriptions, characteristics and regions are absent** (`null` /
 *    empty), and `source` is null so the UI renders an explicit "not verified"
 *    state. Writing plausible-sounding breed facts would put invented content
 *    in front of users. Phase 16 fills these from ICAR-NBAGR with citations.
 *
 * Scope: this dataset contains **cattle only**. It has no buffalo breeds, so
 * buffalo identification is not offered anywhere in the product until a
 * separate dataset is sourced (docs/dataset-report.md section 7.4).
 *
 * Confidence figures produced by the mock predictor are illustrative values for
 * building the interface. They are NOT model output and must never be quoted.
 */

import type { Breed, BreedSummary, ModelInfo } from "@/types";

import { GENERATED_BREEDS, NUM_CLASSES } from "./breeds.generated";

export const MOCK_BREED_SUMMARIES: BreedSummary[] = GENERATED_BREEDS.map(
  (b) => ({
    id: b.id,
    name: b.name,
    category: "cattle" as const,
    // Home tracts are not recorded in the dataset and are not invented here.
    region: null,
    shortDescription: null,
    imageUrl: null,
  }),
);

export const MOCK_BREEDS: Breed[] = MOCK_BREED_SUMMARIES.map((b) => ({
  ...b,
  description: null,
  characteristics: [],
  // No verified relationships exist yet; an arbitrary "related" list would be
  // a fabricated claim about breed similarity.
  relatedBreedIds: [],
  source: null,
  sourceUrl: null,
}));

export const MOCK_MODEL_INFO: ModelInfo = {
  // No model has been selected for deployment yet. Phase 2 compares backbones;
  // Phase 3 evaluates on the held-out test split.
  version: "not-deployed",
  architecture: "under evaluation (Phase 2 backbone comparison)",
  numClasses: NUM_CLASSES,
  confidenceThreshold: 0.7,
  trainedAt: null,
};
