import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BreedVision AI — Breed identification for Indian livestock",
    template: "%s — BreedVision AI",
  },
  description:
    "Image-based breed identification for Indian cattle and buffaloes. Photograph an animal, get a predicted breed with a confidence score, and keep a record.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f1",
  // Field users need to be able to zoom into an animal photo.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-small focus:font-medium focus:shadow-[var(--shadow-float)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
