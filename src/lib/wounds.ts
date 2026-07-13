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
