import type {
	ActionEntry,
	AttributeKey,
	CustomMove,
	MonsterCard,
	SpecialMove,
	TalentEntry,
	TalentKey,
	WoundTrigger
} from './types';
import { ATTRIBUTE_KEYS, TALENT_KEYS, WOUND_TRIGGERS } from './types';
import { clampQs, clampTalentValue, derivedTalent } from './talentCalc';
import { parseEntryColor } from './entryColor';
import { FIT_FLOOR, type FitResult } from './cardFit';
import { STAT_BADGES, type StatKey } from './statBadges';

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
			effect: textOrEmpty(record.effect),
			color: parseEntryColor(record.color)
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
			result[trigger] = { name: '', effect: value, color: null };
		} else if (typeof value === 'object' && value !== null) {
			const move = value as Record<string, unknown>;
			result[trigger] = {
				name: textOrEmpty(move.name),
				effect: textOrEmpty(move.effect),
				color: parseEntryColor(move.color)
			};
		} else {
			result[trigger] = { name: '', effect: '', color: null };
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
			effect: textOrEmpty(record.effect),
			color: parseEntryColor(record.color)
		});
	}
	return result;
}

function numberOrNull(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Talents are plain printed values plus the FW calculator input. Derivation-era cards
 * ({fw, valueOverride, maxQsOverride}) get their effective values baked in, which needs
 * the already-migrated attributes.
 */
export function migrateTalents(
	raw: unknown,
	attributes: Record<AttributeKey, number | null>
): Record<TalentKey, TalentEntry> {
	const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
	const result = {} as Record<TalentKey, TalentEntry>;
	for (const key of TALENT_KEYS) {
		const value =
			typeof record[key] === 'object' && record[key] !== null
				? (record[key] as Record<string, unknown>)
				: {};
		const fw = numberOrNull(value.fw);
		if ('valueOverride' in value || 'maxQsOverride' in value) {
			const derived = derivedTalent(attributes, fw, key);
			result[key] = {
				fw,
				value: numberOrNull(value.valueOverride) ?? derived.value,
				maxQs: numberOrNull(value.maxQsOverride) ?? derived.maxQs
			};
		} else {
			result[key] = {
				fw,
				value: clampTalentValue(numberOrNull(value.value) ?? 1),
				maxQs: clampQs(numberOrNull(value.maxQs) ?? 1)
			};
		}
	}
	return result;
}

export function migrateAttributes(raw: unknown): Record<AttributeKey, number | null> {
	const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
	const result = {} as Record<AttributeKey, number | null>;
	for (const key of ATTRIBUTE_KEYS) {
		result[key] = numberOrNull(record[key]);
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
	'sizeCategory',
	'actionCount'
] as const;

/** Convert pre-string numeric stats; lifePoints below 1 or invalid means "no HP" (null). */
export function migrateStats(raw: Record<string, unknown>): void {
	for (const key of TEXT_STAT_KEYS) {
		const value = raw[key];
		if (typeof value === 'string') continue;
		raw[key] = typeof value === 'number' ? String(value) : '';
	}
	const lifePoints = Number(raw.lifePoints);
	raw.lifePoints = Number.isFinite(lifePoints) && lifePoints >= 1 ? lifePoints : null;
}

/**
 * Cards saved before explicit visibility hid empty badges implicitly; deriving hiddenStats
 * from the empty fields keeps their print output unchanged. Expects stats already migrated.
 */
export function migrateHiddenStats(raw: Record<string, unknown>): StatKey[] {
	const validKeys = STAT_BADGES.map((badge) => badge.key);
	if (Array.isArray(raw.hiddenStats)) {
		return validKeys.filter((key) => (raw.hiddenStats as unknown[]).includes(key));
	}
	const hidden: StatKey[] = [];
	for (const key of TEXT_STAT_KEYS) {
		if ((raw[key] as string).trim() === '') hidden.push(key);
	}
	return hidden;
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
	raw.banner = textOrEmpty(raw.banner);
	raw.bannerColor = parseEntryColor(raw.bannerColor);
	raw.flavorText = textOrEmpty(raw.flavorText);
	raw.notes = textOrEmpty(raw.notes);
	raw.image = typeof raw.image === 'string' ? raw.image : null;
	raw.attributes = migrateAttributes(raw.attributes);
	raw.talents = migrateTalents(raw.talents, raw.attributes as Record<AttributeKey, number | null>);
	raw.actions = migrateActions(Array.isArray(raw.actions) ? raw.actions : []);
	raw.specialMoves = migrateSpecialMoves(raw.specialMoves);
	raw.customMoves = migrateCustomMoves(raw.customMoves);
	raw.fit = migrateFit(raw.fit);
	// cards saved before the GK badge existed keep their print output unchanged
	const hadSizeCategory = 'sizeCategory' in raw;
	migrateStats(raw);
	const hiddenStats = migrateHiddenStats(raw);
	if (!hadSizeCategory && !hiddenStats.includes('sizeCategory')) {
		hiddenStats.push('sizeCategory');
	}
	raw.hiddenStats = hiddenStats;
	raw.talentsHidden = raw.talentsHidden === true;
	return raw as unknown as MonsterCard;
}
