import { describe, expect, it } from 'vitest';
import { triggerLabels, woundThresholds } from './wounds';

describe('woundThresholds', () => {
	it('computes cumulative damage for a max HP divisible by 4', () => {
		expect(woundThresholds(40)).toEqual({ hp75: 10, hp50: 20, hp25: 30, death: 40 });
	});

	it('rounds up so the threshold triggers at or below the percentage', () => {
		expect(woundThresholds(30)).toEqual({ hp75: 8, hp50: 15, hp25: 23, death: 30 });
	});

	it('treats invalid max HP as 1 while the editor input is empty', () => {
		expect(woundThresholds(Number.NaN)).toEqual(woundThresholds(1));
		expect(woundThresholds(0)).toEqual(woundThresholds(1));
	});
});

describe('triggerLabels', () => {
	it('shows cumulative damage for HP slots, event names for the rest', () => {
		expect(triggerLabels(30)).toEqual({
			combatStart: 'Kampfbeginn',
			hp75: 'ab 8 Schaden',
			hp50: 'ab 15 Schaden',
			hp25: 'ab 23 Schaden',
			death: 'Tod'
		});
	});

	it('still yields event labels without HP; HP slots are hidden by the caller', () => {
		expect(triggerLabels(null).combatStart).toBe('Kampfbeginn');
		expect(triggerLabels(null).death).toBe('Tod');
	});
});
