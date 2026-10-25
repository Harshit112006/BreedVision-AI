"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { EXPLAIN_AVAILABLE, explainPrediction, type Explanation } from "@/services/explain";

/**
 * "Where did the model look?" — evidence regions, never anatomy.
 *
 * The wording matters as much as the picture. It says the model *found
 * evidence in* a region; it never says the model looked at horns, a hump or a
 * coat, because the map shows image regions and cannot tell us which features
 * those regions contain.
 */
export function HeatmapPanel({ file }: { file: File }) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [data, setData] = useState<Explanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHeat, setShowHeat] = useState(true);

  if (!EXPLAIN_AVAILABLE) {
    return (
      <p className="text-micro text-ink-3">
        The “where the model looked” view is available when the app is connected
        to the live model.
      </p>
    );
  }

  const load = async () => {
    setState("loading");
    setError(null);
    const r = await explainPrediction(file);
    if (r.ok) {
      setData(r.data);
      setState("ready");
    } else {
      setError(r.error.message);
      setState("failed");
    }
  };

  if (state === "idle" || state === "failed") {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <Button variant="secondary" size="md" onClick={load}>
            Show where the model looked
          </Button>
        </div>
        {error ? <p role="alert" className="text-small text-clay">{error}</p> : null}
      </div>
    );
  }

  if (state === "loading" || !data) {
    return <p role="status" className="text-small text-ink-3">Working out where the model found evidence…</p>;
  }

  return (
    <figure className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-md bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.viewUrl} alt="" className="absolute inset-0 h-full w-full" />
        {showHeat ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.heatmapUrl} alt="" className="absolute inset-0 h-full w-full" />
        ) : null}
        <span className="sr-only">
          {`Heat-map for ${data.breedName}. ${data.summary}`}
        </span>
      </div>

      <figcaption className="flex flex-col gap-2 text-small text-ink-2">
        <p>
          <strong className="font-semibold text-ink">{data.breedName}:</strong> {data.summary}{" "}
          Darker areas are where the model found more evidence for this breed.
        </p>

        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={showHeat}
            onChange={(e) => setShowHeat(e.target.checked)}
            className="h-5 w-5 accent-forest"
          />
          Show heat-map over the photo
        </label>

        <p className="text-micro text-ink-3 text-pretty">
          The model sees only the centre of the photo, so this is that square,
          not the whole image. This shows <strong>regions</strong> that
          influenced the result. It does not show which body features the model
          used, and it is not proof of how the breed was recognised.
        </p>

        <details className="text-micro text-ink-3">
          <summary className="cursor-pointer font-medium text-ink-2">Limits of this view</summary>
          <ul className="mt-2 list-disc pl-5">
            {data.limits.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </details>
      </figcaption>
    </figure>
  );
}
