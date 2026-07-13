export interface TalentValue {
	value: number;
	maxQs: number;
}

export const TALENT_KEYS = ['body', 'social', 'nature', 'knowledge', 'craft'] as const;
export type TalentKey = (typeof TALENT_KEYS)[number];

export interface ActionEntry {
	from: number;
	to: number;
	name: string;
	effect: string;
}

export const WOUND_TRIGGERS = ['combatStart', 'hp75', 'hp50', 'hp25', 'death'] as const;
export type WoundTrigger = (typeof WOUND_TRIGGERS)[number];

export interface MonsterCard {
	id: string;
	name: string;
	category: string;
	flavorText: string;
	notes: string;
	/** data URL of the circle cutout, or null */
	image: string | null;
	lifePoints: number;
	armor: number;
	initiative: number;
	speed: number;
	defense: number;
	soulPower: number;
	toughness: number;
	actionCount: number;
	talents: Record<TalentKey, TalentValue>;
	actions: ActionEntry[];
	specialMoves: Record<WoundTrigger, string>;
}

export function createEmptyCard(): MonsterCard {
	return {
		id: crypto.randomUUID(),
		name: '',
		category: '',
		flavorText: '',
		notes: '',
		image: null,
		lifePoints: 20,
		armor: 0,
		initiative: 10,
		speed: 8,
		defense: 6,
		soulPower: 0,
		toughness: 0,
		actionCount: 1,
		talents: {
			body: { value: 10, maxQs: 3 },
			social: { value: 5, maxQs: 2 },
			nature: { value: 10, maxQs: 3 },
			knowledge: { value: 5, maxQs: 2 },
			craft: { value: 5, maxQs: 2 }
		},
		actions: [
			{ from: 1, to: 5, name: 'Fehlschlag', effect: 'Der Angriff geht daneben.' },
			{ from: 6, to: 19, name: 'Angriff', effect: '1W6+2 TP' },
			{ from: 20, to: 20, name: 'Kritischer Treffer', effect: '2W6+4 TP' }
		],
		specialMoves: { combatStart: '', hp75: '', hp50: '', hp25: '', death: '' }
	};
}
