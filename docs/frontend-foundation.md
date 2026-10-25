# Frontend Design Foundation (Phase A)

**Status:** Complete and verified in a browser. Live reference at `/foundation`.

---

## 1. Stack decision, and a conflict to resolve

The original project spec named **React Native / Expo** for the frontend. This
brief describes a **web application** — landing page, public breed library,
sign-in, admin dashboard, "desktop / tablet / mobile". Those are different
codebases; React Native cannot render a public landing page in a browser.

Built as a web app: **Next.js 16.3.1, React 19.2, TypeScript 5, Tailwind v4.**

The mobile field app remains a separate future target. To keep that cheap,
`src/design/tokens.ts` mirrors the whole visual system as plain values with no
CSS or DOM dependency, so an Expo app can import the same palette, type scale
and spacing without a rewrite. **If the intent was React Native all along, say
so — the tokens survive and only the component layer is rebuilt.**

Location: `web/`. This supersedes the `dashboard/` directory from the Phase 0
layout; admin screens become a route group inside this app rather than a
separate deployment, which avoids duplicating auth, tokens and the service
layer.

## 2. Colour

Warm paper and charcoal carry the interface. **Forest green appears only on the
primary action and the confident state** — it is deliberately not the ambient UI
colour, so it still means something where it appears.

| Role | Token | Value |
|---|---|---|
| Page background | `paper` | `#faf7f1` |
| Recessed well | `paper-sunk` | `#f2eee5` |
| Raised surface | `surface` | `#ffffff` |
| Quiet fill | `cream` | `#ede7d9` |
| Primary text | `ink` | `#1a1917` |
| Secondary text | `ink-2` | `#46433c` |
| Supporting text | `ink-3` | `#6b665c` |
| Placeholder / disabled | `ink-4` | `#756f62` (not for text on `paper-sunk`) |
| Decorative divider | `line` / `line-strong` | `#e3dcce` / `#cfc6b3` |
| Form control boundary | `field-line` | `#94876d` |
| Primary action | `forest` | `#347453` |
| Hover / text on tints | `forest-deep` | `#276046` |
| Confident meter fill (never text) | `forest-mid` | `#3a7f5b` |
| Accent | `terracotta` | `#a4512b` |
| Uncertain | `amber` | `#8a6614` |
| Low confidence, error | `clay` | `#8f3a22` |

Charcoal is never pure black. The confidence ramp is earthy rather than the
usual green/yellow/red traffic light.

### Decorative vs functional borders

`line` and `line-strong` are decorative — card edges and dividers, exempt from
WCAG 1.4.11. `field-line` bounds actual form controls, where the border *is*
what identifies the input, so it must clear 3:1. **Do not swap them.** This
split came directly out of the contrast audit in §6.

## 3. Typography

Inter, one typeface. Hierarchy comes from size and weight, never from colour or
from wrapping things in boxes.

| Step | Size | Use |
|---|---|---|
| `display` | 40 → 64px fluid | Hero only |
| `section` | 30 → 40px fluid | Section headings |
| `title` | 26 → 36px fluid | Page and card titles |
| `lead` | 18px | Standfirst paragraphs |
| `body` | 16px | Default |
| `small` | 14px | Meta, captions |
| `micro` | 13px | Uppercase labels |

Display, section and title are `clamp()`-based, so they scale continuously
rather than jumping at breakpoints. Numeric data carries `data-numeric`, which
applies tabular figures so confidence values don't jitter as they change.

## 4. Restraint rules

These exist because the brief explicitly rejects generic AI-template styling:

- **Radii cap at 8px.** Scale is 2/3/5/8. Nothing is a pill except small tags.
- **Two elevation levels only**, both warm-tinted. `raised` is reserved for
  content that genuinely floats.
- **`Card` defaults to a single hairline**, and a `plain` variant exists
  precisely so editorial layouts can avoid a container. Reach for `plain` first.
- **No gradients, no glassmorphism, no glow.** The only backdrop filter is the
  sticky header's blur.
- **Motion is 120–260ms and state-carrying only.** A global
  `prefers-reduced-motion` rule disables it.

## 5. Components built

| Area | Components |
|---|---|
| `ui/` | `Button`, `ButtonLink`, `Badge`, `Eyebrow`, `Card`, `CardHeader`, `Field`, `Input`, `Textarea`, `Select`, `Skeleton`, `Logo` |
| `layout/` | `Container` (5 widths), `Section`, `SectionHeading`, `Rule` |
| `navigation/` | `SiteHeader` (responsive, real mobile menu), `SiteFooter` |
| `states/` | `EmptyState`, `ErrorState`, `LoadingState` |
| `prediction/` | `ConfidenceIndicator` |

### ConfidenceIndicator

The most product-specific component in the foundation. It communicates through
**three redundant channels** — a written band label, a segmented fill, and the
number — so the reading never depends on colour alone. That is an accessibility
requirement and a trust requirement: an officer must be able to tell a strong
result from a weak one at a glance and be right.

Banding lives in `src/lib/confidence.ts`, which also owns the rule that
**`uncertain` and `low` bands may not assert a single breed**. The result screen
in Phase B reads `assertsBreed` from there rather than re-deciding.

> **The thresholds are derived, not placeholders** (0.85 confident, 0.30 low),
> from validation data via `ml/training/calibrate.py`. `/foundation` states
> their basis. They are not yet confirmed on the held-out test split, and the UI
> does not present them as a validated accuracy guarantee.

## 6. Verification

Checked in a real browser at 375px and desktop widths, not assumed from code.

**Contrast — computed from rendered values, WCAG AA:**

