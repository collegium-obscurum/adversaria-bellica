export type CardStyle = 'minimal' | 'ornate';
export type ColorMode = 'text' | 'dot';
export type StatLabelMode = 'icons' | 'text';

// persisted values are whatever an older build or a hand-edited localStorage left behind,
// so every parser falls back to the default rather than trusting the stored string

export function parseCardStyle(value: unknown): CardStyle {
	return value === 'ornate' ? 'ornate' : 'minimal';
}

export function parseColorMode(value: unknown): ColorMode {
	return value === 'dot' ? 'dot' : 'text';
}

export function parseStatLabelMode(value: unknown): StatLabelMode {
	return value === 'text' ? 'text' : 'icons';
}
