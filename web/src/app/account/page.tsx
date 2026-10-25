import type { Metadata } from "next";

import { AccountPanel } from "@/components/account/AccountPanel";
import { Container, Section } from "@/components/layout/Container";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { SiteHeader } from "@/components/navigation/SiteHeader";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Section spacing="tight">
          <Container width="narrow">
            <h1 className="text-title font-semibold tracking-tight text-ink">Account</h1>
            <p className="mt-2 max-w-xl text-body text-ink-2 text-pretty">
              Everything works without an account. Signing in adds cloud backup
              and a duplicate-photo check across accounts.
            </p>
            <div className="mt-8">
              <AccountPanel />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
