import { describe, expect, it } from 'vitest';
import { parseStatLabelMode } from './statLabelMode';

describe('parseStatLabelMode', () => {
	it('keeps known modes', () => {
		expect(parseStatLabelMode('icons')).toBe('icons');
		expect(parseStatLabelMode('text')).toBe('text');
	});

	it('falls back to icons for unknown or missing values', () => {
		expect(parseStatLabelMode(null)).toBe('icons');
		expect(parseStatLabelMode(undefined)).toBe('icons');
		expect(parseStatLabelMode('emoji')).toBe('icons');
		expect(parseStatLabelMode(42)).toBe('icons');
	});
});
