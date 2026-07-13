# Adversaria Bellica

Monster card builder for DSA5 game masters. Build enemy cards with simplified stat blocks, manage them in a library, and print them as A6 cards, four per A4 sheet. German UI, runs entirely in the browser (SvelteKit static build, cards live in localStorage).

## Features

- **On-card editor**: cards are edited directly on the card preview, no separate form. Fields are live inputs styled as printed text; the portrait circle opens an image cropper (circle cutout, stored as data URL).
- **Layout** inspired by Aventuria monster cards: portrait top left, all 8 stats (LeP, RS, INI, GS, VW, SK, ZK, actions) as icon badges along the right edge, d20 table as running text.
- **d20 action table**: one roll decides each enemy turn. Rows always partition 1–20 in list order; both range ends are editable and neighbouring rows reflow automatically, so the table can never be invalid. Rows can be added and drag-reordered.
- **Talents** as the 5 talent groups (1W20-Probe variant), each with value and max QS.
- **Wound thresholds** shown as cumulative damage numbers, computed from LeP. Optional special moves (name + effect) per trigger: Kampfbeginn, 75/50/25% LeP, Tod.
- **Library** with search, category filter, duplicate, and JSON import/export. Old export formats are migrated on import.
- **Print sheet**: select cards, print 4 A6 cards per A4 page.

## Commands

```sh
npm run dev      # dev server
npm test         # vitest unit tests
npm run check    # svelte-check (type checking)
npm run lint     # eslint (strict, type-aware) + prettier check
npm run format   # prettier write
npm run build    # static production build
```

## Deploy

Pushes to `main` run tests, build with `BASE_PATH=/<repo-name>`, and deploy to GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Code layout

- `src/lib/types.ts` — card data model
- `src/lib/actions.ts` — d20 range partition logic (spans, reflow, reorder)
- `src/lib/migrations.ts` — schema migrations for stored/imported cards
- `src/lib/CardPreview.svelte` — the card, static render and editable mode in one component
- `src/routes/` — library (`/`), editor (`/editor`), print sheet (`/print`)
