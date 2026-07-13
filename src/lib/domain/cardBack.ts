export const BACK_IMAGE_WIDTH_PX = 1240;
export const BACK_IMAGE_HEIGHT_PX = 1748;

export type CardBackMode = 'default' | 'custom';

export function parseCardBackMode(value: string | null): CardBackMode {
	return value === 'custom' ? 'custom' : 'default';
}

/** Centered source rect that cover-crops an image to the card's portrait ratio. */
export function coverCropRect(
	sourceWidth: number,
	sourceHeight: number
): { x: number; y: number; width: number; height: number } {
	const targetRatio = BACK_IMAGE_WIDTH_PX / BACK_IMAGE_HEIGHT_PX;
	if (sourceWidth / sourceHeight > targetRatio) {
		const width = sourceHeight * targetRatio;
		return { x: (sourceWidth - width) / 2, y: 0, width, height: sourceHeight };
	}
	const height = sourceWidth / targetRatio;
	return { x: 0, y: (sourceHeight - height) / 2, width: sourceWidth, height };
}
