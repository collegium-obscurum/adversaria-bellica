import { describe, expect, it } from 'vitest';
import { categoryOptions, DSA_CREATURE_TYPES } from './creatureTypes';
import type { MonsterCard } from './types';
import { createEmptyCard } from './types';

function cardWithCategory(category: string): MonsterCard {
	const card = createEmptyCard();
	card.category = category;
	return card;
}

describe('categoryOptions', () => {
	it('contains all DSA types when there are no cards', () => {
		const options = categoryOptions([], '');
		for (const type of DSA_CREATURE_TYPES) {
			expect(options).toContain(type);
		}
		expect(options).toHaveLength(DSA_CREATURE_TYPES.length);
	});

	it('merges categories used on saved cards, ignoring empty ones', () => {
		const cards = [cardWithCategory('Golem'), cardWithCategory(''), cardWithCategory('  ')];
		const options = categoryOptions(cards, '');
		expect(options).toContain('Golem');
		expect(options).toHaveLength(DSA_CREATURE_TYPES.length + 1);
	});

	it('dedupes categories that match a DSA type or repeat across cards', () => {
		const cards = [cardWithCategory('Tier'), cardWithCategory('Golem'), cardWithCategory('Golem')];
		const options = categoryOptions(cards, 'Golem');
		expect(options).toHaveLength(DSA_CREATURE_TYPES.length + 1);
	});

	it('includes the current value even when no card uses it', () => {
		expect(categoryOptions([], 'Konstrukt')).toContain('Konstrukt');
	});

	it('sorts alphabetically with German collation', () => {
		const options = categoryOptions([], 'Golem');
		const golemIndex = options.indexOf('Golem');
		expect(options[golemIndex - 1]).toBe('Geist');
		expect(options[golemIndex + 1]).toBe('Kulturschaffender');
	});
});
