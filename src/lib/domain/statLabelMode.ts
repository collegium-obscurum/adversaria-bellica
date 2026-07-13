export const STAT_LABEL_MODES = ['icons', 'text'] as const;
export type StatLabelMode = (typeof STAT_LABEL_MODES)[number];

/** Parses a persisted mode value; anything unknown falls back to icons. */
export function parseStatLabelMode(value: unknown): StatLabelMode {
	return value === 'text' ? 'text' : 'icons';
}
