import { expect, test } from '@playwright/test';
import { seedCards, storedCards } from './helpers';

const nameInput = (page: import('@playwright/test').Page) =>
	page.locator('.card.editable .name-input');

test('saving without a name shows an error and stays on the editor', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('alert')).toHaveText('Die Karte braucht einen Namen.');
	await expect(page).toHaveURL(/\/editor$/);
});

test('a new card can be created and shows up in the library', async ({ page }) => {
	await page.goto('/editor');
	await nameInput(page).fill('Grimwolf');
	await page.locator('.card.editable').getByLabel('Lebenspunkte', { exact: true }).fill('30');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await expect(page).toHaveURL(/\/$/);
	const tile = page.locator('.cards li', { hasText: 'Grimwolf' });
	await expect(tile).toBeVisible();
	await expect(tile.locator('.stats')).toContainText('30');

	const cards = await storedCards(page);
	expect(cards).toHaveLength(1);
	expect(cards[0].name).toBe('Grimwolf');
	expect(cards[0].stats.lifePoints.value).toBe('30');
});

test('an existing card can be edited', async ({ page }) => {
	await seedCards(page, [{ id: 'g1', name: 'Goblin' }]);
	await page.getByRole('link', { name: 'Bearbeiten' }).click();
	await expect(page).toHaveURL(/\/editor\?id=g1$/);
	await expect(nameInput(page)).toHaveValue('Goblin');

	await nameInput(page).fill('Hobgoblin');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.locator('.cards li', { hasText: 'Hobgoblin' })).toBeVisible();
	expect(await storedCards(page)).toHaveLength(1);
});

test('an added action row is saved with the card', async ({ page }) => {
	await page.goto('/editor');
	const actionNames = page.getByLabel('Name der Aktion');
	const rowsBefore = await actionNames.count();
	await page.getByRole('button', { name: '+ Aktion' }).click();
	await expect(actionNames).toHaveCount(rowsBefore + 1);

	await actionNames.last().fill('Biss');
	await page.getByLabel('Effekt der Aktion').last().fill('1W6+4 TP');
	await nameInput(page).fill('Grimwolf');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await expect(page).toHaveURL(/\/$/);
	const cards = await storedCards(page);
	expect(cards[0].actions).toContainEqual(
		expect.objectContaining({ name: 'Biss', effect: '1W6+4 TP' })
	);
});

test('actions can be marked as Passierschlag and the sword prints', async ({ page }) => {
	await seedCards(page, [
		{
			id: 'a1',
			name: 'Grimwolf',
			actions: [
				{ span: 10, name: 'Biss', effect: '1W6', opportunityAttack: true },
				{ span: 10, name: 'Hieb', effect: '1W6' }
			]
		}
	]);
	await page.goto('/editor?id=a1');
	const bite = page.getByRole('button', { name: 'Passierschlag: Biss', exact: true });
	const slash = page.getByRole('button', { name: 'Passierschlag: Hieb', exact: true });
	await expect(bite).toHaveAttribute('aria-pressed', 'true');
	await expect(slash).toHaveAttribute('aria-pressed', 'false');

	await slash.click();
	await expect(slash).toHaveAttribute('aria-pressed', 'true');
	await bite.click();
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page).toHaveURL(/\/$/);

	const cards = await storedCards(page);
	expect(cards[0].actions.map((action) => action.opportunityAttack)).toEqual([false, true]);

	await page.goto('/print');
	await page.locator('label.chip', { hasText: 'Grimwolf' }).click();
	const sheetCard = page.locator('.sheet article.card').first();
	await expect(sheetCard.getByRole('img', { name: 'Passierschlag' })).toHaveCount(1);
	await expect(sheetCard.locator('.entry', { hasText: 'Hieb' }).locator('.sword')).toBeVisible();
	// the unmarked row keeps an empty slot so both ranges line up
	await expect(sheetCard.locator('.entry', { hasText: 'Biss' }).locator('.sword')).toBeEmpty();
});

test('unknown card id shows a notice', async ({ page }) => {
	await page.goto('/editor?id=does-not-exist');
	await expect(page.getByText('Karte nicht gefunden – neue Karte wird angelegt.')).toBeVisible();
});

