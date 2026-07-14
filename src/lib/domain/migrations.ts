import type {
	ActionEntry,
	CustomMove,
	MonsterCard,
	SpecialMove,
	TalentKey,
	TalentValue,
	WoundTrigger
} from './types';
import { TALENT_KEYS, WOUND_TRIGGERS } from './types';
import { FIT_FLOOR, type FitResult } from './cardFit';

interface LegacyActionEntry {
	from: number;
	to: number;
	name: string;
	effect: string;
}

function isLegacyAction(entry: unknown): entry is LegacyActionEntry {
	return typeof entry === 'object' && entry !== null && 'from' in entry && 'to' in entry;
}

function textOrEmpty(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

/** Convert pre-span rows ({from, to}) and default malformed rows; drops non-object entries. */
export function migrateActions(actions: unknown[]): ActionEntry[] {
	let rows = actions;
	if (actions.length > 0 && isLegacyAction(actions[0])) {
		const legacy = [...(actions as LegacyActionEntry[])].sort((a, b) => a.from - b.from);
		rows = legacy.map((entry) => ({
			span: entry.to - entry.from + 1,
			name: entry.name,
			effect: entry.effect
		}));
	}
	const result: ActionEntry[] = [];
	for (const row of rows) {
		if (typeof row !== 'object' || row === null) continue;
		const record = row as Record<string, unknown>;
		const span = Number(record.span);
		result.push({
			span: Number.isFinite(span) ? Math.max(1, Math.round(span)) : 1,
			name: textOrEmpty(record.name),
			effect: textOrEmpty(record.effect)
		});
	}
	return result;
}

/** Convert pre-object moves (plain strings become the effect); malformed fields default to ''. */
export function migrateSpecialMoves(moves: unknown): Record<WoundTrigger, SpecialMove> {
	const record =
		typeof moves === 'object' && moves !== null ? (moves as Record<string, unknown>) : {};
	const result = {} as Record<WoundTrigger, SpecialMove>;
	for (const trigger of WOUND_TRIGGERS) {
		const value = record[trigger];
		if (typeof value === 'string') {
			result[trigger] = { name: '', effect: value };
		} else if (typeof value === 'object' && value !== null) {
			const move = value as Record<string, unknown>;
			result[trigger] = { name: textOrEmpty(move.name), effect: textOrEmpty(move.effect) };
		} else {
			result[trigger] = { name: '', effect: '' };
		}
	}
	return result;
}

export function migrateCustomMoves(raw: unknown): CustomMove[] {
	if (!Array.isArray(raw)) return [];
	const result: CustomMove[] = [];
	for (const item of raw) {
		if (typeof item !== 'object' || item === null) continue;
		const record = item as Record<string, unknown>;
		result.push({
			trigger: textOrEmpty(record.trigger),
			name: textOrEmpty(record.name),
			effect: textOrEmpty(record.effect)
		});
	}
	return result;
}

export function migrateTalents(raw: unknown): Record<TalentKey, TalentValue> {
	const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
	const result = {} as Record<TalentKey, TalentValue>;
	for (const key of TALENT_KEYS) {
		const value =
			typeof record[key] === 'object' && record[key] !== null
				? (record[key] as Record<string, unknown>)
				: {};
		result[key] = {
			value: typeof value.value === 'number' ? value.value : 0,
			maxQs: typeof value.maxQs === 'number' ? value.maxQs : 0
		};
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

/** Cards saved before fit tracking count as fitting until their next save re-measures them. */
export function migrateFit(raw: unknown): FitResult {
	if (typeof raw !== 'object' || raw === null) {
		return { scale: 1, fits: true, imageHidden: false };
	}
	const record = raw as Record<string, unknown>;
	const scale = Number(record.scale);
	return {
		scale: Number.isFinite(scale) ? Math.min(1, Math.max(FIT_FLOOR, scale)) : 1,
		fits: record.fits !== false,
		imageHidden: record.imageHidden === true
	};
}

/** Bring a card parsed from storage or import JSON up to the current schema; every field gets a sane default. */
export function migrateCard(raw: Record<string, unknown>): MonsterCard {
	raw.id = typeof raw.id === 'string' ? raw.id : crypto.randomUUID();
	raw.name = textOrEmpty(raw.name);
	raw.category = textOrEmpty(raw.category);
	raw.flavorText = textOrEmpty(raw.flavorText);
	raw.notes = textOrEmpty(raw.notes);
	raw.image = typeof raw.image === 'string' ? raw.image : null;
	raw.talents = migrateTalents(raw.talents);
	raw.actions = migrateActions(Array.isArray(raw.actions) ? raw.actions : []);
	raw.specialMoves = migrateSpecialMoves(raw.specialMoves);
	raw.customMoves = migrateCustomMoves(raw.customMoves);
	raw.fit = migrateFit(raw.fit);
	migrateStats(raw);
	return raw as unknown as MonsterCard;
}
