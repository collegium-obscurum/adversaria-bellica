import { expect, test } from '@playwright/test';
import { seedCards, seedRaw, storedCards } from './helpers';

test('empty library shows onboarding', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Noch keine Gegner in der Bibliothek.')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Erste Karte anlegen' })).toBeVisible();
});

test('search and category filter narrow the tiles', async ({ page }) => {
	await seedCards(page, [
		{ id: 'g1', name: 'Goblin', category: 'Humanoide' },
		{ id: 'd1', name: 'Drache', category: 'Drachen' }
	]);
	const tiles = page.locator('.cards li');
	await expect(tiles).toHaveCount(2);

	await page.getByLabel('Suche nach Name').fill('Gob');
	await expect(tiles).toHaveCount(1);
	await expect(tiles.first()).toContainText('Goblin');

	await page.getByLabel('Suche nach Name').fill('');
	await page.getByLabel('Nach Typ filtern').selectOption('Drachen');
	await expect(tiles).toHaveCount(1);
	await expect(tiles.first()).toContainText('Drache');
});

test('duplicate creates a persisted copy', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.getByRole('button', { name: 'Duplizieren' }).click();
	await expect(page.locator('.cards li', { hasText: 'Goblin (Kopie)' })).toBeVisible();

	await page.reload();
	await expect(page.locator('.cards li')).toHaveCount(2);
	expect(await storedCards(page)).toHaveLength(2);
});

test('delete removes the card after confirmation', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	page.once('dialog', (dialog) => void dialog.accept());
	await page.getByRole('button', { name: 'Löschen' }).click();
	await expect(page.getByText('Noch keine Gegner in der Bibliothek.')).toBeVisible();
	expect(await storedCards(page)).toHaveLength(0);
});

test('view dialog shows the card', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.getByRole('button', { name: 'Goblin ansehen' }).click();
	const dialog = page.locator('dialog.view-dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.locator('article.card')).toBeVisible();
	await dialog.getByRole('button', { name: 'Schließen' }).click();
	await expect(dialog).toBeHidden();
});

test('sample card can be copied into the library', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Vorlagen ansehen' }).click();
	const firstTile = page.locator('.cards li').first();
	await firstTile.getByRole('button', { name: 'In Bibliothek kopieren' }).click();
	await expect(firstTile.getByText('Kopiert ✓')).toBeVisible();

	await page.getByRole('button', { name: 'Eigene', exact: true }).click();
	await expect(page.locator('.cards li')).toHaveCount(1);
	expect(await storedCards(page)).toHaveLength(1);
});

test('export downloads the library as JSON', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export (JSON)' }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('adversaria-bellica-karten.json');
});

test('banner filter and the "ohne" options work', async ({ page }) => {
	await seedCards(page, [
		{ id: 'g1', name: 'Goblin', category: 'Humanoide', banner: 'Horde' },
		{ id: 'd1', name: 'Drache', category: 'Drachen' },
		{ id: 's1', name: 'Skelett' }
	]);
	const tiles = page.locator('.cards li');

	await page.getByLabel('Nach Banner filtern').selectOption('Horde');
	await expect(tiles).toHaveCount(1);
	await expect(tiles.first()).toContainText('Goblin');

	await page.getByLabel('Nach Banner filtern').selectOption({ label: 'ohne Banner' });
	await expect(tiles).toHaveCount(2);

	await page.getByLabel('Nach Banner filtern').selectOption('');
	await page.getByLabel('Nach Typ filtern').selectOption({ label: 'ohne Typ' });
	await expect(tiles).toHaveCount(1);
	await expect(tiles.first()).toContainText('Skelett');
});

test('A–Z toggle sorts the tiles alphabetically', async ({ page }) => {
	await seedCards(page, [
		{ id: 'z1', name: 'Zombie' },
		{ id: 'a1', name: 'Alp' }
	]);
	const tiles = page.locator('.cards li');
	await expect(tiles.first()).toContainText('Zombie');
	await page.getByRole('button', { name: 'A–Z' }).click();
	await expect(tiles.first()).toContainText('Alp');
});

test('dismissed delete confirmation keeps the card', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	// Playwright dismisses dialogs by default
	await page.getByRole('button', { name: 'Löschen' }).click();
	await expect(page.locator('.cards li', { hasText: 'Goblin' })).toBeVisible();
	expect(await storedCards(page)).toHaveLength(1);
});

