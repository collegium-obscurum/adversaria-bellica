import { describe, expect, it } from 'vitest';
import { STAT_BADGES } from './statBadges';
import { statIconMarkup } from './statIcons';

describe('statIconMarkup', () => {
	it('renders markup for every stat key', () => {
		for (const badge of STAT_BADGES) {
			expect(statIconMarkup(badge.key)).toContain('<path');
		}
	});

	it('uses only attribute-based styling, no CSS classes', () => {
		// class-styled SVG children lose their styles in html-to-image exports
		for (const badge of STAT_BADGES) {
			expect(statIconMarkup(badge.key)).not.toContain('class=');
		}
	});

	it('gives every path an explicit fill or stroke', () => {
		for (const badge of STAT_BADGES) {
			const tags = statIconMarkup(badge.key).match(/<(?:path|circle)[^>]*>/g) ?? [];
			expect(tags.length).toBeGreaterThan(0);
			for (const tag of tags) {
				expect(tag).toMatch(/fill="|stroke="/);
			}
		}
	});

	it('draws cut lines in the given colour', () => {
		expect(statIconMarkup('armor', '#7a1e12')).toContain('stroke="#7a1e12"');
		expect(statIconMarkup('actionCount', '#262019')).toContain('stroke="#262019"');
	});

	it('defaults cut lines to white', () => {
		expect(statIconMarkup('armor')).toContain('stroke="#fff"');
	});
});