| Pair | Ratio | Required | Result |
|---|---|---|---|
| `ink` on `paper` | 16.43 | 4.5 | pass |
| `ink-2` on `paper` | 9.23 | 4.5 | pass |
| `ink-3` on `paper` | 5.34 | 4.5 | pass |
| `ink-4` placeholder on `surface` | 4.99 | 4.5 | pass *(was 3.39 — fixed)* |
| `paper` on `forest` (primary button) | 5.21 | 4.5 | pass *(see §9)* |
| `forest-deep` confident label on `surface` | 7.37 | 4.5 | pass |
| `amber` uncertain on `amber-soft` | 4.56 | 4.5 | pass |
| `clay` low on `clay-soft` | 6.40 | 4.5 | pass |
| `terracotta` on `paper` | 5.18 | 4.5 | pass |
| `field-line` control border on `surface` | 3.53 | 3.0 | pass *(new token)* |

**Other checks:**

- Touch targets: `lg` 52px, `md` 44px, inputs 44px — all clear the 44px minimum.
- No horizontal overflow at 375px; zero elements exceed the viewport.
- Fluid type resolves correctly (h1 = 40px at 375px, 48.6px at mid-width).
- Mobile menu opens and closes, `aria-expanded` and the screen-reader label
  both track state.
- Zero console errors. `tsc --noEmit` clean, `eslint --max-warnings=0` clean,
  production build succeeds with all routes static.

### Three real defects found and fixed

1. **RSC boundary violation.** `Field` used a render prop, which cannot cross
   the server/client boundary — the production build failed. Rebuilt on React
   context, which is a better API anyway: `<Field><Input /></Field>`.
2. **Placeholder contrast failed** at 3.39:1. `ink-4` darkened to `#756f62`.
3. **React anti-pattern.** The mobile menu closed via `setState` inside an
   effect. Replaced with the adjust-state-during-render pattern.

## 7. Not built in Phase A

Phase A built the shell only. The landing page, identify flow, breed library
and history arrived in Phases B–D; the dashboard is Phase E.

The `/login`, `/about` and `/how-it-works` links that Phase A left in the nav
were later **removed** rather than built, because they returned 404 — see §10.

## 8. Breed data (resolved)

At the time of Phase A there was no breed data at all. The dataset has since
been obtained and processed: the library now carries the **49 real class names**
generated from `class_mapping.json`. Descriptions, regions and photographs are
still absent by design — see `frontend-app.md`.

Breed *names* are verifiable public fact and can be used. Breed *descriptions*
must not be invented; they need ICAR-NBAGR sourcing, and the `Breed` type
already carries `source` / `sourceUrl` fields with the rule that a null source
means the UI says so rather than presenting the text as established fact.

## 9. Palette revision — lighter green

The original `forest` was `#1e4634`, close to black. It was lightened to
`#347453` at the user's request. Each step of the ramp was re-verified for the
job it actually does rather than lightened uniformly:

| Token | Value | Role | Measured |
|---|---|---|---|
| `forest` | `#347453` | primary action, and text on paper | 5.21:1 both ways |
| `forest-deep` | `#276046` | hover/pressed, text on tints | 6.90:1 on paper |
| `forest-mid` | `#3a7f5b` | meter fill — **never text** | 3.90:1 on the cream track |
| `forest-soft` | `#eaf4ec` | tint background | 6.55:1 with `forest-deep` |

`#347453` is the lightest green that still clears AA in both directions with
margin. The next step up (`#3a7f5b`) lands exactly on 4.50 and the one after
fails outright, so this is the practical limit for a green that must carry both
white text and dark text.

`forest-mid` is fill-only by design. It fails AA as text, so anything textual on
a green tint must use `forest-deep`.

### A latent bug this surfaced

Re-measuring the *rendered* button — rather than the tokens — exposed a defect
that had been present since Phase A: the primary button was rendering charcoal
text on green at **3.15:1**, failing AA.

`tailwind-merge` cannot classify project-defined `text-*` utilities. `text-lead`
is a font size and `text-paper` is a colour, but both are custom, so it treated
them as one conflict group and kept only the last — silently stripping the text
colour from every button.

`src/lib/cn.ts` now declares both class groups explicitly via
`extendTailwindMerge`. Add new token names there whenever the scales in
`globals.css` change.

**The lesson generalises:** verifying token values is not the same as verifying
what the browser paints. The Phase A audit computed contrast from the palette
and passed; the bug lived in the class merge between the token and the pixel.
Contrast is now measured from `getComputedStyle` on real elements, with alpha
composited through ancestors and `color(srgb …)` normalised through a canvas.

### Current state

Audited across the design reference and the landing page: **76 distinct
foreground/background/size combinations, zero AA failures.** One genuine issue
was found and fixed on the way — `ink-4` on `paper-sunk` measured 4.31:1, so
that footer label now uses `ink-3`.

## 10. Removals

Things deleted because they did not work or did nothing:

- **Header nav links to `/how-it-works` and `/about`** — both returned 404.
  "How it works" exists as a section on the home page, not a route.
- **"Sign in" links** (desktop and mobile) — `/login` returned 404 and there is
  no authentication yet.
- **The entire footer "Project" column** — every link in it (`/about`,
  `/about#limitations`, `/about#model`) returned 404.
- **`MOCK_RECORDS`** — an exported constant with no consumers.
- **`--shadow-raise`** — a defined elevation token used nowhere. The system has
  one shadow level; everything else uses a hairline border.

Every remaining link on the landing page resolves to a real route.
`/foundation` is kept: it is `noindex`, linked from nowhere, and is the
working reference for the design system.

## 11. Running it

```bash
cd web && npm run dev
```

Design system reference: `http://localhost:3000/foundation`


---
