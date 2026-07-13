import { describe, expect, it } from 'vitest';
import { cardFileName } from './filename';

describe('cardFileName', () => {
	it('slugifies a plain name', () => {
		expect(cardFileName('Goblin', 'png')).toBe('goblin.png');
	});

	it('transliterates umlauts and ß', () => {
		expect(cardFileName('Höhlenspinne', 'pdf')).toBe('hoehlenspinne.pdf');
		expect(cardFileName('Straßenräuber', 'png')).toBe('strassenraeuber.png');
	});

	it('strips accents', () => {
		expect(cardFileName('Élément', 'png')).toBe('element.png');
	});

	it('collapses spaces and special characters to hyphens', () => {
		expect(cardFileName('  Alter  Drache! (rot) ', 'png')).toBe('alter-drache-rot.png');
	});

	it('falls back to karte for empty names', () => {
		expect(cardFileName('', 'png')).toBe('karte.png');
		expect(cardFileName('!!!', 'pdf')).toBe('karte.pdf');
	});
});
