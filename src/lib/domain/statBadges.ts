export type StatKey =
	| 'lifePoints'
	| 'armor'
	| 'initiative'
	| 'speed'
	| 'defense'
	| 'soulPower'
	| 'toughness'
	| 'actionCount';

export interface StatBadgeInfo {
	key: StatKey;
	abbr: string;
	label: string;
}

export const STAT_BADGES: StatBadgeInfo[] = [
	{ key: 'lifePoints', abbr: 'LeP', label: 'Lebenspunkte' },
	{ key: 'armor', abbr: 'RS', label: 'Rüstungsschutz' },
	{ key: 'initiative', abbr: 'INI', label: 'Initiative' },
	{ key: 'speed', abbr: 'GS', label: 'Geschwindigkeit' },
	{ key: 'defense', abbr: 'VW', label: 'Verteidigung' },
	{ key: 'soulPower', abbr: 'SK', label: 'Seelenkraft' },
	{ key: 'toughness', abbr: 'ZK', label: 'Zähigkeit' },
	{ key: 'actionCount', abbr: 'AKT', label: 'Aktionen pro Runde' }
];
