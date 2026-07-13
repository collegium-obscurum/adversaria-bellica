import type { TalentKey } from './types';

export const TALENT_GROUP_ATTRIBUTES: Record<TalentKey, [string, string, string]> = {
	body: ['GE', 'MU', 'KK'],
	social: ['CH', 'IN', 'MU'],
	nature: ['KL', 'GE', 'KO'],
	knowledge: ['KL', 'IN', 'FF'],
	craft: ['FF', 'KO', 'KK']
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
