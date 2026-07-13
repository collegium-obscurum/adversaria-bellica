import { createEmptyCard, type MonsterCard } from './types';

export function resolveEditorCard(
	requestedId: string | null,
	existing: MonsterCard | undefined
): { card: MonsterCard; missing: boolean } {
	if (existing) return { card: existing, missing: false };
	return { card: createEmptyCard(), missing: requestedId !== null };
}
