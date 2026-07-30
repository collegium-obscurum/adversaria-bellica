import { describe, expect, it } from 'vitest';
import { parseCardStyle, parseColorMode, parseStatLabelMode } from './preferences';

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
