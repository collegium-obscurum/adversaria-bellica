import { describe, expect, it } from 'vitest';
import {
	migrateActions,
	migrateCard,
	migrateFit,
	migrateSpecialMoves,
	migrateStats
} from './migrations';
import type { ActionEntry } from './types';

describe('migrateActions', () => {
	it('converts legacy from/to rows ordered by from', () => {
		const migrated = migrateActions([
			{ from: 6, to: 19, name: 'Angriff', effect: '1W6' },
			{ from: 1, to: 5, name: 'Fehlschlag', effect: '' },
			{ from: 20, to: 20, name: 'Krit', effect: '2W6' }
		]);
		expect(migrated).toEqual([
			{ span: 5, name: 'Fehlschlag', effect: '', color: null },
			{ span: 14, name: 'Angriff', effect: '1W6', color: null },
			{ span: 1, name: 'Krit', effect: '2W6', color: null }
		]);
	});

	it('passes span rows through unchanged', () => {
		const entries: ActionEntry[] = [{ span: 20, name: 'x', effect: '', color: 'red' }];
		expect(migrateActions(entries)).toEqual(entries);
	});

	it('handles empty lists', () => {
		expect(migrateActions([])).toEqual([]);
	});

	it('defaults malformed rows and drops non-objects', () => {
		expect(migrateActions([{ span: 'abc' }, null, 'garbage', { span: 3.4, name: 'x' }])).toEqual([
			{ span: 1, name: '', effect: '', color: null },
			{ span: 3, name: 'x', effect: '', color: null }
		]);
	});

	it('nulls unknown color values', () => {
		const migrated = migrateActions([
			{ span: 2, name: 'a', effect: '', color: 'green' },
			{ span: 2, name: 'b', effect: '', color: '#ff0000' }
		]);
		expect(migrated[0].color).toBe('green');
		expect(migrated[1].color).toBeNull();
	});
});

describe('migrateSpecialMoves', () => {
	it('turns legacy strings into effect-only moves', () => {
		const migrated = migrateSpecialMoves(
			{
				combatStart: 'Brüllt laut.',
				hp75: '',
				hp50: 'Netz',
				hp25: '',
				death: ''
			},
			undefined
		);
		expect(migrated.triggers.combatStart).toEqual({
			name: '',
			effect: 'Brüllt laut.',
			color: null,
			hidden: false
		});
		expect(migrated.triggers.hp50.effect).toBe('Netz');
		expect(migrated.triggers.hp75).toEqual({ name: '', effect: '', color: null, hidden: true });
	});

	it('hides legacy triggers without content and shows the filled ones', () => {
		const migrated = migrateSpecialMoves(
			{ combatStart: { name: 'Wutschrei', effect: '2W6', color: 'purple' } },
			undefined
		);
		expect(migrated.triggers.combatStart).toEqual({
			name: 'Wutschrei',
			effect: '2W6',
			color: 'purple',
			hidden: false
		});
		expect(migrated.triggers.death.hidden).toBe(true);
	});

	it('shows the section when a legacy card had anything in it', () => {
		expect(migrateSpecialMoves({ combatStart: 'Brüllt.' }, undefined).hidden).toBe(false);
		expect(migrateSpecialMoves({}, [{ trigger: 'Feuer', name: 'Panik' }]).hidden).toBe(false);
	});

	it('hides the section when a legacy card had nothing in it', () => {
		expect(migrateSpecialMoves({ combatStart: '', hp50: '  ' }, []).hidden).toBe(true);
		expect(migrateSpecialMoves(undefined, undefined).hidden).toBe(true);
	});

	it('keeps stored visibility of an already migrated section', () => {
		const stored = {
			hidden: false,
			triggers: {
				combatStart: { name: 'Wutschrei', effect: '', color: null, hidden: true },
				hp75: { name: '', effect: '', color: null, hidden: false }
			},
			custom: [{ trigger: 'Feuer', name: 'Panik', effect: '', color: null }]
		};
		const migrated = migrateSpecialMoves(stored, undefined);
		expect(migrated.hidden).toBe(false);
		// a filled but hidden trigger stays hidden, an empty but shown one stays shown
		expect(migrated.triggers.combatStart.hidden).toBe(true);
		expect(migrated.triggers.combatStart.name).toBe('Wutschrei');
		expect(migrated.triggers.hp75.hidden).toBe(false);
		expect(migrated.custom).toEqual(stored.custom);
	});

	it('folds legacy customMoves into the section', () => {
		const migrated = migrateSpecialMoves({}, [{ trigger: 'Feuer', name: 'Panik', effect: '' }]);
		expect(migrated.custom).toEqual([{ trigger: 'Feuer', name: 'Panik', effect: '', color: null }]);
	});

	it('fills missing triggers with empty hidden moves', () => {
		expect(migrateSpecialMoves({}, undefined).triggers.death).toEqual({
			name: '',
			effect: '',
			color: null,
			hidden: true
		});
	});
});

