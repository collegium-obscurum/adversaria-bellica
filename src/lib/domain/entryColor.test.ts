import { describe, expect, it } from 'vitest';
import { ENTRY_COLORS, parseEntryColor } from './entryColor';

describe('parseEntryColor', () => {
	it('keeps every palette token', () => {
		for (const color of ENTRY_COLORS) {
			expect(parseEntryColor(color)).toBe(color);
		}
	});

	it('returns null for unknown or missing values', () => {
		expect(parseEntryColor(null)).toBeNull();
		expect(parseEntryColor(undefined)).toBeNull();
		expect(parseEntryColor('magenta')).toBeNull();
		expect(parseEntryColor('#c0392b')).toBeNull();
		expect(parseEntryColor(3)).toBeNull();
	});
});
