import { describe, expect, it } from 'vitest';
import { computeCardFit, computeFitScale, FIT_FLOOR } from './cardFit';

describe('computeFitScale', () => {
	it('keeps scale 1 when content already fits', () => {
		const result = computeFitScale(() => false);
		expect(result).toEqual({ scale: 1, fits: true });
	});

	it('steps down until the content fits', () => {
		const result = computeFitScale((scale) => scale > 0.85);
		expect(result.fits).toBe(true);
		expect(result.scale).toBe(0.85);
	});

	it('applies each candidate scale before measuring', () => {
		const tried: number[] = [];
		computeFitScale((scale) => {
			tried.push(scale);
			return scale > 0.9;
		});
		expect(tried).toEqual([1, 0.95, 0.9]);
	});

	it('stops at the floor when content fits exactly there', () => {
		const result = computeFitScale((scale) => scale > FIT_FLOOR);
		expect(result).toEqual({ scale: FIT_FLOOR, fits: true });
	});

	it('reports fits=false when even the floor overflows', () => {
		const result = computeFitScale(() => true);
		expect(result).toEqual({ scale: FIT_FLOOR, fits: false });
	});
});

describe('computeCardFit', () => {
	it('keeps the image when text shrinking is enough', () => {
		const result = computeCardFit(true, (scale) => scale > 0.8);
		expect(result).toEqual({ scale: 0.8, fits: true, imageHidden: false });
	});

	it('drops the image as last resort and re-fits from full size', () => {
		const result = computeCardFit(true, (scale, imageHidden) => (imageHidden ? scale > 0.9 : true));
		expect(result).toEqual({ scale: 0.9, fits: true, imageHidden: true });
	});

	it('never drops a missing image', () => {
		const result = computeCardFit(false, () => true);
		expect(result).toEqual({ scale: FIT_FLOOR, fits: false, imageHidden: false });
	});

	it('reports fits=false when even the imageless floor overflows', () => {
		const result = computeCardFit(true, () => true);
		expect(result).toEqual({ scale: FIT_FLOOR, fits: false, imageHidden: true });
	});
});
