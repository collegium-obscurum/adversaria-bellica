import { browser } from '$app/environment';
import { parseCardStyle, type CardStyle } from './cardStyle';

const STYLE_KEY = 'adversaria-bellica.cardStyle';

function loadStyle(): CardStyle {
	if (!browser) return 'minimal';
	return parseCardStyle(localStorage.getItem(STYLE_KEY));
}

export const prefs = $state({ cardStyle: loadStyle() });

export function setCardStyle(style: CardStyle) {
	prefs.cardStyle = style;
	try {
		localStorage.setItem(STYLE_KEY, style);
	} catch {
		// preference just won't survive the reload
	}
}
