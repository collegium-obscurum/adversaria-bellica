export type StatKey =
	| 'lifePoints'
	| 'armor'
	| 'initiative'
	| 'speed'
	| 'defense'
	| 'soulPower'
	| 'toughness'
	| 'sizeCategory'
	| 'actionCount';

export type TextStatKey = Exclude<StatKey, 'lifePoints'>;

export interface StatBadgeInfo {
	key: StatKey;
	abbr: string;
	label: string;
}

export function badgeLabel(badge: StatBadgeInfo): string {
	return badge.key === 'actionCount' ? 'Aktionen' : badge.abbr;
}

export const STAT_BADGES: StatBadgeInfo[] = [
	{ key: 'lifePoints', abbr: 'LeP', label: 'Lebenspunkte' },
	{ key: 'armor', abbr: 'RS', label: 'Rüstungsschutz' },
	{ key: 'defense', abbr: 'VW', label: 'Verteidigung' },
	{ key: 'speed', abbr: 'GS', label: 'Geschwindigkeit' },
	{ key: 'soulPower', abbr: 'SK', label: 'Seelenkraft' },
	{ key: 'toughness', abbr: 'ZK', label: 'Zähigkeit' },
	{ key: 'sizeCategory', abbr: 'GK', label: 'Größenkategorie' },
	{ key: 'initiative', abbr: 'INI', label: 'Initiative' },
	{ key: 'actionCount', abbr: 'AKT', label: 'Aktionen pro Runde' }
];
