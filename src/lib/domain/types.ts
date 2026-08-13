import type { FitResult } from './cardFit';
import type { EntryColor } from './entryColor';
import type { TextStatKey } from './statBadges';
import type { WoundThresholds } from './wounds';

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
	/** skill value (FW), a calculator input; null = not entered */
	fw: number | null;
	/** what the card prints; only changed by editing the row or applying the calculator */
	value: number;
	maxQs: number;
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

/** One Spezialmanöver row; the list order is the print order. */
export interface MoveRow {
	/** fixed wound trigger, or null for a free-text row */
	trigger: WoundTrigger | null;
	/** label of a free-text row; fixed rows take theirs from the life points */
	label: string;
	name: string;
	effect: string;
	color: EntryColor | null;
	/** only fixed rows are hidden; free-text rows are removed outright */
	hidden: boolean;
}

/** Every hideable part of the card carries its own flag; hiding never clears the value. */
export interface TextBlock {
	value: string;
	hidden: boolean;
}

export interface Banner {
	value: string;
	color: EntryColor | null;
	hidden: boolean;
}

export interface TextStat {
	value: string;
	hidden: boolean;
}

export type CardStats = {
	/** free text: a plain number auto-fills the pain thresholds, anything else leaves them alone */
	lifePoints: TextStat;
} & Record<TextStatKey, TextStat>;

export interface MonsterCard {
	id: string;
	name: string;
	category: string;
	banner: Banner;
	flavorText: TextBlock;
	notes: TextBlock;
	/** data URL of the circle cutout, or null */
	image: string | null;
	stats: CardStats;
	attributes: Record<AttributeKey, number | null>;
	talents: { hidden: boolean; entries: Record<TalentKey, TalentEntry> };
	actions: ActionEntry[];
	/** manual = the user edited a threshold, so HP no longer overwrites them */
	wounds: { hidden: boolean; manual: boolean } & WoundThresholds;
	specialMoves: { hidden: boolean; rows: MoveRow[] };
	/** print fit measured on last save; display recomputes live, the library badge reads this */
	fit: FitResult;
}

export function createEmptyCard(): MonsterCard {
	return {
		id: crypto.randomUUID(),
		name: '',
		category: '',
		banner: { value: '', color: null, hidden: true },
		flavorText: { value: '', hidden: true },
		notes: { value: '', hidden: true },
		image: null,
		stats: {
			lifePoints: { value: '20', hidden: false },
			armor: { value: '0', hidden: false },
			initiative: { value: '10', hidden: false },
			speed: { value: '8', hidden: false },
			defense: { value: '6', hidden: false },
			soulPower: { value: '0', hidden: false },
			toughness: { value: '0', hidden: false },
			// GK is rarely relevant; new cards start with the badge off, unhide per card
			sizeCategory: { value: '', hidden: true },
			actionCount: { value: '1', hidden: false }
		},
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
			hidden: true,
			entries: {
				body: { fw: null, value: 1, maxQs: 1 },
				social: { fw: null, value: 1, maxQs: 1 },
				nature: { fw: null, value: 1, maxQs: 1 },
				knowledge: { fw: null, value: 1, maxQs: 1 },
				craft: { fw: null, value: 1, maxQs: 1 }
			}
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
		wounds: { hidden: true, manual: false, hp75: '5', hp50: '10', hp25: '15', death: '20' },
		specialMoves: {
			hidden: true,
			rows: WOUND_TRIGGERS.map((trigger) => ({
				trigger,
				label: '',
				name: '',
				effect: '',
				color: null,
				hidden: true
			}))
		},
		fit: { scale: 1, fits: true, imageHidden: false }
	};
}
