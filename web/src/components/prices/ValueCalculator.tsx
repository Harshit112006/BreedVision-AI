"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import {
  PREGNANCY_LITRE_EQUIVALENT,
  SOURCE_CITATION,
  valueIndex,
} from "@/lib/valuation";

/** Relative value only. Deliberately prints no rupee amount. */
export function ValueCalculator() {
  const [yieldText, setYieldText] = useState("8");
  const [pregnant, setPregnant] = useState(false);

  const litres = Number(yieldText);
  const valid = yieldText.trim() !== "" && Number.isFinite(litres) && litres >= 0 && litres <= 60;
  const result = valid ? valueIndex({ milkYieldLitres: litres, pregnant }) : null;

  return (
    <Card>
      <h2 className="text-title font-semibold tracking-tight text-ink">
        Relative value
      </h2>
      <p className="mt-2 max-w-prose text-small text-ink-2 text-pretty">
        Shows which traits push an animal’s value up, using a published
        regression. It gives a comparison score, <strong>not a price</strong>.
      </p>

      <div className="mt-5 grid max-w-xl gap-4 sm:grid-cols-2">
        <Field
          label="Daily milk yield (litres)"
          error={valid ? undefined : "Enter a number from 0 to 60."}
        >
          <Input
            inputMode="decimal"
            value={yieldText}
            onChange={(e) => setYieldText(e.target.value)}
          />
        </Field>
        <label className="flex min-h-11 items-center gap-3 self-end text-small text-ink-2">
          <input
            type="checkbox"
            checked={pregnant}
            onChange={(e) => setPregnant(e.target.checked)}
            className="h-5 w-5 accent-forest"
          />
          Animal is pregnant
        </label>
      </div>

      {result ? (
        <div className="mt-6" role="status" aria-live="polite">
          <p className="text-micro uppercase tracking-[0.14em] text-ink-3">
            Value index
          </p>
          <p data-numeric="" className="mt-1 text-section font-semibold text-ink">
            {result.index.toFixed(1)}
            <span className="ml-2 text-small font-normal text-ink-3">
              litre-equivalents
            </span>
          </p>
          <ul className="mt-4 flex max-w-md flex-col gap-3">
            {result.factors.map((f) => (
              <li key={f.key}>
                <div className="flex justify-between text-small text-ink-2">
                  <span>{f.label}</span>
                  <span data-numeric="">
                    {f.points.toFixed(1)} · {Math.round(f.share * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-xs bg-cream">
                  <div
                    className="h-2 rounded-xs bg-forest-mid"
                    style={{ width: `${Math.round(f.share * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="mt-6 text-small text-ink-3">
        <summary className="cursor-pointer font-medium text-ink-2">
          How this is calculated, and its limits
        </summary>
        <div className="mt-2 flex max-w-prose flex-col gap-2 text-pretty">
          <p>
            Pregnancy counts as {PREGNANCY_LITRE_EQUIVALENT.toFixed(2)} litres of
            daily yield, the ratio of the two effects in the source study.
          </p>
          <p>
            Source: {SOURCE_CITATION} Data was collected in 2010–11 in Tamil
            Nadu, and it includes no indigenous breeds such as Gir or Sahiwal.
            Breed is therefore not part of this score, and no rupee value is
            shown.
          </p>
        </div>
      </details>
    </Card>
  );
}
