import { parseCardBackMode, type CardBackMode } from '$lib/domain/cardBack';
import { readSetting, writeSetting } from './settings';

const ENABLED_KEY = 'adversaria-bellica.cardBack.enabled';
const MODE_KEY = 'adversaria-bellica.cardBack.mode';
const IMAGE_KEY = 'adversaria-bellica.cardBack.image';

export const cardBack = $state({
	enabled: readSetting(ENABLED_KEY) === 'true',
	mode: parseCardBackMode(readSetting(MODE_KEY)),
	customImage: readSetting(IMAGE_KEY)
});

export function setCardBackEnabled(enabled: boolean) {
	cardBack.enabled = enabled;
	writeSetting(ENABLED_KEY, String(enabled));
}

export function setCardBackMode(mode: CardBackMode) {
	cardBack.mode = mode;
	writeSetting(MODE_KEY, mode);
}

export function setCardBackImage(dataUrl: string) {
	cardBack.customImage = dataUrl;
	// the image is by far the largest localStorage entry; a silent quota failure
	// would show a preview that vanishes on reload
	if (!writeSetting(IMAGE_KEY, dataUrl)) {
		alert(
			'Das Rückseitenbild konnte nicht gespeichert werden (Speicher voll). ' +
				'Es geht beim Neuladen der Seite verloren. Tipp: ein kleineres Bild wählen ' +
				'oder nicht mehr benötigte Karten löschen.'
		);
	}
}
