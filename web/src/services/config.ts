/**
 * Service layer configuration.
 *
 * The frontend talks to `src/services/*` only. Those modules decide whether a
 * call is served by the mock implementation or the real FastAPI backend, so
 * switching over is a configuration change — not a UI rewrite.
 */

/** Public config only. Never put a service-role key or secret in here. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/**
 * Mocks are on until the backend exists.
 *
 * Set `NEXT_PUBLIC_USE_MOCKS=false` once `/predict` is live. Every screen that
 * renders mock-derived data must show `<MockDataNotice />` while this is true —
 * the user should never be unable to tell demo data from a real prediction.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

/** Upload limits, mirrored by backend validation in Phase 9. */
export const IMAGE_LIMITS = {
  /** Reject before upload rather than wasting a round trip. */
  maxBytes: 12 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  acceptAttribute: "image/jpeg,image/png,image/webp",
  /** Longest edge after client-side downscale. Keeps uploads small in the
   *  field without dropping below what the model needs. */
  maxEdgePx: 1280,
  compressQuality: 0.85,
} as const;
