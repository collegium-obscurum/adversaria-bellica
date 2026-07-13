import { beforeEach, describe, expect, it, vi } from 'vitest';

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

async function loadModule() {
	vi.resetModules();
	return import('./cardBack.svelte');
}

beforeEach(() => {
	vi.stubGlobal('localStorage', fakeLocalStorage());
});

describe('cardBack state', () => {
	it('starts disabled with the default motif', async () => {
		const state = await loadModule();
		expect(state.cardBack).toEqual({ enabled: false, mode: 'default', customImage: null });
	});

	it('persists settings across module reloads', async () => {
		const first = await loadModule();
		first.setCardBackEnabled(true);
		first.setCardBackImage('data:image/jpeg;base64,abc');
		first.setCardBackMode('custom');

		const second = await loadModule();
		expect(second.cardBack).toEqual({
			enabled: true,
			mode: 'custom',
			customImage: 'data:image/jpeg;base64,abc'
		});
	});

	it('keeps working in memory when localStorage rejects the image', async () => {
		vi.stubGlobal('localStorage', {
			getItem: () => null,
			setItem: () => {
				throw new Error('QuotaExceededError');
			},
			removeItem: () => undefined
		});
		const state = await loadModule();
		state.setCardBackImage('data:image/jpeg;base64,huge');
		expect(state.cardBack.customImage).toBe('data:image/jpeg;base64,huge');
	});
});
