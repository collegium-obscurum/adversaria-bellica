import { CARD_HEIGHT_MM, CARD_WIDTH_MM } from './printLayout';

const CSS_PX_PER_MM = 96 / 25.4;

export const CARD_WIDTH_PX = CARD_WIDTH_MM * CSS_PX_PER_MM;
export const CARD_HEIGHT_PX = CARD_HEIGHT_MM * CSS_PX_PER_MM;

const MAX_ZOOM = 1.7;

export function cardZoom(availableWidth: number): number {
	if (availableWidth <= 0) return 1;
	return Math.min(MAX_ZOOM, availableWidth / CARD_WIDTH_PX);
}

export function cardFitZoom(availableWidth: number, availableHeight: number): number {
	if (availableWidth <= 0 || availableHeight <= 0) return 1;
	return Math.min(MAX_ZOOM, availableWidth / CARD_WIDTH_PX, availableHeight / CARD_HEIGHT_PX);
}
