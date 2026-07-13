import { describe, expect, it } from 'vitest';
import {
	actionRanges,
	addAction,
	moveAction,
	rangeLabel,
	setRangeEnd,
	setRangeStart
} from './actions';
import { createEmptyCard, type ActionEntry } from './types';

function entry(span: number, name = ''): ActionEntry {
	return { span, name, effect: '' };
}

describe('actionRanges', () => {
	it('partitions 1–20 by spans in order', () => {
		expect(actionRanges([entry(5), entry(14), entry(1)])).toEqual([
			{ from: 1, to: 5 },
			{ from: 6, to: 19 },
			{ from: 20, to: 20 }
		]);
	});

	it('extends the last row to 20 when spans fall short', () => {
		expect(actionRanges([entry(3), entry(3)])).toEqual([
			{ from: 1, to: 3 },
			{ from: 4, to: 20 }
		]);
	});

	it('shrinks later rows on overflow, keeping at least 1 face each', () => {
		expect(actionRanges([entry(18), entry(10), entry(10)])).toEqual([
			{ from: 1, to: 18 },
			{ from: 19, to: 19 },
			{ from: 20, to: 20 }
		]);
	});

	it('covers a single row fully', () => {
		expect(actionRanges([entry(7)])).toEqual([{ from: 1, to: 20 }]);
	});

	it('treats spans below 1 as 1', () => {
		expect(actionRanges([entry(0), entry(5)])).toEqual([
			{ from: 1, to: 1 },
			{ from: 2, to: 20 }
		]);
	});

	it('partitions the default card actions into 1 / 2–6 / 7–15 / 16–19 / 20', () => {
		expect(actionRanges(createEmptyCard().actions)).toEqual([
			{ from: 1, to: 1 },
			{ from: 2, to: 6 },
			{ from: 7, to: 15 },
			{ from: 16, to: 19 },
			{ from: 20, to: 20 }
		]);
	});
});

describe('rangeLabel', () => {
	it('collapses single-face ranges', () => {
		expect(rangeLabel({ from: 20, to: 20 })).toBe('20');
		expect(rangeLabel({ from: 6, to: 14 })).toBe('6–14');
	});

	it('marks the last range end with a plus', () => {
		expect(rangeLabel({ from: 16, to: 20 }, true)).toBe('16–20+');
		expect(rangeLabel({ from: 20, to: 20 }, true)).toBe('20+');
	});
});

describe('addAction', () => {
	it('appends a span-1 row', () => {
		const entries = [entry(5, 'a'), entry(10, 'b')];
		addAction(entries);
		expect(entries.map((e) => e.name)).toEqual(['a', 'b', '']);
		expect(entries.map((e) => e.span)).toEqual([5, 10, 1]);
	});

	it('steals one face from the largest row on overflow', () => {
		const entries = [entry(5), entry(15)];
		addAction(entries);
		expect(entries.map((e) => e.span)).toEqual([5, 14, 1]);
	});
});

describe('setRangeEnd', () => {
	it('grows the row and reflows later rows', () => {
		const entries = [entry(5), entry(13), entry(1), entry(1)];
		setRangeEnd(entries, 0, 8);
		expect(actionRanges(entries)).toEqual([
			{ from: 1, to: 8 },
			{ from: 9, to: 18 },
			{ from: 19, to: 19 },
			{ from: 20, to: 20 }
		]);
	});

	it('never shrinks a row below one face', () => {
		const entries = [entry(5), entry(15)];
		setRangeEnd(entries, 0, 0);
		expect(actionRanges(entries)[0]).toEqual({ from: 1, to: 1 });
	});
});

describe('setRangeStart', () => {
	it('moves the boundary: previous row keeps its start, this row keeps its end', () => {
		const entries = [entry(5), entry(14), entry(1)];
		setRangeStart(entries, 1, 4);
		expect(actionRanges(entries)).toEqual([
			{ from: 1, to: 3 },
			{ from: 4, to: 19 },
			{ from: 20, to: 20 }
		]);
	});

	it('clamps so both rows keep at least one face', () => {
		const entries = [entry(5), entry(14), entry(1)];
		setRangeStart(entries, 1, 1);
		expect(actionRanges(entries)[0]).toEqual({ from: 1, to: 1 });
		setRangeStart(entries, 1, 25);
		expect(actionRanges(entries)[1].from).toBe(actionRanges(entries)[1].to);
	});

	it('ignores the first row', () => {
		const entries = [entry(5), entry(15)];
		setRangeStart(entries, 0, 3);
		expect(actionRanges(entries)[0]).toEqual({ from: 1, to: 5 });
	});
});

describe('moveAction', () => {
	it('moves a row with its span', () => {
		const entries = [entry(5, 'a'), entry(14, 'b'), entry(1, 'c')];
		moveAction(entries, 2, 0);
		expect(entries.map((e) => e.name)).toEqual(['c', 'a', 'b']);
		expect(entries.map((e) => e.span)).toEqual([1, 5, 14]);
	});
});
