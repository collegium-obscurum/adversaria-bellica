import type { ActionEntry } from './types';

export function validateActionRanges(entries: ActionEntry[]): string[] {
	const errors: string[] = [];
	if (entries.length === 0) {
		return ['Die W20-Tabelle braucht mindestens einen Eintrag.'];
	}

	for (const entry of entries) {
		if (!Number.isInteger(entry.from) || !Number.isInteger(entry.to)) {
			errors.push(`"${entry.name || '?'}": Von/Bis müssen ganze Zahlen sein.`);
		} else if (entry.from < 1 || entry.to > 20) {
			errors.push(`"${entry.name || '?'}": Bereich muss zwischen 1 und 20 liegen.`);
		} else if (entry.from > entry.to) {
			errors.push(`"${entry.name || '?'}": Von (${entry.from}) ist größer als Bis (${entry.to}).`);
		}
	}
	if (errors.length > 0) {
		return errors;
	}

	const sorted = [...entries].sort((a, b) => a.from - b.from);
	let expected = 1;
	for (const entry of sorted) {
		if (entry.from > expected) {
			errors.push(`Lücke: ${expected}${expected < entry.from - 1 ? `–${entry.from - 1}` : ''} ist nicht abgedeckt.`);
		} else if (entry.from < expected) {
			errors.push(`Überlappung bei ${entry.from}–${Math.min(entry.to, expected - 1)}.`);
		}
		expected = Math.max(expected, entry.to + 1);
	}
	if (expected <= 20) {
		errors.push(`Lücke: ${expected}${expected < 20 ? '–20' : ''} ist nicht abgedeckt.`);
	}
	return errors;
}
