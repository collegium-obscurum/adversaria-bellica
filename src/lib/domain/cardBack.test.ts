import { describe, expect, it } from 'vitest';
import {
	BACK_IMAGE_HEIGHT_PX,
	BACK_IMAGE_WIDTH_PX,
	coverCropRect,
	parseCardBackMode
} from './cardBack';

describe('parseCardBackMode', () => {
	it('accepts custom', () => {
		expect(parseCardBackMode('custom')).toBe('custom');
	});

	it('falls back to default for anything else', () => {
		expect(parseCardBackMode(null)).toBe('default');
		expect(parseCardBackMode('garbage')).toBe('default');
	});
});

describe('coverCropRect', () => {
	const ratio = BACK_IMAGE_WIDTH_PX / BACK_IMAGE_HEIGHT_PX;

	it('crops the sides of a wide image, centered', () => {
		const rect = coverCropRect(4000, 1748);
		expect(rect.height).toBe(1748);
		expect(rect.width).toBeCloseTo(1748 * ratio);
		expect(rect.x).toBeCloseTo((4000 - rect.width) / 2);
		expect(rect.y).toBe(0);
	});

	it('crops top and bottom of a tall image, centered', () => {
		const rect = coverCropRect(1240, 5000);
		expect(rect.width).toBe(1240);
		expect(rect.height).toBeCloseTo(1240 / ratio);
		expect(rect.x).toBe(0);
		expect(rect.y).toBeCloseTo((5000 - rect.height) / 2);
	});

	it('keeps an image that already matches the card ratio', () => {
		const rect = coverCropRect(BACK_IMAGE_WIDTH_PX, BACK_IMAGE_HEIGHT_PX);
		expect(rect.x).toBe(0);
		expect(rect.width).toBe(BACK_IMAGE_WIDTH_PX);
		expect(rect.height).toBeCloseTo(BACK_IMAGE_HEIGHT_PX, 6);
		expect(rect.y).toBeCloseTo(0, 6);
	});
});
