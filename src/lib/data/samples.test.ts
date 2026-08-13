import { describe, expect, it } from 'vitest';
import { sampleCards } from './samples';

describe('sampleCards', () => {
	it('loads at least one sample migrated to the current schema', () => {
		expect(sampleCards.length).toBeGreaterThan(0);
		for (const card of sampleCards) {
			expect(card.name).not.toBe('');
			expect(typeof card.stats.armor.hidden).toBe('boolean');
			expect(card.talents.entries.body.maxQs).toBeGreaterThanOrEqual(1);
			expect(card.specialMoves.rows.some((row) => row.trigger === 'death')).toBe(true);
		}
	});

	it('uses unique ids', () => {
		const ids = sampleCards.map((card) => card.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	// under 20 is fine (the last row absorbs the remainder), over 20 leaves unreachable rows
	it('keeps action spans within the d20', () => {
		for (const card of sampleCards) {
			const total = card.actions.reduce((sum, action) => sum + action.span, 0);
			expect(total, card.name).toBeLessThanOrEqual(20);
		}
	});
});
