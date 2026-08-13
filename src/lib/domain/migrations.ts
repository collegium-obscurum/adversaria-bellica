import type {
	ActionEntry,
	AttributeKey,
	Banner,
	CardStats,
	CustomMove,
	MonsterCard,
	TalentEntry,
	TalentKey,
	TextBlock,
	TriggerMove,
	WoundTrigger
} from './types';
import { ATTRIBUTE_KEYS, TALENT_KEYS, WOUND_TRIGGERS } from './types';
import { clampQs, clampTalentValue, derivedTalent } from './talentCalc';
import { parseEntryColor } from './entryColor';
import { FIT_FLOOR, type FitResult } from './cardFit';
import { STAT_BADGES, type StatKey, type TextStatKey } from './statBadges';

interface LegacyActionEntry {
	from: number;
	to: number;
	name: string;
	effect: string;
}

function isLegacyAction(entry: unknown): entry is LegacyActionEntry {
	return typeof entry === 'object' && entry !== null && 'from' in entry && 'to' in entry;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
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
		if (!isRecord(row)) continue;
		const span = Number(row.span);
		result.push({
			span: Number.isFinite(span) ? Math.max(1, Math.round(span)) : 1,
			name: textOrEmpty(row.name),
			effect: textOrEmpty(row.effect),
			color: parseEntryColor(row.color)
		});
	}
	return result;
}

function moveFields(value: unknown): {
	name: string;
	effect: string;
	color: ReturnType<typeof parseEntryColor>;
} {
	// pre-object moves were plain strings holding just the effect
	if (typeof value === 'string') return { name: '', effect: value, color: null };
	if (!isRecord(value)) return { name: '', effect: '', color: null };
	return {
		name: textOrEmpty(value.name),
		effect: textOrEmpty(value.effect),
		color: parseEntryColor(value.color)
	};
}

/**
 * Special moves gained a wrapper with its own visibility plus per-trigger `hidden`.
 * Legacy cards showed a trigger exactly when it had content; the section comes back
 * visible when anything was in it, so nothing a card used to print goes missing.
 */
export function migrateSpecialMoves(
	raw: unknown,
	legacyCustom: unknown
): MonsterCard['specialMoves'] {
	const wrapper = isRecord(raw) && 'triggers' in raw ? raw : null;
	const source = wrapper ? wrapper.triggers : raw;
	const record = isRecord(source) ? source : {};
	const triggers = {} as Record<WoundTrigger, TriggerMove>;
	for (const trigger of WOUND_TRIGGERS) {
		const move = moveFields(record[trigger]);
		const hidden = wrapper
			? isRecord(record[trigger]) && record[trigger].hidden === true
			: move.name.trim() === '' && move.effect.trim() === '';
		triggers[trigger] = { ...move, hidden };
	}
	const custom = migrateCustomMoves(wrapper ? wrapper.custom : legacyCustom);
	const empty = WOUND_TRIGGERS.every((trigger) => triggers[trigger].hidden) && custom.length === 0;
	return { hidden: wrapper ? wrapper.hidden === true : empty, triggers, custom };
}