describe('migrateStats', () => {
	it('converts legacy numeric stats to strings', () => {
		const stats = migrateStats({ armor: 3, speed: 8, actionCount: 1 });
		expect(stats.armor.value).toBe('3');
		expect(stats.speed.value).toBe('8');
		expect(stats.actionCount.value).toBe('1');
	});

	it('passes string stats through and fills missing ones with empty strings', () => {
		const stats = migrateStats({ speed: '8/16' });
		expect(stats.speed.value).toBe('8/16');
		expect(stats.armor.value).toBe('');
	});

	it('turns invalid or sub-1 lifePoints into null (no HP)', () => {
		for (const bad of [0, -5, undefined, null, 'abc']) {
			expect(migrateStats({ lifePoints: bad }).lifePoints.value).toBeNull();
		}
	});

	it('keeps valid lifePoints and coerces numeric strings', () => {
		expect(migrateStats({ lifePoints: '25' }).lifePoints.value).toBe(25);
	});

	it('derives visibility from empty text stats on cards without hiddenStats', () => {
		const stats = migrateStats({ armor: '2', speed: '8' });
		expect(stats.armor.hidden).toBe(false);
		expect(stats.speed.hidden).toBe(false);
		expect(stats.defense.hidden).toBe(true);
		expect(stats.lifePoints.hidden).toBe(false);
	});

	it('treats whitespace-only stats as empty', () => {
		expect(migrateStats({ armor: '  ' }).armor.hidden).toBe(true);
	});

	it('takes visibility from a stored hiddenStats list', () => {
		const stats = migrateStats({ hiddenStats: ['lifePoints'], armor: '' });
		expect(stats.lifePoints.hidden).toBe(true);
		expect(stats.armor.hidden).toBe(false);
	});

	it('hides sizeCategory on cards saved before the GK badge existed', () => {
		expect(migrateStats({ hiddenStats: [] }).sizeCategory.hidden).toBe(true);
		expect(migrateStats({ sizeCategory: 'mittel', hiddenStats: [] }).sizeCategory).toEqual({
			value: 'mittel',
			hidden: false
		});
	});

	it('keeps stored per-stat visibility of an already migrated card', () => {
		const stats = migrateStats({
			stats: {
				lifePoints: { value: 24, hidden: true },
				armor: { value: '3', hidden: false },
				speed: { value: '', hidden: false }
			}
		});
		expect(stats.lifePoints).toEqual({ value: 24, hidden: true });
		expect(stats.armor).toEqual({ value: '3', hidden: false });
		// an empty but shown stat stays shown; visibility is explicit now
		expect(stats.speed).toEqual({ value: '', hidden: false });
		expect(stats.toughness).toEqual({ value: '', hidden: false });
	});
});

describe('migrateFit', () => {
	it('defaults missing fit to a fitting card', () => {
		expect(migrateFit(undefined)).toEqual({ scale: 1, fits: true, imageHidden: false });
	});

	it('passes a stored fit through', () => {
		expect(migrateFit({ scale: 0.85, fits: true, imageHidden: false })).toEqual({
			scale: 0.85,
			fits: true,
			imageHidden: false
		});
		expect(migrateFit({ scale: 0.7, fits: false, imageHidden: true })).toEqual({
			scale: 0.7,
			fits: false,
			imageHidden: true
		});
	});

	it('defaults imageHidden for fits stored before image dropping', () => {
		expect(migrateFit({ scale: 0.85, fits: true })).toEqual({
			scale: 0.85,
			fits: true,
			imageHidden: false
		});
	});

	it('clamps malformed scales into the valid range', () => {
		expect(migrateFit({ scale: 3, fits: true }).scale).toBe(1);
		expect(migrateFit({ scale: 0.1, fits: true }).scale).toBe(0.7);
		expect(migrateFit({ scale: 'abc', fits: true }).scale).toBe(1);
	});
});

