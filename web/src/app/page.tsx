import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { ProductVisual } from "@/components/marketing/ProductVisual";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

const STEPS = [
  {
    n: "01",
    title: "Capture",
    body: "Photograph the animal on a phone, or upload an image you already have.",
  },
  {
    n: "02",
    title: "Analyse",
    body: "The image is resized and passed to a computer-vision model.",
  },
  {
    n: "03",
    title: "Identify",
    body: "The model returns a predicted breed and how confident it is.",
  },
  {
    n: "04",
    title: "Record",
    body: "Keep the result, with time and optional location, as a record.",
  },
];

const PROBLEMS = [
  {
    title: "It depends on who is looking",
    body: "Breed assessment in the field rests on individual experience. Two assessors can reach two conclusions about the same animal.",
  },
  {
    title: "Expertise is not evenly available",
    body: "The people best able to identify a breed are not always the people standing in front of the animal.",
  },
  {
    title: "Records are hard to standardise",
    body: "Without a consistent method, breed data collected across districts is difficult to compare or aggregate.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ------------------------------------------------------------ hero */}
        <Section spacing="loose" className="pb-16 sm:pb-20">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
              <div>
                <p className="text-micro font-semibold uppercase tracking-[0.16em] text-ink-3">
                  BreedVision
                </p>
                <h1 className="mt-5 text-display font-semibold tracking-tight text-balance text-ink">
                  Identify the breed. Keep a record that holds up.
                </h1>
                <p className="mt-6 max-w-lg text-lead text-ink-2 text-pretty">
                  Image-based breed identification for Indian cattle.
                  Photograph an animal and get a predicted breed, a
                  confidence score, and the alternatives worth considering.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <ButtonLink href="/identify" size="lg">
                    Identify an animal
                  </ButtonLink>
                  <ButtonLink href="/breeds" size="lg" variant="secondary">
                    Explore breeds
                  </ButtonLink>
                </div>
                <p className="mt-8 max-w-md text-small text-ink-3 text-pretty">
                  A research prototype. Predictions are advisory and are meant to
                  support a qualified assessor, not replace one.
                </p>
              </div>

              <ProductVisual className="lg:ml-auto lg:max-w-md" />
            </div>
          </Container>
        </Section>

        {/* --------------------------------------------------------- problem */}
        <Section tone="sunk">
          <Container>
            <SectionHeading
              eyebrow="The problem"
              title="Identifying a breed by eye is harder to standardise than it looks"
              description="Breed identification underpins livestock records, breeding decisions and scheme eligibility. In practice it is done visually, in the field, under time pressure."
            />
            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {PROBLEMS.map((p) => (
                <div key={p.title} className="border-t border-line-strong pt-5">
                  <h3 className="text-body font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-small text-ink-2 text-pretty">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------- how it works */}
        <Section>
          <Container>
            <SectionHeading
              eyebrow="How it works"
              title="Four steps, start to record"
            />

            <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.n} className="relative">
                  {/* Connector: drawn only between steps on wide screens. */}
                  {i < STEPS.length - 1 ? (
                    <span
                      aria-hidden="true"
                      // Starts at the dot's centre and spans the 2rem column
                      // gap, so the line reads as continuous across all four.
                      className="absolute left-2.5 top-2.5 hidden h-px w-[calc(100%+2rem)] bg-line-strong lg:block"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="relative block h-5 w-5 rounded-full border-2 border-forest bg-paper"
                  />
                  <p
                    data-numeric=""
                    className="mt-5 text-micro font-semibold tracking-[0.14em] text-forest"
                  >
                    {s.n}
                  </p>
                  <h3 className="mt-1.5 text-title font-semibold tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-small text-ink-2 text-pretty">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        {/* -------------------------------------------------- product preview */}
        <Section tone="sunk">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
              <ProductVisual className="order-2 lg:order-1 lg:max-w-md" />

              <div className="order-1 lg:order-2">
                <SectionHeading
                  eyebrow="The result"
                  title="An answer you can weigh, not just accept"
                  description="Every identification states how confident the model is. When it is not confident, it says so rather than presenting a guess as a finding."
                />
                <dl className="mt-10 flex flex-col gap-7">
                  {[
                    {
                      t: "Confidence is always visible",
                      d: "Shown as a written status, a meter and a number — never colour alone.",
                    },
                    {
                      t: "Alternatives are shown",
                      d: "The next most likely breeds, so a knowledgeable user can apply judgement.",
                    },
                    {
                      t: "Uncertainty is stated plainly",
                      d: "Below the threshold, the result is “identification uncertain”, not a breed name.",
                    },
                  ].map((f) => (
                    <div key={f.t} className="border-t border-line-strong pt-4">
                      <dt className="text-body font-semibold text-ink">{f.t}</dt>
                      <dd className="mt-1.5 text-small text-ink-2 text-pretty">
                        {f.d}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </Section>

        {/* ------------------------------------------------------------- cta */}
        <Section spacing="tight">
          <Container width="text">
            <div className="flex flex-col items-start gap-6 border-t border-line pt-14 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-title font-semibold tracking-tight text-ink">
                  Try it on a photo
                </h2>
                <p className="mt-2 text-body text-ink-2">
                  No account needed to run an identification.
                </p>
              </div>
              <ButtonLink href="/identify" size="lg" className="shrink-0">
                Identify an animal
              </ButtonLink>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
