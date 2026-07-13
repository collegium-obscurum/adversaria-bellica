import type { WoundTrigger } from './types';

export interface WoundThreshold {
	label: string;
	/** cumulative damage at which the threshold triggers (HP <= percentage of max) */
	damage: number;
}

export function woundThresholds(maxHp: number): WoundThreshold[] {
	return [
		{ label: '75%', damage: Math.ceil(maxHp * 0.25) },
		{ label: '50%', damage: Math.ceil(maxHp * 0.5) },
		{ label: '25%', damage: Math.ceil(maxHp * 0.75) },
		{ label: 'Tod', damage: maxHp }
	];
}

/** Slot labels for the special-move triggers; HP slots show cumulative damage. */
export function triggerLabels(maxHp: number): Record<WoundTrigger, string> {
	const thresholds = woundThresholds(maxHp);
	return {
		combatStart: 'Kampfbeginn',
		hp75: `ab ${thresholds[0].damage} Schaden`,
		hp50: `ab ${thresholds[1].damage} Schaden`,
		hp25: `ab ${thresholds[2].damage} Schaden`,
		death: 'Tod'
	};
}
