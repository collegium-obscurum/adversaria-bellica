import { describe, expect, it } from 'vitest';
import { createEmptyCard } from './types';
import { backSlotPosition, cardSlotPosition, cardsInSelectionOrder } from './printLayout';

describe('cardSlotPosition', () => {
	it('fills a 2×2 grid left to right, top to bottom', () => {
		expect(cardSlotPosition(0)).toEqual({ x: 0, y: 0 });
		expect(cardSlotPosition(1)).toEqual({ x: 105, y: 0 });
		expect(cardSlotPosition(2)).toEqual({ x: 0, y: 148 });
		expect(cardSlotPosition(3)).toEqual({ x: 105, y: 148 });
	});

	it('repeats per page', () => {
		expect(cardSlotPosition(4)).toEqual(cardSlotPosition(0));
		expect(cardSlotPosition(7)).toEqual(cardSlotPosition(3));
	});
});

describe('backSlotPosition', () => {
	it('mirrors columns so backs land behind fronts on a long-edge duplex flip', () => {
		expect(backSlotPosition(0)).toEqual({ x: 105, y: 0 });
		expect(backSlotPosition(1)).toEqual({ x: 0, y: 0 });
		expect(backSlotPosition(2)).toEqual({ x: 105, y: 148 });
		expect(backSlotPosition(3)).toEqual({ x: 0, y: 148 });
	});

	it('repeats per page', () => {
		expect(backSlotPosition(4)).toEqual(backSlotPosition(0));
	});
});

describe('cardsInSelectionOrder', () => {
	function named(name: string) {
		return { ...createEmptyCard(), id: name, name };
	}

	it('follows selection order, not library order', () => {
		const cards = [named('a'), named('b'), named('c')];
		const ordered = cardsInSelectionOrder(cards, ['c', 'a']);
		expect(ordered.map((card) => card.name)).toEqual(['c', 'a']);
	});

	it('skips ids without a card', () => {
		const ordered = cardsInSelectionOrder([named('a')], ['gone', 'a']);
		expect(ordered.map((card) => card.name)).toEqual(['a']);
	});
});
