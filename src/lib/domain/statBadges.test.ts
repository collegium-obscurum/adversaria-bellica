import { describe, expect, it } from 'vitest';
import { STAT_BADGES, badgeLabel } from './statBadges';

describe('badgeLabel', () => {
	it('uses the full word for the action count badge', () => {
		const actionBadge = STAT_BADGES.find((badge) => badge.key === 'actionCount');
		if (!actionBadge) throw new Error('actionCount badge missing from STAT_BADGES');
		expect(badgeLabel(actionBadge)).toBe('Aktionen');
	});

	it('uses the abbreviation for every other badge', () => {
		for (const badge of STAT_BADGES.filter((badge) => badge.key !== 'actionCount')) {
			expect(badgeLabel(badge)).toBe(badge.abbr);
		}
	});
});
