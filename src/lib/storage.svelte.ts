import { browser } from '$app/environment';
import type { MonsterCard } from './types';

const STORAGE_KEY = 'adversaria-bellica.cards';

function load(): MonsterCard[] {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
	} catch {
		return [];
	}
}

export const store = $state({ cards: load() });

function persist() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store.cards));
	} catch {
		alert('Speichern fehlgeschlagen: der Browser-Speicher ist voll. Exportiere Karten als JSON und lösche alte Karten.');
	}
}

export function getCard(id: string): MonsterCard | undefined {
	return store.cards.find((card) => card.id === id);
}

export function upsertCard(card: MonsterCard) {
	const index = store.cards.findIndex((existing) => existing.id === card.id);
	if (index >= 0) {
		store.cards[index] = card;
	} else {
		store.cards.push(card);
	}
	persist();
}

export function deleteCard(id: string) {
	store.cards = store.cards.filter((card) => card.id !== id);
	persist();
}

export function duplicateCard(id: string): MonsterCard | undefined {
	const original = getCard(id);
	if (!original) return undefined;
	const copy = structuredClone(original);
	copy.id = crypto.randomUUID();
	copy.name = `${copy.name} (Kopie)`;
	store.cards.push(copy);
	persist();
	return copy;
}

export function exportJson(cards: MonsterCard[] = store.cards): string {
	return JSON.stringify(cards, null, '\t');
}

/** Returns the number of imported cards. Throws on invalid JSON or shape. */
export function importJson(json: string): number {
	const parsed = JSON.parse(json);
	if (!Array.isArray(parsed)) {
		throw new Error('Erwartet ein JSON-Array von Karten.');
	}
	const existingIds = new Set(store.cards.map((card) => card.id));
	for (const item of parsed) {
		if (typeof item !== 'object' || item === null || typeof item.name !== 'string') {
			throw new Error('Mindestens ein Eintrag ist keine gültige Karte.');
		}
		if (typeof item.id !== 'string' || existingIds.has(item.id)) {
			item.id = crypto.randomUUID();
		}
		existingIds.add(item.id);
		store.cards.push(item);
	}
	persist();
	return parsed.length;
}
