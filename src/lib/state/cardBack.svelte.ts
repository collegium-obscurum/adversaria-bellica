import { browser } from '$app/environment';
import { parseCardBackMode, type CardBackMode } from '$lib/domain/cardBack';

const ENABLED_KEY = 'adversaria-bellica.cardBack.enabled';
const MODE_KEY = 'adversaria-bellica.cardBack.mode';
const IMAGE_KEY = 'adversaria-bellica.cardBack.image';

function loadEnabled(): boolean {
	if (!browser) return false;
	return localStorage.getItem(ENABLED_KEY) === 'true';
}

function loadMode(): CardBackMode {
	if (!browser) return 'default';
	return parseCardBackMode(localStorage.getItem(MODE_KEY));
}

function loadCustomImage(): string | null {
	if (!browser) return null;
	return localStorage.getItem(IMAGE_KEY);
}

export const cardBack = $state({
	enabled: loadEnabled(),
	mode: loadMode(),
	customImage: loadCustomImage()
});

function persist(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		// preference just won't survive the reload
	}
}

export function setCardBackEnabled(enabled: boolean) {
	cardBack.enabled = enabled;
	persist(ENABLED_KEY, String(enabled));
}

export function setCardBackMode(mode: CardBackMode) {
	cardBack.mode = mode;
	persist(MODE_KEY, mode);
}

export function setCardBackImage(dataUrl: string) {
	cardBack.customImage = dataUrl;
	persist(IMAGE_KEY, dataUrl);
}
