# Adversaria Bellica

Monster card builder for DSA5 game masters. Build enemy cards with simplified stat blocks, manage them in a library, and print them as A6 cards, four per A4 sheet. German UI, runs entirely in the browser (SvelteKit static build, cards live in localStorage).

## Features

- **On-card editor**: cards are edited directly on the card preview, no separate form. Fields are live inputs styled as printed text; the portrait circle opens an image cropper (circle cutout, stored as data URL).
- **Layout** inspired by Aventuria monster cards: portrait top left, all 8 stats (LeP, RS, INI, GS, VW, SK, ZK, actions) as icon badges along the right edge, d20 table as running text. Two card styles (printer-friendly minimal and ornate Aventuria look) and a toggle between stat icons and text labels.
- **Creature type** picker with the DSA types plus free custom input; stats accept free text alongside numbers.
- **d20 action table**: one roll decides each enemy turn. Rows always partition 1–20 in list order (the last range ends at 20+); both range ends are editable and neighbouring rows reflow automatically, so the table can never be invalid. Rows can be added and drag-reordered. Default rows: heavy attack on 2–6, normal attack on 7–15.
- **Talents** as the 5 talent groups (1W20-Probe variant), each with value and max QS. The editor sidebar has a talent value calculator with the group's attribute formula.
- **Wound thresholds** shown as cumulative damage numbers, computed from LeP. Optional special moves (name + effect) per trigger: Kampfbeginn, 75/50/25% LeP, Tod, or a custom trigger. Free-text notes section on the card.
- **Library** with search, category filter, duplicate, and JSON import/export. Old export formats are migrated on import.
- **Print sheet**: select cards, print 4 A6 cards per A4 page.
- **Download**: export a single card as PNG or PDF from the editor.

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

- `src/lib/domain/` — pure logic and types (card model, d20 range partition, wound thresholds, migrations, ...), tests alongside as `*.test.ts`
- `src/lib/components/card/` — the card: `CardPreview.svelte` is the shell, section components (CardHeader, ActionTable, TalentRow, SpecialMoves, StatBadges) render one section each, editable and print variant in one component
- `src/lib/components/` — everything around the card: image cropper, talent calculator, style and label toggles, download menu
- `src/lib/state/` — localStorage-backed state modules (card storage, UI preferences)
- `src/routes/` — library (`/`), editor (`/editor`), print sheet (`/print`)
