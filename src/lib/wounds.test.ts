import { describe, expect, it } from 'vitest';
import { woundThresholds } from './wounds';

describe('woundThresholds', () => {
	it('computes cumulative damage for a max HP divisible by 4', () => {
		expect(woundThresholds(40)).toEqual([
			{ label: '75%', damage: 10 },
			{ label: '50%', damage: 20 },
			{ label: '25%', damage: 30 },
			{ label: 'Tod', damage: 40 }
		]);
	});

	it('rounds up so the threshold triggers at or below the percentage', () => {
		expect(woundThresholds(30)).toEqual([
			{ label: '75%', damage: 8 },
			{ label: '50%', damage: 15 },
			{ label: '25%', damage: 23 },
			{ label: 'Tod', damage: 30 }
		]);
	});
});
