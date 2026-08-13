import { describe, expect, it } from 'vitest';
import { createEmptyCard, WOUND_TRIGGERS } from './types';
import { STAT_BADGES } from './statBadges';

describe('createEmptyCard', () => {
	it('starts new cards with only the GK badge hidden', () => {
		const card = createEmptyCard();
		const hidden = STAT_BADGES.filter((badge) => card.stats[badge.key].hidden).map(
			(badge) => badge.key
		);
		expect(hidden).toEqual(['sizeCategory']);
	});

	it('starts the optional blocks hidden, values empty but present', () => {
		const card = createEmptyCard();
		expect(card.wounds.hidden).toBe(true);
		expect(card.notes).toEqual({ value: '', hidden: true });
		expect(card.flavorText).toEqual({ value: '', hidden: true });
		expect(card.banner).toEqual({ value: '', color: null, hidden: true });
		expect(card.talents.hidden).toBe(true);
		expect(card.specialMoves.hidden).toBe(true);
		expect(card.specialMoves.rows.every((row) => row.hidden)).toBe(true);
		expect(card.specialMoves.rows.map((row) => row.trigger)).toEqual(WOUND_TRIGGERS);
	});
});
