import { TALENT_KEYS } from './types';
import type { AttributeKey, TalentEntry, TalentKey, TalentValue } from './types';

export interface AttributeInfo {
	key: AttributeKey;
	abbr: string;
	label: string;
}

export const ATTRIBUTES: AttributeInfo[] = [
	{ key: 'courage', abbr: 'MU', label: 'Mut' },
	{ key: 'sagacity', abbr: 'KL', label: 'Klugheit' },
	{ key: 'intuition', abbr: 'IN', label: 'Intuition' },
	{ key: 'charisma', abbr: 'CH', label: 'Charisma' },
	{ key: 'dexterity', abbr: 'FF', label: 'Fingerfertigkeit' },
	{ key: 'agility', abbr: 'GE', label: 'Gewandtheit' },
	{ key: 'constitution', abbr: 'KO', label: 'Konstitution' },
	{ key: 'strength', abbr: 'KK', label: 'Körperkraft' }
];

export const ATTRIBUTE_ABBR = Object.fromEntries(
	ATTRIBUTES.map((attr) => [attr.key, attr.abbr])
) as Record<AttributeKey, string>;

export const TALENT_LABELS: Record<TalentKey, string> = {
	body: 'Körper',
	social: 'Gesellschaft',
	nature: 'Natur',
	knowledge: 'Wissen',
	craft: 'Handwerk'
};

export const TALENT_GROUP_ATTRIBUTES: Record<
	TalentKey,
	[AttributeKey, AttributeKey, AttributeKey]
> = {
	body: ['agility', 'courage', 'strength'],
	social: ['charisma', 'intuition', 'courage'],
	nature: ['sagacity', 'agility', 'constitution'],
	knowledge: ['sagacity', 'intuition', 'dexterity'],
	craft: ['dexterity', 'constitution', 'strength']
};

export function clampTalentValue(value: number): number {
	if (!Number.isFinite(value)) return 1;
	return Math.min(99, Math.max(1, value));
}

export function clampQs(qs: number): number {
	if (!Number.isFinite(qs)) return 1;
	return Math.min(6, Math.max(1, qs));
}

export function talentValue(attr1: number, attr2: number, attr3: number, fw: number): number {
	const base = Math.ceil((attr1 + attr2 + attr3 - 25) / 2);
	return clampTalentValue(base + fw);
}

export function talentMaxQs(fw: number): number {
	return clampQs(Math.ceil(fw / 3));
}

/** Value derived from the card attributes and the group's FW; empty inputs count as 0. */
export function derivedTalent(
	attributes: Record<AttributeKey, number | null>,
	fw: number | null,
	key: TalentKey
): TalentValue {
	const [attr1, attr2, attr3] = TALENT_GROUP_ATTRIBUTES[key].map(
		(attrKey) => attributes[attrKey] ?? 0
	);
	return {
		value: talentValue(attr1, attr2, attr3, fw ?? 0),
		maxQs: talentMaxQs(fw ?? 0)
	};
}

/** True when every group's derived value matches what the card currently prints. */
export function talentsInSync(
	attributes: Record<AttributeKey, number | null>,
	talents: Record<TalentKey, TalentEntry>
): boolean {
	return TALENT_KEYS.every((key) => {
		const derived = derivedTalent(attributes, talents[key].fw, key);
		return derived.value === talents[key].value && derived.maxQs === talents[key].maxQs;
	});
}
