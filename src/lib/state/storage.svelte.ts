import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';
import { migrateCard } from '$lib/domain/migrations';
import type { MonsterCard } from '$lib/domain/types';

const STORAGE_KEY = 'adversaria-bellica.cards';

function load(): MonsterCard[] {
	if (!browser) return [];
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		if (!Array.isArray(parsed)) return [];
		return parsed.map((item) => migrateCard(item as Record<string, unknown>));
	} catch {
		return [];
	}
}

export const store = $state({ cards: load() });

function persist() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store.cards));
	} catch {
		alert(
			'Speichern fehlgeschlagen: der Browser-Speicher ist voll. Exportiere Karten als JSON und lösche alte Karten.'
		);
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
	const parsed: unknown = JSON.parse(json);
	if (!Array.isArray(parsed)) {
		throw new Error('Erwartet ein JSON-Array von Karten.');
	}
	const existingIds = new SvelteSet(store.cards.map((card) => card.id));
	for (const item of parsed as unknown[]) {
		if (typeof item !== 'object' || item === null) {
			throw new Error('Mindestens ein Eintrag ist keine gültige Karte.');
		}
		const record = item as Record<string, unknown>;
		if (typeof record.name !== 'string') {
			throw new Error('Mindestens ein Eintrag ist keine gültige Karte.');
		}
		if (typeof record.id !== 'string' || existingIds.has(record.id)) {
			record.id = crypto.randomUUID();
		}
		existingIds.add(record.id as string);
		store.cards.push(migrateCard(record));
	}
	persist();
	return parsed.length;
}
