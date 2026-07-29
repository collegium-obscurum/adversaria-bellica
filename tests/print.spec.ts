import { expect, test } from '@playwright/test';
import { seedCards } from './helpers';

test('print page without cards shows a hint', async ({ page }) => {
	await page.goto('/print');
	await expect(page.getByText('Keine Karten vorhanden.')).toBeVisible();
});

test('selected cards appear on the sheet', async ({ page }) => {
	await seedCards(page, [
		{ id: 'g1', name: 'Goblin' },
		{ id: 'd1', name: 'Drache' }
	]);
	await page.goto('/print');
	const sheetCards = page.locator('.sheet article.card');

	await page.locator('label.chip', { hasText: 'Goblin' }).click();
	await expect(sheetCards).toHaveCount(1);
	await expect(page.getByRole('button', { name: 'Drucken (1)' })).toBeEnabled();

	await page.getByRole('button', { name: 'Alle auswählen' }).click();
	await expect(sheetCards).toHaveCount(2);

	await page.getByRole('button', { name: 'Auswahl leeren' }).click();
	await expect(sheetCards).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Drucken (0)' })).toBeDisabled();
});

test('card back options appear when enabled', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.goto('/print');
	await page.getByLabel('Rückseiten für beidseitigen Druck (nur PDF)').check();
	await expect(page.getByLabel('Standardmotiv')).toBeChecked();
	await expect(page.getByLabel('Eigenes Bild')).toBeDisabled();
	await expect(page.locator('img.back-preview')).toBeVisible();
});

test('sheet keeps the selection order', async ({ page }) => {
	await seedCards(page, [
		{ id: 'g1', name: 'Goblin' },
		{ id: 'd1', name: 'Drache' }
	]);
	await page.goto('/print');
	await page.locator('label.chip', { hasText: 'Drache' }).click();
	await page.locator('label.chip', { hasText: 'Goblin' }).click();

	const sheetCards = page.locator('.sheet article.card');
	await expect(sheetCards).toHaveCount(2);
	await expect(sheetCards.nth(0).locator('h2')).toHaveText('Drache');
	await expect(sheetCards.nth(1).locator('h2')).toHaveText('Goblin');
});

test('custom back image can be uploaded and persists', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.goto('/print');
	await page.getByLabel('Rückseiten für beidseitigen Druck (nur PDF)').check();
	await expect(page.getByLabel('Eigenes Bild')).toBeDisabled();

	await page
		.locator('label.upload input[type="file"]')
		.setInputFiles('tests/fixtures/portrait.png');
	await expect(page.getByLabel('Eigenes Bild')).toBeChecked();
	await expect(page.locator('img.back-preview')).toHaveAttribute('src', /^data:image\/jpeg/);

	await page.reload();
	await expect(page.getByLabel('Rückseiten für beidseitigen Druck (nur PDF)')).toBeChecked();
	await expect(page.getByLabel('Eigenes Bild')).toBeChecked();
});

test('ornate style shows the ink hint and styles the sheet', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.goto('/print');
	await page.locator('label.chip', { hasText: 'Goblin' }).click();
	await page.getByText('⚙ Optionen').click();
	await page.getByRole('button', { name: 'Aventurisch' }).click();
	await expect(page.getByText('braucht viel Tinte')).toBeVisible();
	await expect(page.locator('.sheet article.card').first()).toHaveClass(/ornate/);
});

test('stat label and color mode preferences change the display card', async ({ page }) => {
	await seedCards(page, [
		{
			id: 'g1',
			name: 'Goblin',
			lifePoints: 30,
			actions: [{ span: 20, name: 'Hieb', effect: '1W6', color: 'red' }]
		}
	]);
	await page.goto('/print');
	await page.locator('label.chip', { hasText: 'Goblin' }).click();
	const sheetCard = page.locator('.sheet article.card').first();

	await page.getByText('⚙ Optionen').click();
	await page.getByRole('button', { name: 'Text', exact: true }).click();
	await expect(sheetCard.locator('.badge').first()).toContainText('LeP');

	// default color mode is tinted text
	await expect(sheetCard.locator('b.tint-red')).toBeVisible();
	await page.getByRole('button', { name: 'Farbpunkt' }).click();
	await expect(sheetCard.locator('.color-dot')).toBeVisible();
	await expect(sheetCard.locator('b.tint-red')).toHaveCount(0);
});

test('PDF download produces a file', async ({ page }) => {
	test.setTimeout(120_000);
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.goto('/print');
	await page.locator('label.chip', { hasText: 'Goblin' }).click();

	const downloadPromise = page.waitForEvent('download', { timeout: 90_000 });
	await page.getByRole('button', { name: 'PDF herunterladen' }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('adversaria-bellica-karten.pdf');
});
