import { describe, expect, it } from 'vitest';
import { CARD_WIDTH_PX, cardZoom } from './cardZoom';

describe('cardZoom', () => {
	it('caps at 1.7 on wide screens', () => {
		expect(cardZoom(2000)).toBe(1.7);
	});

	it('shrinks below 1 when the card is wider than the available space', () => {
		const zoom = cardZoom(350);
		expect(zoom).toBeLessThan(1);
		expect(zoom * CARD_WIDTH_PX).toBeLessThanOrEqual(350);
	});

	it('fills the available width between card size and the cap', () => {
		expect(cardZoom(CARD_WIDTH_PX * 1.5)).toBeCloseTo(1.5);
	});

	it('falls back to 1 before the container is measured', () => {
		expect(cardZoom(0)).toBe(1);
	});
});
