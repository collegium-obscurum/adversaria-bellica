const CARD_WIDTH_MM = 105;
const CSS_PX_PER_MM = 96 / 25.4;

export const CARD_WIDTH_PX = CARD_WIDTH_MM * CSS_PX_PER_MM;

const MAX_ZOOM = 1.7;

export function cardZoom(availableWidth: number): number {
	if (availableWidth <= 0) return 1;
	return Math.min(MAX_ZOOM, availableWidth / CARD_WIDTH_PX);
}
