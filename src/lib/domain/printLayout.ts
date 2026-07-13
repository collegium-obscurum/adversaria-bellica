import type { MonsterCard } from './types';

export const CARD_WIDTH_MM = 105;
export const CARD_HEIGHT_MM = 148;
export const CARDS_PER_PAGE = 4;

/** Position of a card on its A4 page: 2×2 grid, filled left to right, top to bottom. */
export function cardSlotPosition(index: number): { x: number; y: number } {
	const slot = index % CARDS_PER_PAGE;
	return {
		x: (slot % 2) * CARD_WIDTH_MM,
		y: slot >= 2 ? CARD_HEIGHT_MM : 0
	};
}

/** Cards in the order they were selected; ids without a matching card are skipped. */
export function cardsInSelectionOrder(cards: MonsterCard[], selectedIds: string[]): MonsterCard[] {
	const byId = new Map(cards.map((card) => [card.id, card]));
	const result: MonsterCard[] = [];
	for (const id of selectedIds) {
		const card = byId.get(id);
		if (card) result.push(card);
	}
	return result;
}
