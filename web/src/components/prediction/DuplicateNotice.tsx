import Link from "next/link";

import type { DuplicateMatch } from "@/services/duplicates";

/**
 * Says what was found and what it does not mean. The check compares photos, not
 * animals, so the wording never claims two photos show the same animal.
 */
export function DuplicateNotice({ match }: { match: DuplicateMatch }) {
  const when = new Date(match.createdAt).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
  const same = match.tier === "same";

  return (
    <div
      role="status"
      className="rounded-md border border-amber/30 bg-amber-soft px-4 py-3"
    >
      <p className="text-small text-ink-2">
        <strong className="font-semibold text-amber">
          {same ? "This looks like the same photo" : "This photo is very similar"}
        </strong>{" "}
        {same ? "as" : "to"} one you saved on {when}.{" "}
        <Link
          href={`/history/${match.recordId}`}
          className="font-medium text-forest underline underline-offset-2"
        >
          View that record
        </Link>
        .
      </p>
      <p className="mt-1 text-micro text-ink-3">
        This compares pictures only. It cannot tell whether two different photos
        show the same animal, and it can miss heavily cropped or rotated copies.
        You can still save this record.
      </p>
    </div>
  );
}
