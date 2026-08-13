import type { MonsterCard, WoundTrigger } from './types';

export const WOUND_LEVELS = ['hp75', 'hp50', 'hp25', 'death'] as const;
export type WoundLevel = (typeof WOUND_LEVELS)[number];

/** Cumulative damage at which each wound threshold triggers; free text, HP may not be a number. */
export type WoundThresholds = Record<WoundLevel, string>;

/** Thresholds for a plain numeric HP value, or null when HP is anything else. */
export function woundThresholds(lifePoints: string): WoundThresholds | null {
	const maxHp = Number(lifePoints);
	if (lifePoints.trim() === '' || !Number.isFinite(maxHp) || maxHp < 1) return null;
	return {
		hp75: String(Math.ceil(maxHp * 0.25)),
		hp50: String(Math.ceil(maxHp * 0.5)),
		hp25: String(Math.ceil(maxHp * 0.75)),
		death: String(maxHp)
	};
}

/** Refill the thresholds from HP; manually edited ones and unparsable HP keep what is stored. */
export function syncWounds(card: MonsterCard) {
	if (card.wounds.manual) return;
	const thresholds = woundThresholds(card.stats.lifePoints.value);
	if (thresholds) Object.assign(card.wounds, thresholds);
}

/** Slot labels for the special-move triggers; the pain row carries the numbers. */
export const TRIGGER_LABELS: Record<WoundTrigger, string> = {
	combatStart: 'Kampfbeginn',
	hp75: 'ab Schmerz 1',
	hp50: 'ab Schmerz 2',
	hp25: 'ab Schmerz 3',
	death: 'Tod'
};
