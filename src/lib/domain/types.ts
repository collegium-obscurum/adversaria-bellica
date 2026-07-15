import type { FitResult } from './cardFit';
import type { EntryColor } from './entryColor';
import type { StatKey } from './statBadges';

export interface TalentValue {
	value: number;
	maxQs: number;
}

export const TALENT_KEYS = ['body', 'social', 'nature', 'knowledge', 'craft'] as const;
export type TalentKey = (typeof TALENT_KEYS)[number];

export const ATTRIBUTE_KEYS = [
	'courage',
	'sagacity',
	'intuition',
	'charisma',
	'dexterity',
	'agility',
	'constitution',
	'strength'
] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export interface TalentEntry {
	/** skill value (FW) feeding the derived talent value; null = not entered */
	fw: number | null;
	/** manual override; null = use the derived value */
	valueOverride: number | null;
	maxQsOverride: number | null;
}

export interface ActionEntry {
	/** number of d20 faces this row covers; rows partition 1–20 in list order */
	span: number;
	name: string;
	effect: string;
	color: EntryColor | null;
}

export const WOUND_TRIGGERS = ['combatStart', 'hp75', 'hp50', 'hp25', 'death'] as const;
export type WoundTrigger = (typeof WOUND_TRIGGERS)[number];

export interface SpecialMove {
	name: string;
	effect: string;
	color: EntryColor | null;
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
	attributes: Record<AttributeKey, number | null>;
	talents: Record<TalentKey, TalentEntry>;
	actions: ActionEntry[];
	specialMoves: Record<WoundTrigger, SpecialMove>;
	customMoves: CustomMove[];
	/** badges excluded from print/preview; visibility is explicit, empty badges print as empty circles */
	hiddenStats: StatKey[];
	talentsHidden: boolean;
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
		attributes: {
			courage: null,
			sagacity: null,
			intuition: null,
			charisma: null,
			dexterity: null,
			agility: null,
			constitution: null,
			strength: null
		},
		talents: {
			body: { fw: null, valueOverride: null, maxQsOverride: null },
			social: { fw: null, valueOverride: null, maxQsOverride: null },
			nature: { fw: null, valueOverride: null, maxQsOverride: null },
			knowledge: { fw: null, valueOverride: null, maxQsOverride: null },
			craft: { fw: null, valueOverride: null, maxQsOverride: null }
		},
		actions: [
			{ span: 1, name: 'Kritischer Treffer', effect: '2W6+4 TP', color: null },
			{ span: 5, name: 'Schwerer Angriff', effect: '1W6+4 TP', color: null },
			{ span: 9, name: 'Angriff', effect: '1W6+2 TP', color: null },
			{ span: 4, name: 'Fehlschlag', effect: 'Der Angriff geht daneben.', color: null },
			{
				span: 1,
				name: 'Flucht',
				effect: 'Erstes Mal: sucht einen Fluchtweg. Zweites Mal: entkommt.',
				color: null
			}
		],
		specialMoves: {
			combatStart: { name: '', effect: '', color: null },
			hp75: { name: '', effect: '', color: null },
			hp50: { name: '', effect: '', color: null },
			hp25: { name: '', effect: '', color: null },
			death: { name: '', effect: '', color: null }
		},
		customMoves: [],
		hiddenStats: [],
		talentsHidden: false,
		fit: { scale: 1, fits: true, imageHidden: false }
	};
}
