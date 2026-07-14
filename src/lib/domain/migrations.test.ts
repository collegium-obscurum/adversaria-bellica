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
			{ span: 5, name: 'Fehlschlag', effect: '' },
			{ span: 14, name: 'Angriff', effect: '1W6' },
			{ span: 1, name: 'Krit', effect: '2W6' }
		]);
	});

	it('passes span rows through unchanged', () => {
		const entries: ActionEntry[] = [{ span: 20, name: 'x', effect: '' }];
		expect(migrateActions(entries)).toEqual(entries);
	});

	it('handles empty lists', () => {
		expect(migrateActions([])).toEqual([]);
	});

	it('defaults malformed rows and drops non-objects', () => {
		expect(migrateActions([{ span: 'abc' }, null, 'garbage', { span: 3.4, name: 'x' }])).toEqual([
			{ span: 1, name: '', effect: '' },
			{ span: 3, name: 'x', effect: '' }
		]);
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
		expect(migrated.combatStart).toEqual({ name: '', effect: 'Brüllt laut.' });
		expect(migrated.hp50).toEqual({ name: '', effect: 'Netz' });
		expect(migrated.hp75).toEqual({ name: '', effect: '' });
	});

	it('passes object moves through', () => {
		const moves: Record<WoundTrigger, SpecialMove> = {
			combatStart: { name: 'Wutschrei', effect: '2W6' },
			hp75: { name: '', effect: '' },
			hp50: { name: '', effect: '' },
			hp25: { name: '', effect: '' },
			death: { name: '', effect: '' }
		};
		expect(migrateSpecialMoves(moves)).toEqual(moves);
	});

	it('fills missing triggers with empty moves', () => {
		const migrated = migrateSpecialMoves({});
		expect(migrated.death).toEqual({ name: '', effect: '' });
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

	it('clamps lifePoints to at least 1', () => {
		for (const bad of [0, -5, undefined, 'abc']) {
			const raw: Record<string, unknown> = { lifePoints: bad };
			migrateStats(raw);
			expect(raw.lifePoints).toBe(1);
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

describe('migrateCard', () => {
	it('migrates stats too', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf', armor: 2, lifePoints: 0 });
		expect(card.armor).toBe('2');
		expect(card.lifePoints).toBe(1);
	});

	it('adds an empty customMoves list to cards without one', () => {
		const card = migrateCard({ id: 'a', name: 'Wolf' });
		expect(card.customMoves).toEqual([]);
	});

	it('keeps existing custom moves', () => {
		const moves = [{ trigger: 'Bei Feuerschaden', name: 'Panik', effect: 'Flieht 1 Runde.' }];
		const card = migrateCard({ id: 'a', name: 'Wolf', customMoves: moves });
		expect(card.customMoves).toEqual(moves);
	});

	it('defaults every missing field so a bare object renders', () => {
		const card = migrateCard({});
		expect(typeof card.id).toBe('string');
		expect(card.name).toBe('');
		expect(card.category).toBe('');
		expect(card.flavorText).toBe('');
		expect(card.notes).toBe('');
		expect(card.image).toBeNull();
		expect(card.talents.body).toEqual({ fw: null, valueOverride: null, maxQsOverride: null });
		expect(card.talents.craft).toEqual({ fw: null, valueOverride: null, maxQsOverride: null });
		expect(card.attributes.courage).toBeNull();
		expect(card.attributes.strength).toBeNull();
		expect(card.actions).toEqual([]);
		expect(card.specialMoves.death).toEqual({ name: '', effect: '' });
		expect(card.customMoves).toEqual([]);
		expect(card.lifePoints).toBe(1);
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
		expect(card.customMoves).toEqual([{ trigger: 'Feuer', name: '', effect: '' }]);
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
