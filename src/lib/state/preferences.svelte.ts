import { browser } from '$app/environment';
import { parseCardStyle, type CardStyle } from '$lib/domain/cardStyle';
import { parseStatLabelMode, type StatLabelMode } from '$lib/domain/statLabelMode';

const STYLE_KEY = 'adversaria-bellica.cardStyle';
const STAT_LABEL_KEY = 'adversaria-bellica.statLabelMode';
const PRINT_IMAGES_KEY = 'adversaria-bellica.printImages';

function loadStyle(): CardStyle {
	if (!browser) return 'minimal';
	return parseCardStyle(localStorage.getItem(STYLE_KEY));
}

function loadStatLabelMode(): StatLabelMode {
	if (!browser) return 'icons';
	return parseStatLabelMode(localStorage.getItem(STAT_LABEL_KEY));
}

function loadPrintImages(): boolean {
	if (!browser) return true;
	return localStorage.getItem(PRINT_IMAGES_KEY) !== 'false';
}

export const prefs = $state({
	cardStyle: loadStyle(),
	statLabelMode: loadStatLabelMode(),
	printImages: loadPrintImages()
});

export function setCardStyle(style: CardStyle) {
	prefs.cardStyle = style;
	try {
		localStorage.setItem(STYLE_KEY, style);
	} catch {
		// preference just won't survive the reload
	}
}

export function setStatLabelMode(mode: StatLabelMode) {
	prefs.statLabelMode = mode;
	try {
		localStorage.setItem(STAT_LABEL_KEY, mode);
	} catch {
		// preference just won't survive the reload
	}
}

export function setPrintImages(enabled: boolean) {
	prefs.printImages = enabled;
	try {
		localStorage.setItem(PRINT_IMAGES_KEY, String(enabled));
	} catch {
		// preference just won't survive the reload
	}
}