export function migrateCustomMoves(raw: unknown): CustomMove[] {
	if (!Array.isArray(raw)) return [];
	const result: CustomMove[] = [];
	for (const item of raw) {
		if (!isRecord(item)) continue;
		result.push({ trigger: textOrEmpty(item.trigger), ...moveFields(item) });
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
	attributes: Record<AttributeKey, number | null>,
	legacyHidden = false
): MonsterCard['talents'] {
	const wrapper = isRecord(raw) && 'entries' in raw ? raw : null;
	const source = wrapper ? wrapper.entries : raw;
	const record = isRecord(source) ? source : {};
	const entries = {} as Record<TalentKey, TalentEntry>;
	for (const key of TALENT_KEYS) {
		const value = isRecord(record[key]) ? record[key] : {};
		const fw = numberOrNull(value.fw);
		if ('valueOverride' in value || 'maxQsOverride' in value) {
			const derived = derivedTalent(attributes, fw, key);
			entries[key] = {
				fw,
				value: numberOrNull(value.valueOverride) ?? derived.value,
				maxQs: numberOrNull(value.maxQsOverride) ?? derived.maxQs
			};
		} else {
			entries[key] = {
				fw,
				value: clampTalentValue(numberOrNull(value.value) ?? 1),
				maxQs: clampQs(numberOrNull(value.maxQs) ?? 1)
			};
		}
	}
	// a legacy card printed its talents unless flagged; a card without any talent data has nothing to show
	const hidden = wrapper ? wrapper.hidden === true : legacyHidden || !isRecord(source);
	return { hidden, entries };
}

export function migrateAttributes(raw: unknown): Record<AttributeKey, number | null> {
	const record = isRecord(raw) ? raw : {};
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

function legacyLifePoints(value: unknown): number | null {
	const lifePoints = Number(value);
	return Number.isFinite(lifePoints) && lifePoints >= 1 ? lifePoints : null;
}

/**
 * Stats moved from flat fields plus a `hiddenStats` list into one record of
 * {value, hidden}. Legacy visibility came from that list, or, before it existed,
 * from the field being empty.
 */
export function migrateStats(raw: Record<string, unknown>): CardStats {
	if (isRecord(raw.stats)) {
		const source = raw.stats;
		const lifePoints = isRecord(source.lifePoints) ? source.lifePoints : {};
		const stats = {
			lifePoints: {
				value: legacyLifePoints(lifePoints.value),
				hidden: lifePoints.hidden === true
			}
		} as CardStats;
		for (const key of TEXT_STAT_KEYS) {
			const stat = isRecord(source[key]) ? source[key] : {};
			stats[key] = { value: textOrEmpty(stat.value), hidden: stat.hidden === true };
		}
		return stats;
	}

	const values = {} as Record<TextStatKey, string>;
	for (const key of TEXT_STAT_KEYS) {
		const value = raw[key];
		values[key] =
			typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
	}
	const hidden = legacyHiddenStats(raw, values);
	const stats = {
		lifePoints: { value: legacyLifePoints(raw.lifePoints), hidden: hidden.includes('lifePoints') }
	} as CardStats;
	for (const key of TEXT_STAT_KEYS) {
		stats[key] = { value: values[key], hidden: hidden.includes(key) };
	}
	return stats;
}

function legacyHiddenStats(
	raw: Record<string, unknown>,
	values: Record<TextStatKey, string>
): StatKey[] {
	const validKeys = STAT_BADGES.map((badge) => badge.key);
	// cards saved before the GK badge existed keep their print output unchanged
	const hidden = Array.isArray(raw.hiddenStats)
		? validKeys.filter((key) => (raw.hiddenStats as unknown[]).includes(key))
		: TEXT_STAT_KEYS.filter((key) => values[key].trim() === '');
	if (!('sizeCategory' in raw) && !hidden.includes('sizeCategory')) {
		return [...hidden, 'sizeCategory'];
	}
	return [...hidden];
}

/** Optional text blocks; legacy cards showed them exactly when they had content. */
function migrateTextBlock(raw: unknown): TextBlock {
	if (isRecord(raw)) {
		return { value: textOrEmpty(raw.value), hidden: raw.hidden === true };
	}
	const value = textOrEmpty(raw);
	return { value, hidden: value.trim() === '' };
}

function migrateBanner(raw: unknown, legacyColor: unknown): Banner {
	if (isRecord(raw)) {
		return {
			value: textOrEmpty(raw.value),
			color: parseEntryColor(raw.color),
			hidden: raw.hidden === true
		};
	}
	const value = textOrEmpty(raw);
	return { value, color: parseEntryColor(legacyColor), hidden: value.trim() === '' };
}

/** Cards saved before fit tracking count as fitting until their next save re-measures them. */
export function migrateFit(raw: unknown): FitResult {
	if (!isRecord(raw)) {
		return { scale: 1, fits: true, imageHidden: false };
	}
	const scale = Number(raw.scale);
	return {
		scale: Number.isFinite(scale) ? Math.min(1, Math.max(FIT_FLOOR, scale)) : 1,
		fits: raw.fits !== false,
		imageHidden: raw.imageHidden === true
	};
}

/** Bring a card parsed from storage or import JSON up to the current schema; every field gets a sane default. */
export function migrateCard(raw: Record<string, unknown>): MonsterCard {
	const attributes = migrateAttributes(raw.attributes);
	const stats = migrateStats(raw);
	return {
		id: typeof raw.id === 'string' ? raw.id : crypto.randomUUID(),
		name: textOrEmpty(raw.name),
		category: textOrEmpty(raw.category),
		banner: migrateBanner(raw.banner, raw.bannerColor),
		flavorText: migrateTextBlock(raw.flavorText),
		notes: migrateTextBlock(raw.notes),
		image: typeof raw.image === 'string' ? raw.image : null,
		stats,
		attributes,
		talents: migrateTalents(raw.talents, attributes, raw.talentsHidden === true),
		actions: migrateActions(Array.isArray(raw.actions) ? raw.actions : []),
		// legacy cards printed the pain row whenever they had HP
		wounds: {
			hidden: isRecord(raw.wounds) ? raw.wounds.hidden === true : stats.lifePoints.value === null
		},
		specialMoves: migrateSpecialMoves(raw.specialMoves, raw.customMoves),
		fit: migrateFit(raw.fit)
	};
}
