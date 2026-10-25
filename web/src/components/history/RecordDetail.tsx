"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PredictionResult } from "@/components/prediction/PredictionResult";
import { ErrorState, LoadingState } from "@/components/states";
import { Button, ButtonLink } from "@/components/ui/Button";
import { deleteRecord, getRecord, type LocalRecord } from "@/services/records";

const SYNC_LABEL: Record<LocalRecord["syncState"], string> = {
  "local-only": "Stored on this device only",
  pending: "Waiting to sync",
  synced: "Synced",
};

export function RecordDetail({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<LocalRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getRecord(id).then((result) => {
      if (cancelled) {
        if (result.ok) URL.revokeObjectURL(result.data.imageUrl);
        return;
      }
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      urlRef.current = result.data.imageUrl;
      setRecord(result.data);
    });

    return () => {
      cancelled = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, [id]);

  if (error) {
    return (
      <ErrorState
        title="Record not found"
        description={error}
        onRetry={() => router.push("/history")}
        retryLabel="Back to history"
      />
    );
  }

  if (!record) {
    return <LoadingState label="Loading this record" rows={1} />;
  }

  const onDelete = async () => {
    setDeleting(true);
    const result = await deleteRecord(record.id);
    if (!result.ok) {
      setError(result.error.message);
      setDeleting(false);
      return;
    }
    router.push("/history");
  };

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Breadcrumb" className="text-small">
        <Link
          href="/history"
          className="text-ink-3 underline-offset-2 hover:text-ink hover:underline"
        >
          History
        </Link>
        <span aria-hidden="true" className="mx-2 text-ink-4">
          /
        </span>
        <span className="text-ink-2">Record</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        <figure className="flex flex-col gap-3">
          <div className="aspect-4/3 overflow-hidden rounded-lg border border-line bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.imageUrl}
              alt="The animal in this identification record"
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="text-micro text-ink-3">
            {record.imageWidth} × {record.imageHeight}
          </figcaption>
        </figure>

        <div className="flex flex-col gap-8">
          {/* This result is the subject of the page, so it owns the h1. */}
          <PredictionResult prediction={record.prediction} headingLevel="h1" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6">
            <div>
              <dt className="text-micro uppercase tracking-[0.14em] text-ink-3">
                Recorded
              </dt>
              <dd className="mt-1 text-small text-ink-2">
                {new Date(record.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-micro uppercase tracking-[0.14em] text-ink-3">
                Model version
              </dt>
              <dd className="mt-1 text-small text-ink-2">
                {record.prediction.modelVersion}
              </dd>
            </div>
            <div>
              <dt className="text-micro uppercase tracking-[0.14em] text-ink-3">
                Location
              </dt>
              <dd className="mt-1 text-small text-ink-2">
                {record.location ? (
                  <span data-numeric="">
                    {record.location.latitude.toFixed(4)},{" "}
                    {record.location.longitude.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-ink-3">Not captured</span>
                )}
              </dd>
            </div>
            {record.duplicateOf ? (
              <div className="col-span-2">
                <dt className="text-micro uppercase tracking-[0.14em] text-ink-3">
                  Duplicate check
                </dt>
                <dd className="mt-1 text-small text-ink-2">
                  {record.duplicateOf.tier === "same"
                    ? "When saved, this looked like the same photo as "
                    : "When saved, this was very similar to "}
                  <Link
                    href={`/history/${record.duplicateOf.id}`}
                    className="font-medium text-forest underline underline-offset-2"
                  >
                    an earlier record
                  </Link>
                  . It compares pictures, not animals.
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-micro uppercase tracking-[0.14em] text-ink-3">
                Storage
              </dt>
              <dd className="mt-1 text-small text-ink-2">
                {SYNC_LABEL[record.syncState]}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/identify" size="lg">
              Identify another
            </ButtonLink>
            <ButtonLink
              href={`/breeds/${record.prediction.breedId}`}
              size="lg"
              variant="secondary"
            >
              View breed
            </ButtonLink>
          </div>

          <div className="border-t border-line pt-6">
            {confirming ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-small text-ink-2">
                  Delete this record permanently?
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => setConfirming(false)}
                >
                  Keep it
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirming(true)}
              >
                Delete record
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
