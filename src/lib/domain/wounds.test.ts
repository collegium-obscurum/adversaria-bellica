import { describe, expect, it } from 'vitest';
import { createEmptyCard } from './types';
import { syncWounds, TRIGGER_LABELS, woundThresholds } from './wounds';

describe('woundThresholds', () => {
	it('computes cumulative damage for a max HP divisible by 4', () => {
		expect(woundThresholds('40')).toEqual({ hp75: '10', hp50: '20', hp25: '30', death: '40' });
	});

	it('rounds up so the threshold triggers at or below the percentage', () => {
		expect(woundThresholds('30')).toEqual({ hp75: '8', hp50: '15', hp25: '23', death: '30' });
	});

	it('yields nothing for HP that is not a plain number', () => {
		expect(woundThresholds('2W6+4')).toBeNull();
		expect(woundThresholds('')).toBeNull();
		expect(woundThresholds('   ')).toBeNull();
		expect(woundThresholds('0')).toBeNull();
	});
});

describe('syncWounds', () => {
	function cardWithHp(lifePoints: string) {
		const card = createEmptyCard();
		card.stats.lifePoints.value = lifePoints;
		return card;
	}

	it('refills the thresholds from a numeric HP', () => {
		const card = cardWithHp('40');
		syncWounds(card);
		expect(card.wounds).toMatchObject({ hp75: '10', hp50: '20', hp25: '30', death: '40' });
	});

	it('keeps the previous thresholds once HP stops parsing', () => {
		const card = cardWithHp('40');
		syncWounds(card);
		card.stats.lifePoints.value = '2W6+4';
		syncWounds(card);
		expect(card.wounds).toMatchObject({ hp75: '10', hp50: '20', hp25: '30', death: '40' });
	});

	it('leaves manually edited thresholds alone', () => {
		const card = cardWithHp('40');
		card.wounds.manual = true;
		card.wounds.hp50 = 'halbe LeP';
		syncWounds(card);
		expect(card.wounds.hp50).toBe('halbe LeP');
		expect(card.wounds.hp75).toBe('5');
	});
});

describe('TRIGGER_LABELS', () => {
	it('names the pain steps without repeating the numbers', () => {
		expect(TRIGGER_LABELS).toEqual({
			combatStart: 'Kampfbeginn',
			hp75: 'ab Schmerz 1',
			hp50: 'ab Schmerz 2',
			hp25: 'ab Schmerz 3',
			death: 'Tod'
		});
	});
});
