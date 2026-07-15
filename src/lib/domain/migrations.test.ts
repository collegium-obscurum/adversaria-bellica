import { describe, expect, it } from 'vitest';
import {
	migrateActions,
	migrateCard,
	migrateFit,
	migrateSpecialMoves,
	migrateStats
} from './migrations';
import type { ActionEntry, SpecialMove, WoundTrigger } from './types';

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
		const migrated = migrateSpecialMoves({
			combatStart: 'Brüllt laut.',
			hp75: '',
			hp50: 'Netz',
			hp25: '',
			death: ''
		});
		expect(migrated.combatStart).toEqual({ name: '', effect: 'Brüllt laut.', color: null });
		expect(migrated.hp50).toEqual({ name: '', effect: 'Netz', color: null });
		expect(migrated.hp75).toEqual({ name: '', effect: '', color: null });
	});

	it('passes object moves through, keeping their color', () => {
		const moves: Record<WoundTrigger, SpecialMove> = {
			combatStart: { name: 'Wutschrei', effect: '2W6', color: 'purple' },
			hp75: { name: '', effect: '', color: null },
			hp50: { name: '', effect: '', color: null },
			hp25: { name: '', effect: '', color: null },
			death: { name: '', effect: '', color: null }
		};
		expect(migrateSpecialMoves(moves)).toEqual(moves);
	});

	it('adds a null color to pre-color moves', () => {
		const migrated = migrateSpecialMoves({ combatStart: { name: 'Wutschrei', effect: '2W6' } });
		expect(migrated.combatStart).toEqual({ name: 'Wutschrei', effect: '2W6', color: null });
	});

	it('fills missing triggers with empty moves', () => {
		const migrated = migrateSpecialMoves({});
		expect(migrated.death).toEqual({ name: '', effect: '', color: null });
	});
});

describe('migrateStats', () => {
	it('converts numeric stats to strings', () => {
		const raw: Record<string, unknown> = { armor: 3, speed: 8, actionCount: 1 };
		migrateStats(raw);
		expect(raw.armor).toBe('3');
		expect(raw.speed).toBe('8');
		expect(raw.actionCount).toBe('1');
	});

	it('passes string stats through and fills missing ones with empty strings', () => {
		const raw: Record<string, unknown> = { speed: '8/16' };
		migrateStats(raw);
		expect(raw.speed).toBe('8/16');
		expect(raw.armor).toBe('');
	});

	it('turns invalid or sub-1 lifePoints into null (no HP)', () => {
		for (const bad of [0, -5, undefined, null, 'abc']) {
			const raw: Record<string, unknown> = { lifePoints: bad };
			migrateStats(raw);
			expect(raw.lifePoints).toBeNull();
		}
	});

	it('keeps valid lifePoints and coerces numeric strings', () => {
		const raw: Record<string, unknown> = { lifePoints: '25' };
		migrateStats(raw);
		expect(raw.lifePoints).toBe(25);
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

describe('migrateHiddenStats via migrateCard', () => {
	it('derives hiddenStats from empty text stats on cards without the field', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', armor: '2', speed: '8' });
		expect(card.hiddenStats.sort()).toEqual(
			['initiative', 'defense', 'soulPower', 'toughness', 'sizeCategory', 'actionCount'].sort()
		);
		expect(card.hiddenStats).not.toContain('lifePoints');
	});

	it('treats whitespace-only stats as empty', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', armor: '  ' });
		expect(card.hiddenStats).toContain('armor');
	});

	it('keeps a stored hiddenStats list, even with empty stats visible', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', hiddenStats: ['lifePoints'] });
		expect(card.hiddenStats).toEqual(['lifePoints', 'sizeCategory']);
	});

	it('drops unknown keys from a stored hiddenStats list', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', hiddenStats: ['armor', 'garbage', 42] });
		expect(card.hiddenStats).toEqual(['armor', 'sizeCategory']);
	});

	it('hides sizeCategory on cards saved before the GK badge existed', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', hiddenStats: [] });
		expect(card.hiddenStats).toContain('sizeCategory');
		expect(card.sizeCategory).toBe('');
	});

	it('respects stored visibility on cards that already have sizeCategory', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', sizeCategory: 'mittel', hiddenStats: [] });
		expect(card.hiddenStats).not.toContain('sizeCategory');
		expect(card.sizeCategory).toBe('mittel');
	});

	it('defaults talentsHidden to false and keeps a stored true', () => {
		expect(migrateCard({ id: 'a' }).talentsHidden).toBe(false);
		expect(migrateCard({ id: 'a', talentsHidden: 'yes' }).talentsHidden).toBe(false);
		expect(migrateCard({ id: 'a', talentsHidden: true }).talentsHidden).toBe(true);
	});
});

