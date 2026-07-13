import { describe, expect, it } from 'vitest';
import { clampQs, clampTalentValue, talentMaxQs, talentValue } from './talentCalc';

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
