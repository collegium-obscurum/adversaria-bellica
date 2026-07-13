import { describe, expect, it } from 'vitest';
import { parseCardStyle } from './cardStyle';

describe('parseCardStyle', () => {
	it('keeps known styles', () => {
		expect(parseCardStyle('ornate')).toBe('ornate');
		expect(parseCardStyle('minimal')).toBe('minimal');
	});

	it('falls back to minimal for unknown or missing values', () => {
		expect(parseCardStyle(null)).toBe('minimal');
		expect(parseCardStyle(undefined)).toBe('minimal');
		expect(parseCardStyle('fancy')).toBe('minimal');
		expect(parseCardStyle(42)).toBe('minimal');
	});
});
