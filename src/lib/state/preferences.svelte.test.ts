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
	return import('./preferences.svelte');
}

beforeEach(() => {
	vi.stubGlobal('localStorage', fakeLocalStorage());
});

describe('colorMode preference', () => {
	it('defaults to colored text', async () => {
		const state = await loadModule();
		expect(state.prefs.colorMode).toBe('text');
	});

	it('persists the mode across module reloads', async () => {
		const first = await loadModule();
		first.setColorMode('dot');
		expect(first.prefs.colorMode).toBe('dot');

		const second = await loadModule();
		expect(second.prefs.colorMode).toBe('dot');
	});
});

describe('printImages preference', () => {
	it('defaults to printing images', async () => {
		const state = await loadModule();
		expect(state.prefs.printImages).toBe(true);
	});

	it('persists the toggle across module reloads', async () => {
		const first = await loadModule();
		first.setPrintImages(false);
		expect(first.prefs.printImages).toBe(false);

		const second = await loadModule();
		expect(second.prefs.printImages).toBe(false);
	});
});
