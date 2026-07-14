import type { FitResult } from './cardFit';

export interface TalentValue {
	value: number;
	maxQs: number;
}

export const TALENT_KEYS = ['body', 'social', 'nature', 'knowledge', 'craft'] as const;
export type TalentKey = (typeof TALENT_KEYS)[number];

export interface ActionEntry {
	/** number of d20 faces this row covers; rows partition 1–20 in list order */
	span: number;
	name: string;
	effect: string;
}

export const WOUND_TRIGGERS = ['combatStart', 'hp75', 'hp50', 'hp25', 'death'] as const;
export type WoundTrigger = (typeof WOUND_TRIGGERS)[number];

export interface SpecialMove {
	name: string;
	effect: string;
}

export interface CustomMove extends SpecialMove {
	/** free-text trigger label, printed like the fixed wound triggers */
	trigger: string;
}

export interface MonsterCard {
	id: string;
	name: string;
	category: string;
	flavorText: string;
	notes: string;
	/** data URL of the circle cutout, or null */
	image: string | null;
	lifePoints: number;
	armor: string;
	initiative: string;
	speed: string;
	defense: string;
	soulPower: string;
	toughness: string;
	actionCount: string;
	talents: Record<TalentKey, TalentValue>;
	actions: ActionEntry[];
	specialMoves: Record<WoundTrigger, SpecialMove>;
	customMoves: CustomMove[];
	/** print fit measured on last save; display recomputes live, the library badge reads this */
	fit: FitResult;
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
		armor: '0',
		initiative: '10',
		speed: '8',
		defense: '6',
		soulPower: '0',
		toughness: '0',
		actionCount: '1',
		talents: {
			body: { value: 10, maxQs: 3 },
			social: { value: 5, maxQs: 2 },
			nature: { value: 10, maxQs: 3 },
			knowledge: { value: 5, maxQs: 2 },
			craft: { value: 5, maxQs: 2 }
		},
		actions: [
			{ span: 1, name: 'Kritischer Treffer', effect: '2W6+4 TP' },
			{ span: 5, name: 'Schwerer Angriff', effect: '1W6+4 TP' },
			{ span: 9, name: 'Angriff', effect: '1W6+2 TP' },
			{ span: 4, name: 'Fehlschlag', effect: 'Der Angriff geht daneben.' },
			{
				span: 1,
				name: 'Flucht',
				effect: 'Erstes Mal: sucht einen Fluchtweg. Zweites Mal: entkommt.'
			}
		],
		specialMoves: {
			combatStart: { name: '', effect: '' },
			hp75: { name: '', effect: '' },
			hp50: { name: '', effect: '' },
			hp25: { name: '', effect: '' },
			death: { name: '', effect: '' }
		},
		customMoves: [],
		fit: { scale: 1, fits: true, imageHidden: false }
	};
}
