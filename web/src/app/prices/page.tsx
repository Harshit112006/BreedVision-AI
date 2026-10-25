import type { Metadata } from "next";

import { Container, Section } from "@/components/layout/Container";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SalesWorkspace } from "@/components/prices/SalesWorkspace";
import { ValueCalculator } from "@/components/prices/ValueCalculator";

export const metadata: Metadata = {
  title: "Value and sale prices",
  description:
    "Compare animals by relative value and log real sale prices to build a price reference.",
};

export default function PricesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section spacing="tight">
          <Container width="wide">
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Value and sale prices
            </h1>
            <p className="mt-2 max-w-xl text-body text-ink-2 text-pretty">
              No verified livestock price series exists for these breeds, so this
              page does not quote prices. It ranks animals by what published
              research says drives value, and it collects real sale prices.
            </p>
            <div className="mt-8 flex flex-col gap-10">
              <ValueCalculator />
              <SalesWorkspace />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
