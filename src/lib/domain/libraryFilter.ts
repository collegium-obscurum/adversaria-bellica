import type { MonsterCard } from './types';

/** Select value for "ohne Typ" / "ohne Banner"; NUL prefix keeps it collision-free with real text. */
export const WITHOUT = '\u0000without';

export interface LibraryFilter {
	search: string;
	/** '' = all, WITHOUT = cards without a value, anything else = exact match */
	category: string;
	banner: string;
}

export function filterCards(cards: MonsterCard[], filter: LibraryFilter): MonsterCard[] {
	const query = filter.search.toLowerCase();
	return cards.filter((card) => {
		if (!matchesField(card.category, filter.category)) return false;
		if (!matchesField(card.banner, filter.banner)) return false;
		return card.name.toLowerCase().includes(query);
	});
}

function matchesField(value: string, selected: string): boolean {
	if (selected === '') return true;
	if (selected === WITHOUT) return value.trim() === '';
	return value === selected;
}
