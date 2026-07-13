export const CARD_STYLES = ['minimal', 'ornate'] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

/** Parses a persisted style value; anything unknown falls back to the printer-friendly default. */
export function parseCardStyle(value: unknown): CardStyle {
	return value === 'ornate' ? 'ornate' : 'minimal';
}