test('wrapped action text keeps the entry indent', async ({ page }) => {
	await seedCards(page, [
		{
			id: 'g1',
			name: 'Goblin',
			actions: [
				{
					span: 20,
					name: 'Meutenruf',
					effect:
						'Alle anderen Goblins in Sichtweite dürfen sich sofort bewegen und danach angreifen.'
				}
			]
		}
	]);
	await page.getByRole('button', { name: 'Goblin ansehen' }).click();
	const geometry = await page
		.locator('dialog.view-dialog .actions .entry')
		.first()
		.evaluate((entry) => {
			const label = entry.querySelector('b')?.getBoundingClientRect();
			const range = document.createRange();
			range.selectNodeContents(entry);
			const rects = [...range.getClientRects()];
			const lastLineTop = Math.max(...rects.map((rect) => rect.top));
			const lastLine = rects.filter((rect) => rect.top === lastLineTop);
			return {
				labelLeft: label?.left ?? 0,
				labelTop: label?.top ?? 0,
				wrappedLeft: Math.min(...lastLine.map((rect) => rect.left)),
				wrappedTop: lastLineTop
			};
		});
	// the effect has to actually wrap, otherwise the alignment check proves nothing
	expect(geometry.wrappedTop).toBeGreaterThan(geometry.labelTop);
	expect(Math.abs(geometry.wrappedLeft - geometry.labelLeft)).toBeLessThan(1);
});

test('view dialog offers single-card PNG and JSON downloads', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.getByRole('button', { name: 'Goblin ansehen' }).click();
	const dialog = page.locator('dialog.view-dialog');

	await dialog.getByText('Herunterladen').click();
	const pngPromise = page.waitForEvent('download');
	await dialog.getByRole('button', { name: 'Als PNG' }).click();
	expect((await pngPromise).suggestedFilename()).toMatch(/\.png$/);

	await dialog.getByText('Herunterladen').click();
	const jsonPromise = page.waitForEvent('download');
	await dialog.getByRole('button', { name: 'Als JSON' }).click();
	expect((await jsonPromise).suggestedFilename()).toMatch(/\.json$/);
});

test('legacy card shape is migrated on load', async ({ page }) => {
	await seedRaw(
		page,
		JSON.stringify([
			{
				id: 'legacy-1',
				name: 'Alter Ork',
				lifePoints: 25,
				armor: 3,
				actions: [
					{ from: 11, to: 20, name: 'Biss', effect: '2W6' },
					{ from: 1, to: 10, name: 'Hieb', effect: '1W6' }
				],
				specialMoves: { hp50: 'Wütend' }
			}
		])
	);
	const tile = page.locator('.cards li', { hasText: 'Alter Ork' });
	await expect(tile).toBeVisible();
	await expect(tile.locator('.stats')).toContainText('RS');

	await tile.getByRole('link', { name: 'Bearbeiten' }).click();
	const actionNames = page.getByLabel('Name der Aktion');
	await expect(actionNames.nth(0)).toHaveValue('Hieb');
	await expect(actionNames.nth(1)).toHaveValue('Biss');
	await expect(page.getByLabel('Bereichsanfang').nth(0)).toHaveValue('11');
	await expect(page.getByLabel('Effekt für ab Schmerz 2')).toHaveValue('Wütend');
	// 25 LeP: the second pain step sits at 13 cumulative damage
	await expect(page.getByLabel('Schmerz 2', { exact: true })).toHaveValue('13');
});

test('invalid import file shows an error and changes nothing', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	let alertMessage = '';
	page.once('dialog', (dialog) => {
		alertMessage = dialog.message();
		void dialog.accept();
	});
	await page
		.locator('label.import input[type="file"]')
		.setInputFiles('tests/fixtures/invalid-import.json');
	await expect
		.poll(() => alertMessage)
		.toBe('Import fehlgeschlagen: Erwartet ein JSON-Array von Karten.');
	await expect(page.locator('.cards li')).toHaveCount(1);
	expect(await storedCards(page)).toHaveLength(1);
});

test('import adds cards from a JSON file', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	let alertMessage = '';
	page.once('dialog', (dialog) => {
		alertMessage = dialog.message();
		void dialog.accept();
	});
	await page
		.locator('label.import input[type="file"]')
		.setInputFiles('tests/fixtures/import-cards.json');
	await expect(page.locator('.cards li', { hasText: 'Oger' })).toBeVisible();
	expect(alertMessage).toBe('1 Karte(n) importiert.');
	expect(await storedCards(page)).toHaveLength(2);
});
