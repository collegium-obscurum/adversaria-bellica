import { describe, expect, it } from 'vitest';
import { createEmptyCard, type MonsterCard } from './types';
import { filterCards, WITHOUT } from './libraryFilter';

function card(overrides: Partial<MonsterCard>): MonsterCard {
	return { ...createEmptyCard(), ...overrides };
}

const wolf = card({ name: 'Wolf', category: 'Tier', banner: 'Wald' });
const goblin = card({ name: 'Goblin', category: 'Humanoid', banner: '' });
const ghoul = card({ name: 'Ghul', category: '', banner: 'Wald' });
const all = [wolf, goblin, ghoul];

describe('filterCards', () => {
	it('returns everything with an empty filter', () => {
		expect(filterCards(all, { search: '', category: '', banner: '' })).toEqual(all);
	});

	it('matches names case-insensitively', () => {
		expect(filterCards(all, { search: 'wolf', category: '', banner: '' })).toEqual([wolf]);
	});

	it('filters by exact category', () => {
		expect(filterCards(all, { search: '', category: 'Tier', banner: '' })).toEqual([wolf]);
	});

	it('WITHOUT finds cards without a category', () => {
		expect(filterCards(all, { search: '', category: WITHOUT, banner: '' })).toEqual([ghoul]);
	});

	it('filters by banner text', () => {
		expect(filterCards(all, { search: '', category: '', banner: 'Wald' })).toEqual([wolf, ghoul]);
	});

	it('WITHOUT finds cards without a banner', () => {
		expect(filterCards(all, { search: '', category: '', banner: WITHOUT })).toEqual([goblin]);
	});

	it('combines category and banner as AND', () => {
		expect(filterCards(all, { search: '', category: WITHOUT, banner: 'Wald' })).toEqual([ghoul]);
	});
});
