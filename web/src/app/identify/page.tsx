import type { Metadata } from "next";

import { IdentifyFlow } from "@/components/identify/IdentifyFlow";
import { Container, Section } from "@/components/layout/Container";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";

export const metadata: Metadata = {
  title: "Identify an animal",
  description:
    "Photograph or upload an image of cattle or buffalo to get a predicted breed with a confidence score.",
};

export default function IdentifyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section spacing="tight">
          <Container width="text">
            <h1 className="text-title font-semibold tracking-tight text-ink">
              Identify an animal
            </h1>
            <p className="mt-2 max-w-lg text-body text-ink-2 text-pretty">
              One clear photo is enough. You will see the predicted breed, how
              confident the model is, and the next most likely alternatives.
            </p>
            <div className="mt-8">
              <IdentifyFlow />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
