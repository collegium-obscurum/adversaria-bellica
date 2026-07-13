import { describe, expect, it } from 'vitest';
import { migrateActions, migrateCard, migrateSpecialMoves, migrateStats } from './migrations';
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
		expect(migrateActions(entries)).toBe(entries);
	});

	it('handles empty lists', () => {
		expect(migrateActions([])).toEqual([]);
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
});
