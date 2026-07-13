import type { ActionEntry } from './types';

export const D20_FACES = 20;

export interface ActionRange {
	from: number;
	to: number;
}

/**
 * Rows partition 1–20 in list order. Stored spans are desired sizes;
 * overflow shrinks later rows (each keeps at least 1 face), the last row
 * always extends to 20. Result is never invalid.
 */
export function actionRanges(entries: ActionEntry[]): ActionRange[] {
	const ranges: ActionRange[] = [];
	let start = 1;
	for (let index = 0; index < entries.length; index++) {
		const rowsAfter = entries.length - 1 - index;
		const maxSpan = D20_FACES - rowsAfter - start + 1;
		const span = Math.max(1, Math.min(entries[index].span, maxSpan));
		const to = index === entries.length - 1 ? D20_FACES : start + span - 1;
		ranges.push({ from: start, to });
		start = to + 1;
	}
	return ranges;
}

/** The last row absorbs penalty overflow past 20, so its end reads "20+". */
export function rangeLabel(range: ActionRange, isLast = false): string {
	const toLabel = isLast ? `${range.to}+` : String(range.to);
	return range.from === range.to ? toLabel : `${range.from}–${toLabel}`;
}

/** Append a span-1 row; if the total exceeds 20, the largest row shrinks by 1. */
export function addAction(entries: ActionEntry[]) {
	entries.push({ span: 1, name: '', effect: '' });
	const total = entries.reduce((sum, entry) => sum + entry.span, 0);
	if (total > D20_FACES) {
		let largest = entries[0];
		for (const entry of entries) {
			if (entry.span > largest.span) largest = entry;
		}
		largest.span -= 1;
	}
}

/** Set where a row ends; its span changes, later rows reflow. */
export function setRangeEnd(entries: ActionEntry[], index: number, to: number) {
	const ranges = actionRanges(entries);
	entries[index].span = Math.max(1, to - ranges[index].from + 1);
}

/**
 * Set where a row starts by moving the boundary to the previous row:
 * the previous row's end and this row's start shift together, both keep
 * their other endpoint. No-op for the first row (always starts at 1).
 */
export function setRangeStart(entries: ActionEntry[], index: number, from: number) {
	if (index === 0) return;
	const ranges = actionRanges(entries);
	const previousFrom = ranges[index - 1].from;
	const to = ranges[index].to;
	const clamped = Math.max(previousFrom + 1, Math.min(from, to));
	entries[index - 1].span = clamped - previousFrom;
	entries[index].span = to - clamped + 1;
}

export function moveAction(entries: ActionEntry[], fromIndex: number, toIndex: number) {
	if (fromIndex === toIndex) return;
	const [moved] = entries.splice(fromIndex, 1);
	entries.splice(toIndex, 0, moved);
}
