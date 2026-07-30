import type { WoundTrigger } from './types';

/** Cumulative damage at which each wound threshold triggers. */
export interface WoundThresholds {
	hp75: number;
	hp50: number;
	hp25: number;
	death: number;
}

export function woundThresholds(maxHp: number): WoundThresholds {
	// the editor's number input is transiently null while the user retypes the value
	if (!Number.isFinite(maxHp) || maxHp < 1) maxHp = 1;
	return {
		hp75: Math.ceil(maxHp * 0.25),
		hp50: Math.ceil(maxHp * 0.5),
		hp25: Math.ceil(maxHp * 0.75),
		death: maxHp
	};
}

/** Slot labels for the special-move triggers; HP slots show cumulative damage. */
export function triggerLabels(maxHp: number | null): Record<WoundTrigger, string> {
	const thresholds = woundThresholds(maxHp ?? 1);
	return {
		combatStart: 'Kampfbeginn',
		hp75: `ab ${thresholds.hp75} Schaden`,
		hp50: `ab ${thresholds.hp50} Schaden`,
		hp25: `ab ${thresholds.hp25} Schaden`,
		death: 'Tod'
	};
}