describe('migrateCard block visibility', () => {
	it('keeps blocks a legacy card had content in', () => {
		const card = migrateCard({
			id: 'a',
			name: 'Wolf',
			lifePoints: 24,
			notes: 'Immun gegen Feuer.',
			talents: { body: { value: 8, maxQs: 3 } },
			specialMoves: { combatStart: 'Brüllt.' }
		});
		expect(card.notes).toEqual({ value: 'Immun gegen Feuer.', hidden: false });
		expect(card.talents.hidden).toBe(false);
		expect(card.talents.entries.body.value).toBe(8);
		expect(card.specialMoves.hidden).toBe(false);
		expect(card.specialMoves.triggers.combatStart.effect).toBe('Brüllt.');
		// the pain row printed on every legacy card that had HP
		expect(card.wounds.hidden).toBe(false);
	});

	it('hides the blocks a legacy card had nothing in', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', notes: '   ', lifePoints: 0 });
		expect(card.notes.hidden).toBe(true);
		expect(card.talents.hidden).toBe(true);
		expect(card.specialMoves.hidden).toBe(true);
		expect(card.wounds.hidden).toBe(true);
	});

	it('respects a legacy talentsHidden flag even with talent values', () => {
		const raw = { id: 'a', talents: { body: { value: 8, maxQs: 3 } } };
		expect(migrateCard({ ...raw, talentsHidden: true }).talents.hidden).toBe(true);
		expect(migrateCard(raw).talents.hidden).toBe(false);
	});

	it('shows legacy banner and flavour text that had content', () => {
		const card = migrateCard({
			id: 'a',
			banner: 'Wildnis',
			bannerColor: 'green',
			flavorText: 'Uralt.'
		});
		expect(card.banner).toEqual({ value: 'Wildnis', color: 'green', hidden: false });
		expect(card.flavorText).toEqual({ value: 'Uralt.', hidden: false });
	});

	it('hides legacy banner and flavour text that were empty', () => {
		const card = migrateCard({ id: 'a', banner: '  ', flavorText: '' });
		expect(card.banner.hidden).toBe(true);
		expect(card.flavorText.hidden).toBe(true);
	});

	it('keeps stored visibility instead of re-hiding on every load', () => {
		const stored = migrateCard({
			id: 'a',
			notes: { value: 'Immun.', hidden: false },
			flavorText: { value: '', hidden: false },
			banner: { value: 'Wildnis', color: null, hidden: true },
			wounds: { hidden: false },
			talents: { hidden: false, entries: { body: { fw: null, value: 8, maxQs: 3 } } }
		});
		expect(stored.notes.hidden).toBe(false);
		expect(stored.flavorText.hidden).toBe(false);
		expect(stored.banner).toEqual({ value: 'Wildnis', color: null, hidden: true });
		expect(stored.wounds.hidden).toBe(false);
		expect(stored.talents.hidden).toBe(false);
		expect(stored.talents.entries.body.value).toBe(8);
	});

	it('survives a full round trip through JSON unchanged', () => {
		const first = migrateCard({ id: 'a', name: 'Wolf', notes: 'x' });
		first.notes.hidden = false;
		first.wounds.hidden = false;
		const second = migrateCard(JSON.parse(JSON.stringify(first)) as Record<string, unknown>);
		expect(second).toEqual(first);
	});
});

