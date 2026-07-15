export const COLOR_MODES = ['text', 'dot'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

/** Parses a persisted mode value; anything unknown falls back to colored text. */
export function parseColorMode(value: unknown): ColorMode {
	return value === 'dot' ? 'dot' : 'text';
}