test('unsaved changes guard blocks navigation until confirmed', async ({ page }) => {
	await page.goto('/editor');
	await nameInput(page).fill('Grimwolf');

	// Playwright dismisses dialogs by default: the confirm is rejected, navigation cancelled
	await page.getByRole('link', { name: 'Bibliothek' }).click();
	await expect(page).toHaveURL(/\/editor$/);

	page.once('dialog', (dialog) => void dialog.accept());
	await page.getByRole('link', { name: 'Bibliothek' }).click();
	await expect(page).toHaveURL(/\/$/);
});

test('action reorder keeps dice ranges in place', async ({ page }) => {
	await page.goto('/editor');
	const actionNames = page.getByLabel('Name der Aktion');
	await expect(actionNames.nth(0)).toHaveValue('Kritischer Treffer');
	await expect(actionNames.nth(1)).toHaveValue('Schwerer Angriff');

	await page.getByRole('button', { name: 'Nach oben: Schwerer Angriff' }).click();

	await expect(actionNames.nth(0)).toHaveValue('Schwerer Angriff');
	await expect(actionNames.nth(1)).toHaveValue('Kritischer Treffer');
	// spans stay with the row position: row 1 still ends at 1, row 2 still covers 2–6
	await expect(page.getByLabel('Bereichsende').nth(0)).toHaveValue('1');
	await expect(page.getByLabel('Bereichsanfang').nth(0)).toHaveValue('2');
	await expect(page.getByLabel('Bereichsende').nth(1)).toHaveValue('6');
});

test('editing a dice range end reflows the next row', async ({ page }) => {
	await page.goto('/editor');
	// row 2 (Schwerer Angriff) covers 2–6; shrink it to 2–4
	const rowTwoEnd = page.getByLabel('Bereichsende').nth(1);
	await rowTwoEnd.fill('4');
	await rowTwoEnd.blur();
	await expect(rowTwoEnd).toHaveValue('4');
	// row 3 now starts at 5
	await expect(page.getByLabel('Bereichsanfang').nth(1)).toHaveValue('5');
});

test('action rows can be removed but not the last one', async ({ page }) => {
	await page.goto('/editor');
	const actionNames = page.getByLabel('Name der Aktion');
	await expect(actionNames).toHaveCount(5);
	await page.getByRole('button', { name: 'Aktion entfernen: Flucht' }).click();
	await expect(actionNames).toHaveCount(4);

	await seedCards(page, [
		{ id: 'a1', name: 'Einzeln', actions: [{ span: 20, name: 'Hieb', effect: '' }] }
	]);
	await page.goto('/editor?id=a1');
	await expect(page.getByRole('button', { name: 'Aktion entfernen: Hieb' })).toBeDisabled();
});

test('wound trigger special move can be added, hidden, and saved', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Spezialmanöver' }).click();
	await page.getByRole('button', { name: '+ Kampfbeginn' }).click();
	await page.getByLabel('Name für Kampfbeginn').fill('Brüllen');
	await page.getByLabel('Effekt für Kampfbeginn').fill('Alle Feinde: Furcht');

	await page.getByRole('button', { name: '+ Tod', exact: true }).click();
	await page.getByLabel('Effekt für Tod').fill('Zerfällt zu Staub.');
	await page.getByRole('button', { name: 'Spezialmanöver entfernen: Tod' }).click();
	await expect(page.getByLabel('Effekt für Tod')).toBeHidden();

	await nameInput(page).fill('Ork');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page).toHaveURL(/\/$/);
	const cards = await storedCards(page);
	const rows = cards[0].specialMoves.rows;
	expect(cards[0].specialMoves.hidden).toBe(false);
	expect(rows.find((row) => row.trigger === 'combatStart')).toEqual(
		expect.objectContaining({ name: 'Brüllen', effect: 'Alle Feinde: Furcht', hidden: false })
	);
	// hiding a row keeps its text for when it comes back
	expect(rows.find((row) => row.trigger === 'death')).toEqual(
		expect.objectContaining({ effect: 'Zerfällt zu Staub.', hidden: true })
	);
});

