export const ENTRY_COLORS = ['red', 'orange', 'green', 'blue', 'purple', 'brown'] as const;
export type EntryColor = (typeof ENTRY_COLORS)[number];

export const ENTRY_COLOR_LABELS: Record<EntryColor, string> = {
	red: 'Rot',
	orange: 'Orange',
	green: 'Grün',
	blue: 'Blau',
	purple: 'Violett',
	brown: 'Braun'
};

/** Parses a persisted color token; anything unknown means uncolored. */
export function parseEntryColor(value: unknown): EntryColor | null {
	return ENTRY_COLORS.includes(value as EntryColor) ? (value as EntryColor) : null;
}
