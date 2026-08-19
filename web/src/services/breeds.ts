/** Breed service. UI imports from here; never fetches directly. */

import type { Breed, BreedSummary, ServiceResult } from "@/types";

import { API_BASE_URL, USE_MOCKS } from "./config";
import { MOCK_BREEDS, MOCK_BREED_SUMMARIES } from "./mock/data";

export async function getBreeds(): Promise<ServiceResult<BreedSummary[]>> {
  if (USE_MOCKS) return { ok: true, data: MOCK_BREED_SUMMARIES };

  try {
    const res = await fetch(`${API_BASE_URL}/breeds`);
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "server", message: "Could not load the breed library." },
      };
    }
    return { ok: true, data: (await res.json()) as BreedSummary[] };
  } catch {
    return {
      ok: false,
      error: {
        code: "network",
        message: "No connection. Breed information is unavailable offline.",
      },
    };
  }
}

export async function getBreed(id: string): Promise<ServiceResult<Breed>> {
  if (USE_MOCKS) {
    const found = MOCK_BREEDS.find((b) => b.id === id);
    return found
      ? { ok: true, data: found }
      : {
          ok: false,
          error: { code: "unknown", message: "That breed could not be found." },
        };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/breeds/${id}`);
    if (!res.ok) {
      return {
        ok: false,
        error: { code: "server", message: "Could not load this breed." },
      };
    }
    return { ok: true, data: (await res.json()) as Breed };
  } catch {
    return {
      ok: false,
      error: { code: "network", message: "No connection to the breed service." },
    };
  }
}