test('special move rows can be reordered', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Spezialmanöver' }).click();
	await page.getByRole('button', { name: '+ Kampfbeginn' }).click();
	await page.getByRole('button', { name: '+ Tod', exact: true }).click();
	await page.getByLabel('Effekt für Tod').fill('Zerfällt zu Staub.');

	// Tod sits below Kampfbeginn; move it up past it
	await page.getByRole('button', { name: 'Nach oben: Tod' }).click();
	const triggerCells = page.locator('.special-moves.editor .entry-row .range');
	await expect(triggerCells.nth(0)).toContainText('Tod');
	await expect(triggerCells.nth(1)).toContainText('Kampfbeginn');

	await nameInput(page).fill('Ork');
	await page.getByRole('button', { name: 'Speichern' }).click();
	const rows = (await storedCards(page))[0].specialMoves.rows;
	const shown = rows.filter((row) => !row.hidden).map((row) => row.trigger);
	expect(shown).toEqual(['death', 'combatStart']);
});

test('custom special move trigger is saved', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Spezialmanöver' }).click();
	await page.getByRole('button', { name: '+ Eigener Auslöser' }).click();
	await page.getByLabel('Auslöser').fill('Bei Feuer');
	await page.getByLabel('Name für Bei Feuer').fill('Panik');
	await page.getByLabel('Effekt für Bei Feuer').fill('Flieht sofort.');
	await nameInput(page).fill('Troll');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await expect(page).toHaveURL(/\/$/);
	const cards = await storedCards(page);
	expect(cards[0].specialMoves.rows.filter((row) => row.trigger === null)).toEqual([
		expect.objectContaining({ label: 'Bei Feuer', name: 'Panik', effect: 'Flieht sofort.' })
	]);
});

test('talent values clamp and talents can be hidden', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Talente' }).click();
	const bodyValue = page.getByLabel('Körper Wert');
	await bodyValue.fill('999');
	await bodyValue.blur();
	await expect(bodyValue).toHaveValue('99');
	const bodyQs = page.getByLabel('Körper max. QS');
	await bodyQs.fill('9');
	await bodyQs.blur();
	await expect(bodyQs).toHaveValue('6');

	await page.getByRole('button', { name: 'Talente ausblenden' }).click();
	await expect(bodyValue).toBeHidden();
	await page.getByRole('button', { name: '+ Talente' }).click();
	await expect(bodyValue).toBeVisible();
	await page.getByRole('button', { name: 'Talente ausblenden' }).click();

	await nameInput(page).fill('Golem');
	await page.getByRole('button', { name: 'Speichern' }).click();
	const cards = await storedCards(page);
	expect(cards[0].talents.hidden).toBe(true);
	expect(cards[0].talents.entries.body).toEqual(expect.objectContaining({ value: 99, maxQs: 6 }));
});

test('talent calculator applies derived values to the card', async ({ page }) => {
	await page.goto('/editor');
	const attributeInputs = page.locator('.talent-calc .attributes input');
	await expect(attributeInputs).toHaveCount(8);
	for (let index = 0; index < 8; index++) {
		await attributeInputs.nth(index).fill('12');
	}
	const bodyGroup = page.locator('.talent-calc .groups li').filter({ hasText: 'Körper' });
	await bodyGroup.locator('input').fill('4');
	// (12+12+12-25)/2 aufgerundet = 6, +4 FW = 10; QS = 4/3 aufgerundet = 2
	await expect(bodyGroup).toContainText('10');
	await expect(bodyGroup).toContainText('QS 2');

	await page.getByRole('button', { name: 'Auf Karte übernehmen' }).click();
	await page.getByRole('button', { name: '+ Talente' }).click();
	await expect(page.getByLabel('Körper Wert')).toHaveValue('10');
	await expect(page.getByLabel('Körper max. QS')).toHaveValue('2');
	await expect(page.getByRole('button', { name: 'Auf Karte übernehmen' })).toBeDisabled();
	await expect(page.getByText('Kartenwerte sind aktuell')).toBeVisible();
});

