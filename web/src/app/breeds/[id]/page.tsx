import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreedImage } from "@/components/breed/BreedImage";
import { SourceNotice } from "@/components/breed/SourceNotice";
import { Container, Section } from "@/components/layout/Container";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getBreed, getBreeds } from "@/services/breeds";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const result = await getBreeds();
  return result.ok ? result.data.map((b) => ({ id: b.id })) : [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getBreed(id);
  if (!result.ok) return { title: "Breed not found" };
  return {
    title: result.data.name,
    description: `${result.data.name} — an Indian ${result.data.category} breed${
      result.data.region ? ` from ${result.data.region}` : ""
    }.`,
  };
}

export default async function BreedDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getBreed(id);
  if (!result.ok) notFound();

  const breed = result.data;

  const relatedResult = await getBreeds();
  const related = relatedResult.ok
    ? relatedResult.data.filter((b) => breed.relatedBreedIds.includes(b.id))
    : [];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section spacing="tight">
          <Container>
            <nav aria-label="Breadcrumb" className="text-small">
              <Link
                href="/breeds"
                className="text-ink-3 underline-offset-2 hover:text-ink hover:underline"
              >
                Breed library
              </Link>
              <span aria-hidden="true" className="mx-2 text-ink-4">
                /
              </span>
              <span className="text-ink-2">{breed.name}</span>
            </nav>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
              <div className="aspect-4/3 w-full overflow-hidden rounded-lg border border-line">
                <BreedImage
                  name={breed.name}
                  category={breed.category}
                  imageUrl={breed.imageUrl}
                  size="hero"
                />
              </div>

              <div>
                <Badge
                  tone={breed.category === "buffalo" ? "terracotta" : "neutral"}
                >
                  {breed.category === "buffalo" ? "Buffalo" : "Cattle"}
                </Badge>
                <h1 className="mt-3 text-display font-semibold tracking-tight text-ink">
                  {breed.name}
                </h1>

                <dl className="mt-7 flex flex-col gap-5 border-t border-line pt-6">
                  <div>
                    <dt className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-3">
                      Home tract
                    </dt>
                    <dd className="mt-1 text-body text-ink">
                      {breed.region ?? (
                        <span className="text-ink-3">Not yet recorded</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-3">
                      Category
                    </dt>
                    <dd className="mt-1 text-body text-ink">
                      Indian {breed.category}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <ButtonLink href="/identify" size="lg">
                    Identify an animal
                  </ButtonLink>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------ description */}
            <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
              <section>
                <h2 className="text-title font-semibold tracking-tight text-ink">
                  About this breed
                </h2>
                <div className="mt-5">
                  {breed.description ? (
                    <p className="max-w-prose text-body text-ink-2 text-pretty">
                      {breed.description}
                    </p>
                  ) : (
                    <SourceNotice
                      source={breed.source}
                      sourceUrl={breed.sourceUrl}
                    />
                  )}
                </div>

                <h3 className="mt-10 text-body font-semibold text-ink">
                  Distinguishing characteristics
                </h3>
                {breed.characteristics.length > 0 ? (
                  <dl className="mt-4 divide-y divide-line border-y border-line">
                    {breed.characteristics.map((c) => (
                      <div
                        key={c.label}
                        className="grid grid-cols-[10rem_1fr] gap-4 py-3"
                      >
                        <dt className="text-small text-ink-3">{c.label}</dt>
                        <dd className="text-small text-ink">{c.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-small text-ink-3 text-pretty">
                    Not yet recorded. Characteristics will be added from
                    ICAR-NBAGR records rather than written from memory.
                  </p>
                )}
              </section>

              {/* -------------------------------------------------- related */}
              <aside>
                <h2 className="text-body font-semibold text-ink">
                  Related breeds
                </h2>
                {related.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-3">
                    {related.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/breeds/${r.id}`}
                          className="flex items-center gap-3 rounded-md border border-line bg-surface p-3 transition-colors hover:border-field-line"
                        >
                          <span className="h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                            <BreedImage
                              name={r.name}
                              category={r.category}
                              imageUrl={r.imageUrl}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-small font-medium text-ink">
                              {r.name}
                            </span>
                            <span className="block truncate text-micro text-ink-3">
                              {r.region ?? "Home tract not recorded"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Card variant="sunk" className="mt-4">
                    <p className="text-small text-ink-3">
                      No related breeds recorded yet.
                    </p>
                  </Card>
                )}
              </aside>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
