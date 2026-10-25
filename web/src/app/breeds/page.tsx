import type { Metadata } from "next";

import { BreedLibrary } from "@/components/breed/BreedLibrary";
import { Container, Section } from "@/components/layout/Container";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { ErrorState } from "@/components/states";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { getBreeds } from "@/services/breeds";

export const metadata: Metadata = {
  title: "Breed library",
  description:
    "Browse Indian cattle breeds covered by BreedVision.",
};

export default async function BreedsPage() {
  const result = await getBreeds();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section spacing="tight">
          <Container>
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Breed library
            </h1>
            <p className="mt-2 max-w-xl text-body text-ink-2 text-pretty">
              Indian cattle breeds the system is being built to
              recognise. Search by breed or region.
            </p>

            <MockDataNotice
              className="mt-6"
              what="Breed names and regions are genuine; descriptions are withheld until verified."
            />

            <div className="mt-8">
              {result.ok ? (
                <BreedLibrary breeds={result.data} />
              ) : (
                <ErrorState
                  title="The breed library could not be loaded"
                  description={result.error.message}
                />
              )}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
