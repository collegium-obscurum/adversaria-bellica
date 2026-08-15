# Adversaria Bellica

Monster card builder for DSA5 game masters. Build enemy cards with simplified stat blocks, keep them in a library, and print them as A6 cards, four per A4 sheet. German UI, runs entirely in the browser (SvelteKit static build, cards live in localStorage, no backend and no account).

## Features

### Editing

- **On-card editor**: cards are edited directly on the card preview, no separate form. Fields are live inputs styled as printed text. The portrait circle opens an image cropper (circle cutout, stored as a data URL).
- **Layout** inspired by Aventuria monster cards: portrait top left, stats as icon badges along the right edge, d20 table as running text. Two card styles (printer-friendly minimal and ornate Aventuria look) and a toggle between stat icons and text labels.
- **Everything optional**: banner, flavour text, talents, wound thresholds, special moves, notes and each single stat badge carry their own hidden flag. Hiding keeps the value, so a section can come back without retyping it.
- **Stats**: LeP, RS, VW, GS, SK, ZK, GK, INI and actions per round. All of them take free text, not just numbers.
- **Creature type** picker with the DSA types, the categories already used in the library, plus free input.
- **d20 action table**: one roll decides each enemy turn. Rows store a span and always partition 1 to 20 in list order, so the table can never be invalid. Editing a range end reflows the neighbours, the last row reads "20+" because penalties can push a roll past 20. Rows can be added, drag-reordered, colour-tagged, and marked as usable for a Passierschlag (sword icon).
- **Talents** as the 5 talent groups (1W20 variant), each with value and max QS. The sidebar calculator derives both from the card's 8 attributes and the group's FW, and flags when the printed values drift from the derived ones.
- **Wound thresholds** as cumulative damage numbers, filled from LeP and left alone once edited by hand. **Special moves** per trigger: Kampfbeginn, the three Schmerz steps, Tod, or a free-text trigger.
- **Auto-fit**: text scales down in 5 % steps to 70 % to make the content fit the printed card, and drops the portrait as a last resort before clipping. The editor shows what happened, the library tile flags cards that still overflow.

### Library and printing

- **Library** with search, category and banner filters, alphabetical sort, duplicate, delete, view dialog, and JSON import/export. Old export formats are migrated on import.
- **Samples**: a set of ready-made Goblin cards, copyable into your own library.
- **Print sheet**: pick cards, print 4 A6 cards per A4 page. Optional card backs (default artwork or your own image) go on alternating pages with mirrored slots, so long-edge duplex printing lines up.
- **Download**: a single card as PNG, PDF or JSON from the editor, the whole sheet as PDF from the print page. Raster export runs at 300 DPI.

## Commands

```sh
npm run dev       # dev server on :5173
npm test          # vitest unit tests
npm run test:e2e  # playwright, builds and previews on :4173
npm run check     # svelte-check (type checking)
npm run lint      # eslint (strict, type-aware) + prettier check
npm run format    # prettier write
npm run build     # static production build
npm run preview   # serve the build on :4173
```

## Deploy

Pushes to `main` run lint, check, unit tests and the Playwright suite, build with `BASE_PATH=/<repo-name>`, and deploy to GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Code layout

- `src/lib/domain/`: pure logic and types (card model, d20 span partition, wound thresholds, talent calculation, print layout, fit ladder, migrations), tests alongside as `*.test.ts`
- `src/lib/components/card/`: the card itself. `CardPreview.svelte` is the shell, section components (CardHeader, ActionTable, TalentRow, SpecialMoves, StatBadges) render one section each, edit and print variant in one component
- `src/lib/components/`: everything around the card (image cropper, talent calculator, options and download menus, view dialog)
- `src/lib/state/`: localStorage-backed state modules (card storage, preferences, card back)
- `src/lib/data/`: the bundled sample cards as JSON
- `src/routes/`: library (`/`), editor (`/editor`), print sheet (`/print`)
- `tests/`: Playwright specs and fixtures

## Storage

Everything sits in localStorage under the `adversaria-bellica.` prefix: `cards` (the card array), `cardStyle`, `statLabelMode`, `printImages`, `colorMode`, and `cardBack.enabled` / `.mode` / `.image`. Clearing site data deletes your cards, so export the JSON before you do. Cards written by older versions are migrated on load and on import.
