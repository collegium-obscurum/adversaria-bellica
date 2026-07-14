import { describe, expect, it } from 'vitest';
import {
	clampQs,
	clampTalentValue,
	derivedTalent,
	effectiveTalent,
	talentMaxQs,
	talentValue
} from './talentCalc';
import type { AttributeKey } from './types';

function attributes(values: Partial<Record<AttributeKey, number>> = {}) {
	return {
		courage: null,
		sagacity: null,
		intuition: null,
		charisma: null,
		dexterity: null,
		agility: null,
		constitution: null,
		strength: null,
		...values
	};
}

describe('talentValue', () => {
	it('computes (sum - 25) / 2 + FW', () => {
		expect(talentValue(12, 12, 12, 6)).toBe(12); // (36-25)/2 = 5.5 -> 6, +6
	});

	it('rounds the halved base up', () => {
		expect(talentValue(13, 13, 13, 0)).toBe(7); // (39-25)/2 = 7
		expect(talentValue(13, 13, 14, 0)).toBe(8); // 7.5 -> 8
	});

	it('clamps to a minimum of 1', () => {
		expect(talentValue(8, 8, 8, 0)).toBe(1); // -0.5 -> 0 -> clamp
		expect(talentValue(5, 5, 5, 2)).toBe(1); // -5 + 2 -> clamp
	});

	it('clamps to a maximum of 99', () => {
		expect(talentValue(20, 20, 20, 90)).toBe(99); // 18 + 90 -> clamp
	});
});

describe('clampTalentValue', () => {
	it('keeps values in 1 to 99', () => {
		expect(clampTalentValue(0)).toBe(1);
		expect(clampTalentValue(50)).toBe(50);
		expect(clampTalentValue(120)).toBe(99);
		expect(clampTalentValue(NaN)).toBe(1);
	});
});

describe('clampQs', () => {
	it('keeps values in 1 to 6', () => {
		expect(clampQs(0)).toBe(1);
		expect(clampQs(4)).toBe(4);
		expect(clampQs(9)).toBe(6);
		expect(clampQs(NaN)).toBe(1);
	});
});

describe('talentMaxQs', () => {
	it('is FW / 3 rounded up', () => {
		expect(talentMaxQs(6)).toBe(2);
		expect(talentMaxQs(8)).toBe(3);
		expect(talentMaxQs(18)).toBe(6);
	});

	it('clamps to a maximum of 6', () => {
		expect(talentMaxQs(19)).toBe(6);
		expect(talentMaxQs(40)).toBe(6);
	});

	it('clamps to a minimum of 1', () => {
		expect(talentMaxQs(0)).toBe(1);
		expect(talentMaxQs(2)).toBe(1);
	});
});

describe('derivedTalent', () => {
	it('uses the group attributes (body = GE, MU, KK)', () => {
		const attrs = attributes({ agility: 12, courage: 12, strength: 12 });
		expect(derivedTalent(attrs, 6, 'body')).toEqual({ value: 12, maxQs: 2 });
	});

	it('treats empty attributes and FW as 0 and clamps to 1', () => {
		expect(derivedTalent(attributes(), null, 'body')).toEqual({ value: 1, maxQs: 1 });
	});
});

describe('effectiveTalent', () => {
	const attrs = attributes({ agility: 12, courage: 12, strength: 12 });

	it('returns the derived value when no override is set', () => {
		const talent = { fw: 6, valueOverride: null, maxQsOverride: null };
		expect(effectiveTalent(attrs, talent, 'body')).toEqual({ value: 12, maxQs: 2 });
	});

	it('prefers overrides independently per field', () => {
		const talent = { fw: 6, valueOverride: 15, maxQsOverride: null };
		expect(effectiveTalent(attrs, talent, 'body')).toEqual({ value: 15, maxQs: 2 });
		const qsOnly = { fw: 6, valueOverride: null, maxQsOverride: 4 };
		expect(effectiveTalent(attrs, qsOnly, 'body')).toEqual({ value: 12, maxQs: 4 });
	});
});