test('banner is saved and filterable in the library', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Banner' }).click();
	await page.getByLabel('Banner', { exact: true }).fill('Anführer');
	await nameInput(page).fill('Orkhäuptling');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await expect(page.locator('.tile-banner')).toHaveText('Anführer');
	await page.getByLabel('Nach Banner filtern').selectOption('Anführer');
	await expect(page.locator('.cards li')).toHaveCount(1);
	expect((await storedCards(page))[0].banner.value).toBe('Anführer');
});

test('a hidden banner keeps its text but leaves the library list', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Banner' }).click();
	await page.getByLabel('Banner', { exact: true }).fill('Anführer');
	await page.getByRole('button', { name: 'Banner entfernen' }).click();
	await nameInput(page).fill('Orkhäuptling');
	await page.getByRole('button', { name: 'Speichern' }).click();

	await expect(page.locator('.tile-banner')).toHaveCount(0);
	await expect(page.getByLabel('Nach Banner filtern').locator('option')).toHaveCount(2);
	expect((await storedCards(page))[0].banner).toEqual(
		expect.objectContaining({ value: 'Anführer', hidden: true })
	);
});

test('flavour text and notes are saved and removable', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Flavourtext' }).click();
	await page.getByLabel('Flavourtext', { exact: true }).fill('Alt und böse.');
	await page.getByRole('button', { name: 'Flavourtext entfernen' }).click();
	await expect(page.getByRole('button', { name: '+ Flavourtext' })).toBeVisible();
	await page.getByRole('button', { name: '+ Flavourtext' }).click();
	await page.getByLabel('Flavourtext', { exact: true }).fill('Uralt.');

	await page.getByRole('button', { name: '+ Notizen' }).click();
	await page.getByLabel('Notizen', { exact: true }).fill('Immun gegen Feuer.');

	await nameInput(page).fill('Drache');
	await page.getByRole('button', { name: 'Speichern' }).click();
	const cards = await storedCards(page);
	expect(cards[0].flavorText).toEqual({ value: 'Uralt.', hidden: false });
	expect(cards[0].notes).toEqual({ value: 'Immun gegen Feuer.', hidden: false });
});

test('a hidden block keeps its text across a reload and gives it back', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: '+ Notizen' }).click();
	await page.getByLabel('Notizen', { exact: true }).fill('Immun gegen Feuer.');
	await page.getByRole('button', { name: 'Notizen entfernen' }).click();
	await nameInput(page).fill('Drache');
	await page.getByRole('button', { name: 'Speichern' }).click();

	expect((await storedCards(page))[0].notes).toEqual({
		value: 'Immun gegen Feuer.',
		hidden: true
	});
	// the card prints nothing for a hidden block
	await page.getByRole('button', { name: 'Drache ansehen' }).click();
	await expect(page.locator('dialog.view-dialog article.card')).not.toContainText('Notizen');
	await page.locator('dialog.view-dialog').getByRole('button', { name: 'Schließen' }).click();

	await page.getByRole('link', { name: 'Bearbeiten' }).click();
	await page.getByRole('button', { name: '+ Notizen' }).click();
	await expect(page.getByLabel('Notizen', { exact: true })).toHaveValue('Immun gegen Feuer.');
});

test('hidden stat badge is excluded from tile and persisted', async ({ page }) => {
	await page.goto('/editor');
	await nameInput(page).fill('Golem');
	await page.getByRole('button', { name: 'Initiative ausblenden' }).click();
	await page.getByRole('button', { name: 'Speichern' }).click();

	const tile = page.locator('.cards li', { hasText: 'Golem' });
	await expect(tile.locator('.stats')).not.toContainText('INI');
	expect((await storedCards(page))[0].stats.initiative.hidden).toBe(true);
});

