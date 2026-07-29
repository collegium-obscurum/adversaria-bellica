import { describe, expect, it } from 'vitest';
import { cardNameError } from './cardValidation';

describe('cardNameError', () => {
	it('rejects an empty name', () => {
		expect(cardNameError('')).toBe('Die Karte braucht einen Namen.');
	});

	it('rejects a whitespace-only name', () => {
		expect(cardNameError('   ')).toBe('Die Karte braucht einen Namen.');
	});

	it('accepts a real name', () => {
		expect(cardNameError('Goblin')).toBeNull();
	});
});
