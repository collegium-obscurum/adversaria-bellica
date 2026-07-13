import { describe, expect, it } from 'vitest';
import { validateActionRanges } from './validation';
import type { ActionEntry } from './types';

function entry(from: number, to: number, name = 'Test'): ActionEntry {
	return { from, to, name, effect: '' };
}

describe('validateActionRanges', () => {
	it('accepts a full 1-20 coverage without gaps or overlaps', () => {
		expect(validateActionRanges([entry(1, 5), entry(6, 19), entry(20, 20)])).toEqual([]);
	});

	it('accepts unsorted input', () => {
		expect(validateActionRanges([entry(20, 20), entry(1, 5), entry(6, 19)])).toEqual([]);
	});

	it('rejects an empty table', () => {
		expect(validateActionRanges([])).toHaveLength(1);
	});

	it('reports a gap', () => {
		const errors = validateActionRanges([entry(1, 5), entry(8, 20)]);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toContain('6–7');
	});

	it('reports a gap at the end', () => {
		const errors = validateActionRanges([entry(1, 18)]);
		expect(errors[0]).toContain('19–20');
	});

	it('reports an overlap', () => {
		const errors = validateActionRanges([entry(1, 10), entry(8, 20)]);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toContain('Überlappung');
	});

	it('rejects values outside 1-20', () => {
		expect(validateActionRanges([entry(0, 20)])).toHaveLength(1);
		expect(validateActionRanges([entry(1, 21)])).toHaveLength(1);
	});

	it('rejects from greater than to', () => {
		expect(validateActionRanges([entry(10, 5)])).toHaveLength(1);
	});

	it('rejects non-integer bounds', () => {
		expect(validateActionRanges([entry(1.5, 20)])).toHaveLength(1);
	});
});
