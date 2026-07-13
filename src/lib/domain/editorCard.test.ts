import { describe, expect, it } from 'vitest';
import { createEmptyCard } from './types';
import { resolveEditorCard } from './editorCard';

describe('resolveEditorCard', () => {
	it('returns the existing card when the id was found', () => {
		const card = { ...createEmptyCard(), name: 'Grimwolf' };
		expect(resolveEditorCard('some-id', card)).toEqual({ card, missing: false });
	});

	it('flags a requested id that no longer exists', () => {
		const result = resolveEditorCard('deleted-id', undefined);
		expect(result.missing).toBe(true);
		expect(result.card.name).toBe('');
	});

	it('starts a plain new card when no id was requested', () => {
		const result = resolveEditorCard(null, undefined);
		expect(result.missing).toBe(false);
		expect(result.card.name).toBe('');
	});
});
