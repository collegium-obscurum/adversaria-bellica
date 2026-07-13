import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmptyCard } from '$lib/domain/types';

vi.mock('$app/environment', () => ({ browser: true }));

function fakeLocalStorage() {
	const map = new Map<string, string>();
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => {
			map.set(key, value);
		},
		removeItem: (key: string) => {
			map.delete(key);
		}
	};
}

async function loadStorageModule() {
	vi.resetModules();
	return import('./storage.svelte');
}

beforeEach(() => {
	vi.stubGlobal('localStorage', fakeLocalStorage());
	vi.stubGlobal('alert', vi.fn());
});

describe('persist on quota failure', () => {
	it('reloads cards from localStorage so UI matches what got saved', async () => {
		const working = fakeLocalStorage();
		vi.stubGlobal('localStorage', working);
		const storage = await loadStorageModule();
		storage.upsertCard({ ...createEmptyCard(), name: 'Wolf' });
		expect(storage.store.cards).toHaveLength(1);

		vi.stubGlobal('localStorage', {
			getItem: (key: string) => working.getItem(key),
			setItem: () => {
				throw new Error('QuotaExceededError');
			},
			removeItem: (key: string) => {
				working.removeItem(key);
			}
		});
		storage.upsertCard({ ...createEmptyCard(), name: 'Drache' });

		expect(alert).toHaveBeenCalledOnce();
		expect(storage.store.cards.map((card) => card.name)).toEqual(['Wolf']);
	});
});

describe('importJson', () => {
	it('funnels imported cards through migrateCard so missing fields get defaults', async () => {
		const storage = await loadStorageModule();
		const count = storage.importJson(JSON.stringify([{ name: 'Goblin' }]));
		expect(count).toBe(1);
		const card = storage.store.cards[0];
		expect(card.flavorText).toBe('');
		expect(card.talents.body).toEqual({ value: 0, maxQs: 0 });
		expect(card.specialMoves.death).toEqual({ name: '', effect: '' });
	});
});
