import { describe, expect, it } from 'vitest';
import { parseColorMode } from './colorMode';

describe('parseColorMode', () => {
	it('keeps known modes', () => {
		expect(parseColorMode('text')).toBe('text');
		expect(parseColorMode('dot')).toBe('dot');
	});

	it('falls back to text for unknown or missing values', () => {
		expect(parseColorMode(null)).toBe('text');
		expect(parseColorMode(undefined)).toBe('text');
		expect(parseColorMode('rainbow')).toBe('text');
		expect(parseColorMode(1)).toBe('text');
	});
});
