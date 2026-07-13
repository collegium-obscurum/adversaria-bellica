import type { ActionEntry, CustomMove, MonsterCard, SpecialMove, WoundTrigger } from './types';
import { WOUND_TRIGGERS } from './types';

interface LegacyActionEntry {
	from: number;
	to: number;
	name: string;
	effect: string;
}

function isLegacyAction(entry: unknown): entry is LegacyActionEntry {
	return typeof entry === 'object' && entry !== null && 'from' in entry && 'to' in entry;
}

/** Convert pre-span rows ({from, to}); already-migrated rows pass through. */
export function migrateActions(actions: unknown[]): ActionEntry[] {
	if (actions.length === 0 || !isLegacyAction(actions[0])) {
		return actions as ActionEntry[];
	}
	const legacy = [...(actions as LegacyActionEntry[])].sort((a, b) => a.from - b.from);
	return legacy.map((entry) => ({
		span: Math.max(1, entry.to - entry.from + 1),
		name: entry.name,
		effect: entry.effect
	}));
}

/** Convert pre-object moves (plain strings become the effect); objects pass through. */
export function migrateSpecialMoves(moves: unknown): Record<WoundTrigger, SpecialMove> {
	const record =
		typeof moves === 'object' && moves !== null ? (moves as Record<string, unknown>) : {};
	const result = {} as Record<WoundTrigger, SpecialMove>;
	for (const trigger of WOUND_TRIGGERS) {
		const value = record[trigger];
		if (typeof value === 'string') {
			result[trigger] = { name: '', effect: value };
		} else if (typeof value === 'object' && value !== null) {
			result[trigger] = value as SpecialMove;
		} else {
			result[trigger] = { name: '', effect: '' };
		}
	}
	return result;
}

const TEXT_STAT_KEYS = [
	'armor',
	'initiative',
	'speed',
	'defense',
	'soulPower',
	'toughness',
	'actionCount'
] as const;

/** Convert pre-string numeric stats; lifePoints stays a number clamped to at least 1. */
export function migrateStats(raw: Record<string, unknown>): void {
	for (const key of TEXT_STAT_KEYS) {
		const value = raw[key];
		if (typeof value === 'string') continue;
		raw[key] = typeof value === 'number' ? String(value) : '';
	}
	const lifePoints = Number(raw.lifePoints);
	raw.lifePoints = Number.isFinite(lifePoints) ? Math.max(1, lifePoints) : 1;
}

/** Bring a card parsed from storage or import JSON up to the current schema. */
export function migrateCard(raw: Record<string, unknown>): MonsterCard {
	raw.actions = migrateActions(Array.isArray(raw.actions) ? raw.actions : []);
	raw.specialMoves = migrateSpecialMoves(raw.specialMoves);
	raw.customMoves = Array.isArray(raw.customMoves) ? (raw.customMoves as CustomMove[]) : [];
	migrateStats(raw);
	return raw as unknown as MonsterCard;
}
