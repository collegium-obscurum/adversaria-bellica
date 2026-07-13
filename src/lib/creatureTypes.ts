import type { MonsterCard } from './types';

export const DSA_CREATURE_TYPES = [
	'Tier',
	'Chimäre',
	'Dämon',
	'Drache',
	'Elementar',
	'Fee',
	'Geist',
	'Kulturschaffender',
	'Pflanze',
	'Untoter',
	'Übernatürliches Wesen'
] as const;

/** DSA types + categories used on saved cards + the current card's value, deduped and sorted. */
export function categoryOptions(cards: MonsterCard[], current: string): string[] {
	const options = new Set<string>(DSA_CREATURE_TYPES);
	for (const card of cards) {
		if (card.category.trim() !== '') {
			options.add(card.category);
		}
	}
	if (current.trim() !== '') {
		options.add(current);
	}
	return [...options].sort((a, b) => a.localeCompare(b, 'de'));
}
