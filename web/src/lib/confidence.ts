/**
 * Confidence banding — how much the interface is allowed to assert.
 *
 * IMPORTANT: the thresholds below are PROVISIONAL placeholders. Phase 5 of the
 * ML plan derives the real operating threshold empirically from validation
 * data; until that runs, these values are not evidence-based and no part of the
 * UI may present them as a validated accuracy guarantee.
 *
 * The band — not the raw number — decides how the result screen speaks:
 *   confident  -> state the breed
 *   uncertain  -> present candidates, do not assert a single breed
 *   low        -> decline to identify, ask for a better photo
 */

import type { ConfidenceBand, Prediction } from "@/types";

export interface ConfidenceThresholds {
  /** At or above this, the UI states a single breed. */
  confident: number;
  /** At or above this (but below `confident`), the UI offers candidates. */
  uncertain: number;
}

/** Provisional. Replace with the Phase 5 value once measured. */
export const PROVISIONAL_THRESHOLDS: ConfidenceThresholds = {
  confident: 0.7,
  uncertain: 0.4,
};

/** True while the thresholds above are not yet backed by validation data. */
export const THRESHOLDS_ARE_PROVISIONAL = true;

export function bandFor(
  confidence: number,
  thresholds: ConfidenceThresholds = PROVISIONAL_THRESHOLDS,
): ConfidenceBand {
  if (confidence >= thresholds.confident) return "confident";
  if (confidence >= thresholds.uncertain) return "uncertain";
  return "low";
}

export function bandForPrediction(
  prediction: Prediction,
  thresholds?: ConfidenceThresholds,
): ConfidenceBand {
  return bandFor(prediction.confidence, thresholds);
}

interface BandPresentation {
  /** Short status word. Never the only signal — always paired with text. */
  label: string;
  /** One sentence explaining what the band means for the user. */
  description: string;
  /** Whether the UI may state a single breed as the answer. */
  assertsBreed: boolean;
}

export const BAND_PRESENTATION: Record<ConfidenceBand, BandPresentation> = {
  confident: {
    label: "Confident match",
    description: "The model identified one breed clearly.",
    assertsBreed: true,
  },
  uncertain: {
    label: "Identification uncertain",
    description:
      "The model could not settle on one breed. Review the candidates below.",
    assertsBreed: false,
  },
  low: {
    label: "Could not identify",
    description:
      "The model could not determine the breed from this image. A clearer photo of the whole animal usually helps.",
    assertsBreed: false,
  },
};

/** Percentage string for display, e.g. 0.9137 -> "91.4%". */
export function formatConfidence(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}