describe('migrateCard', () => {
	it('keeps existing custom moves and adds a null color', () => {
		const moves = [{ trigger: 'Bei Feuerschaden', name: 'Panik', effect: 'Flieht 1 Runde.' }];
		const card = migrateCard({ id: 'a', name: 'Wolf', customMoves: moves });
		expect(card.specialMoves.custom).toEqual([{ ...moves[0], color: null }]);
	});

	it('keeps custom move colors', () => {
		const moves = [{ trigger: 'Bei Feuerschaden', name: 'Panik', effect: '', color: 'orange' }];
		const card = migrateCard({ id: 'a', name: 'Wolf', customMoves: moves });
		expect(card.specialMoves.custom).toEqual(moves);
	});

	it('nulls an unknown banner color', () => {
		expect(migrateCard({ id: 'a', banner: 'x', bannerColor: 'pink' }).banner.color).toBeNull();
	});

	it('drops legacy fields so they stop being re-persisted', () => {
		const card = migrateCard({
			id: 'a',
			armor: '2',
			hiddenStats: ['armor'],
			talentsHidden: true,
			customMoves: []
		}) as unknown as Record<string, unknown>;
		expect(card.hiddenStats).toBeUndefined();
		expect(card.talentsHidden).toBeUndefined();
		expect(card.customMoves).toBeUndefined();
		expect(card.armor).toBeUndefined();
	});

	it('defaults every missing field so a bare object renders', () => {
		const card = migrateCard({});
		expect(typeof card.id).toBe('string');
		expect(card.name).toBe('');
		expect(card.category).toBe('');
		expect(card.banner).toEqual({ value: '', color: null, hidden: true });
		expect(card.flavorText).toEqual({ value: '', hidden: true });
		expect(card.notes).toEqual({ value: '', hidden: true });
		expect(card.image).toBeNull();
		expect(card.talents.entries.body).toEqual({ fw: null, value: 1, maxQs: 1 });
		expect(card.talents.entries.craft).toEqual({ fw: null, value: 1, maxQs: 1 });
		expect(card.attributes.courage).toBeNull();
		expect(card.attributes.strength).toBeNull();
		expect(card.actions).toEqual([]);
		expect(card.specialMoves.triggers.death).toEqual({
			name: '',
			effect: '',
			color: null,
			hidden: true
		});
		expect(card.specialMoves.custom).toEqual([]);
		expect(card.stats.lifePoints.value).toBeNull();
		expect(card.stats.armor.value).toBe('');
		expect(card.fit).toEqual({ scale: 1, fits: true, imageHidden: false });
	});

	it('sanitizes wrong-typed fields', () => {
		const card = migrateCard({
			id: 42,
			name: 7,
			flavorText: null,
			image: false,
			talents: { body: { value: 'x', maxQs: 2 } },
			customMoves: ['garbage', { trigger: 'Feuer' }]
		});
		expect(typeof card.id).toBe('string');
		expect(card.name).toBe('');
		expect(card.flavorText.value).toBe('');
		expect(card.image).toBeNull();
		expect(card.talents.entries.body).toEqual({ fw: null, value: 1, maxQs: 2 });
		expect(card.specialMoves.custom).toEqual([
			{ trigger: 'Feuer', name: '', effect: '', color: null }
		]);
	});

	it('keeps plain talent values as they are', () => {
		const card = migrateCard({
			id: 'a',
			name: 'Wolf',
			talents: { body: { fw: 4, value: 10, maxQs: 3 }, social: { value: 5, maxQs: 2 } }
		});
		expect(card.talents.entries.body).toEqual({ fw: 4, value: 10, maxQs: 3 });
		expect(card.talents.entries.social).toEqual({ fw: null, value: 5, maxQs: 2 });
	});

	it('bakes derivation-era talents into plain values using the card attributes', () => {
		const card = migrateCard({
			id: 'a',
			name: 'Wolf',
			attributes: { agility: 12, courage: 12, strength: 12 },
			talents: {
				body: { fw: 6, valueOverride: null, maxQsOverride: null },
				social: { fw: 6, valueOverride: 15, maxQsOverride: null }
			}
		});
		// (12+12+12-25)/2 rounded up = 6, +FW 6
		expect(card.talents.entries.body).toEqual({ fw: 6, value: 12, maxQs: 2 });
		expect(card.talents.entries.social.value).toBe(15);
		expect(card.talents.entries.social.fw).toBe(6);
	});

	it('keeps migrated attributes', () => {
		const card = migrateCard({
			id: 'a',
			name: 'Wolf',
			attributes: { courage: 14, strength: 12 }
		});
		expect(card.attributes.courage).toBe(14);
		expect(card.attributes.strength).toBe(12);
		expect(card.attributes.sagacity).toBeNull();
	});
});
