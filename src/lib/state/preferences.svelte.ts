import {
	parseCardStyle,
	parseColorMode,
	parseStatLabelMode,
	type CardStyle,
	type ColorMode,
	type StatLabelMode
} from '$lib/domain/preferences';
import { readSetting, writeSetting } from './settings';

const STYLE_KEY = 'adversaria-bellica.cardStyle';
const STAT_LABEL_KEY = 'adversaria-bellica.statLabelMode';
const PRINT_IMAGES_KEY = 'adversaria-bellica.printImages';
const COLOR_MODE_KEY = 'adversaria-bellica.colorMode';

export const prefs = $state({
	cardStyle: parseCardStyle(readSetting(STYLE_KEY)),
	statLabelMode: parseStatLabelMode(readSetting(STAT_LABEL_KEY)),
	printImages: readSetting(PRINT_IMAGES_KEY) !== 'false',
	colorMode: parseColorMode(readSetting(COLOR_MODE_KEY))
});

export function setCardStyle(style: CardStyle) {
	prefs.cardStyle = style;
	writeSetting(STYLE_KEY, style);
}

export function setStatLabelMode(mode: StatLabelMode) {
	prefs.statLabelMode = mode;
	writeSetting(STAT_LABEL_KEY, mode);
}

export function setPrintImages(enabled: boolean) {
	prefs.printImages = enabled;
	writeSetting(PRINT_IMAGES_KEY, String(enabled));
}

export function setColorMode(mode: ColorMode) {
	prefs.colorMode = mode;
	writeSetting(COLOR_MODE_KEY, mode);
}
