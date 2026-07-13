import { describe, expect, it } from 'vitest';
import { migrateActions, migrateSpecialMoves } from './migrations';
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