describe('migrateCard', () => {
	it('migrates stats too', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', armor: 2, lifePoints: 0 });
		expect(card.armor).toBe('2');
		expect(card.lifePoints).toBeNull();
	});

	it('adds an empty customMoves list to cards without one', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf' });
		expect(card.customMoves).toEqual([]);
	});

	it('keeps existing custom moves and adds a null color', () => {
		const moves = [{ trigger: 'Bei Feuerschaden', name: 'Panik', effect: 'Flieht 1 Runde.' }];
		const card = migrateCard({ id: 'a', name: 'Wolf', customMoves: moves });
		expect(card.customMoves).toEqual([{ ...moves[0], color: null }]);
	});

	it('keeps custom move colors', () => {
		const moves = [{ trigger: 'Bei Feuerschaden', name: 'Panik', effect: '', color: 'orange' }];
		const card = migrateCard({ id: 'a', name: 'Wolf', customMoves: moves });
		expect(card.customMoves).toEqual(moves);
	});

	it('keeps a valid bannerColor and nulls unknown values', () => {
		expect(migrateCard({ id: 'a', bannerColor: 'purple' }).bannerColor).toBe('purple');
		expect(migrateCard({ id: 'a', bannerColor: 'pink' }).bannerColor).toBeNull();
	});

	it('defaults every missing field so a bare object renders', () => {
		const card = migrateCard({});
		expect(typeof card.id).toBe('string');
		expect(card.name).toBe('');
		expect(card.category).toBe('');
		expect(card.banner).toBe('');
		expect(card.bannerColor).toBeNull();
		expect(card.flavorText).toBe('');
		expect(card.notes).toBe('');
		expect(card.image).toBeNull();
		expect(card.talents.body).toEqual({ fw: null, valueOverride: null, maxQsOverride: null });
		expect(card.talents.craft).toEqual({ fw: null, valueOverride: null, maxQsOverride: null });
		expect(card.attributes.courage).toBeNull();
		expect(card.attributes.strength).toBeNull();
		expect(card.actions).toEqual([]);
		expect(card.specialMoves.death).toEqual({ name: '', effect: '', color: null });
		expect(card.customMoves).toEqual([]);
		expect(card.lifePoints).toBeNull();
		expect(card.armor).toBe('');
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
		expect(card.flavorText).toBe('');
		expect(card.image).toBeNull();
		expect(card.talents.body).toEqual({ fw: null, valueOverride: null, maxQsOverride: 2 });
		expect(card.customMoves).toEqual([{ trigger: 'Feuer', name: '', effect: '', color: null }]);
	});

	it('turns pre-derivation talent values into manual overrides', () => {
		const card = migrateCard({
			id: 'a',
			name: 'Wolf',
			talents: { body: { value: 10, maxQs: 3 }, social: { value: 5, maxQs: 2 } }
		});
		expect(card.talents.body).toEqual({ fw: null, valueOverride: 10, maxQsOverride: 3 });
		expect(card.talents.social).toEqual({ fw: null, valueOverride: 5, maxQsOverride: 2 });
	});

	it('keeps current-shape talents and attributes as they are', () => {
		const card = migrateCard({
			id: 'a',
			name: 'Wolf',
			attributes: { courage: 14, strength: 12 },
			talents: { body: { fw: 7, valueOverride: null, maxQsOverride: null } }
		});
		expect(card.attributes.courage).toBe(14);
		expect(card.attributes.strength).toBe(12);
		expect(card.attributes.sagacity).toBeNull();
		expect(card.talents.body).toEqual({ fw: 7, valueOverride: null, maxQsOverride: null });
	});
});
