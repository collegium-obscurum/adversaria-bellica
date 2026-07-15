import { describe, expect, it } from 'vitest';
import { createEmptyCard } from './types';

describe('createEmptyCard', () => {
	it('starts new cards with only the GK badge hidden', () => {
		expect(createEmptyCard().hiddenStats).toEqual(['sizeCategory']);
	});
});
