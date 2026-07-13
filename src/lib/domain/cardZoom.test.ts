import { describe, expect, it } from 'vitest';
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, cardFitZoom, cardZoom } from './cardZoom';

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

describe('cardFitZoom', () => {
	it('caps at 1.7 when both dimensions have room', () => {
		expect(cardFitZoom(2000, 2000)).toBe(1.7);
	});

	it('is limited by height when width has room', () => {
		const zoom = cardFitZoom(2000, CARD_HEIGHT_PX * 0.5);
		expect(zoom).toBeCloseTo(0.5);
		expect(zoom * CARD_HEIGHT_PX).toBeLessThanOrEqual(CARD_HEIGHT_PX * 0.5);
	});

	it('is limited by width when height has room', () => {
		expect(cardFitZoom(CARD_WIDTH_PX * 0.8, 2000)).toBeCloseTo(0.8);
	});

	it('falls back to 1 before the viewport is measured', () => {
		expect(cardFitZoom(0, 800)).toBe(1);
		expect(cardFitZoom(800, 0)).toBe(1);
	});
});