test('life points fill the wound thresholds, text HP keeps the last ones', async ({ page }) => {
	await page.goto('/editor');
	const card = page.locator('.card.editable');
	await page.getByRole('button', { name: '+ Schmerzschwellen' }).click();
	const thresholds = ['Schmerz 1', 'Schmerz 2', 'Schmerz 3', 'Tod'].map((label) =>
		card.getByLabel(label, { exact: true })
	);
	async function expectThresholds(expected: string[]) {
		for (const [index, value] of expected.entries()) {
			await expect(thresholds[index]).toHaveValue(value);
		}
	}

	// default 20 LeP
	await expectThresholds(['5', '10', '15', '20']);

	const lifePoints = card.getByLabel('Lebenspunkte', { exact: true });
	await lifePoints.fill('40');
	await expectThresholds(['10', '20', '30', '40']);

	// HP that is not a number leaves the thresholds standing
	await lifePoints.fill('2W6+4');
	await expectThresholds(['10', '20', '30', '40']);

	// a manual edit pins all four, even after HP becomes a number again
	await thresholds[1].fill('halbe LeP');
	await lifePoints.fill('30');
	await expectThresholds(['10', 'halbe LeP', '30', '40']);

	await card.getByRole('button', { name: 'Schmerzschwellen zurücksetzen' }).click();
	await expectThresholds(['8', '15', '23', '30']);

	await nameInput(page).fill('Grimwolf');
	await page.getByRole('button', { name: 'Speichern' }).click();
	const cards = await storedCards(page);
	expect(cards[0].stats.lifePoints.value).toBe('30');
	expect(cards[0].wounds).toMatchObject({ manual: false, hp50: '15', death: '30' });
});

test('custom category can be entered', async ({ page }) => {
	await page.goto('/editor');
	await page.getByLabel('Typ', { exact: true }).selectOption({ label: 'Eigener Typ…' });
	await page.getByLabel('Eigener Typ').fill('Dämon');
	await page.getByLabel('Eigener Typ').press('Enter');
	await nameInput(page).fill('Karmoth');
	await page.getByRole('button', { name: 'Speichern' }).click();
	expect((await storedCards(page))[0].category).toBe('Dämon');
});

test('cancel leaves a dirty editor without confirmation', async ({ page }) => {
	await page.goto('/editor');
	await nameInput(page).fill('Verworfen');
	// auto-dismissed confirm would block navigation, so landing on / proves no dialog fired
	await page.getByRole('link', { name: 'Abbrechen' }).click();
	await expect(page).toHaveURL(/\/$/);
	expect(await storedCards(page)).toHaveLength(0);
});

test('name error clears while typing', async ({ page }) => {
	await page.goto('/editor');
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByRole('alert')).toBeVisible();
	await nameInput(page).pressSequentially('G');
	await expect(page.getByRole('alert')).toBeHidden();
});

test('overfull card shows fit warnings in editor and library', async ({ page }) => {
	const longActions = Array.from({ length: 20 }, (_, index) => ({
		span: 1,
		name: `Aktion ${index + 1}`,
		effect: 'Ein sehr langer Effekt mit vielen Worten und Details. '.repeat(6)
	}));
	await seedCards(page, [{ id: 'big1', name: 'Riese', actions: longActions }]);
	await page.goto('/editor?id=big1');
	await expect(page.getByText('Inhalt passt nicht auf die Karte.')).toBeVisible();

	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.locator('.cards li .flag', { hasText: 'Passt nicht' })).toBeVisible();
});

test('card image can be cropped in and removed', async ({ page }) => {
	await page.goto('/editor');
	await page.getByLabel('Bild wählen').click();
	await page.getByLabel('Bilddatei wählen').setInputFiles('tests/fixtures/portrait.png');
	await page.getByRole('button', { name: 'Ausschnitt übernehmen' }).click();

	const portraitImage = page.locator('.card.editable .portrait img');
	await expect(portraitImage).toBeVisible();
	await expect(portraitImage).toHaveAttribute('src', /^data:image\/jpeg/);

	await page.getByLabel('Bild wählen').click();
	await page.getByRole('button', { name: 'Bild entfernen' }).click();
	await expect(portraitImage).toHaveCount(0);
});

test('card style preference switches the card and persists', async ({ page }) => {
	await page.goto('/editor');
	const card = page.locator('.card.editable');
	await expect(card).not.toHaveClass(/ornate/);

	await page.getByText('⚙ Optionen').click();
	await page.getByRole('button', { name: 'Aventurisch' }).click();
	await expect(card).toHaveClass(/ornate/);

	await page.reload();
	await expect(page.locator('.card.editable')).toHaveClass(/ornate/);
});
