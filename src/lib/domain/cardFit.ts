export const FIT_FLOOR = 0.7;
export const FIT_STEP = 0.05;

export interface FitResult {
	scale: number;
	fits: boolean;
	/** portrait auto-dropped because even the smallest text overflowed with it */
	imageHidden: boolean;
}

interface ScaleResult {
	scale: number;
	fits: boolean;
}

/**
 * Walk the scale down from 1 until the content fits or the floor is reached.
 * `overflows` must apply the scale to the card and report whether content still overflows.
 */
export function computeFitScale(overflows: (scale: number) => boolean): ScaleResult {
	let scale = 1;
	while (overflows(scale)) {
		if (scale <= FIT_FLOOR) {
			return { scale: FIT_FLOOR, fits: false };
		}
		scale = Math.max(FIT_FLOOR, Math.round((scale - FIT_STEP) * 100) / 100);
	}
	return { scale, fits: true };
}

/**
 * Full fit ladder: shrink text with the portrait in place; as a last resort
 * before clipping, drop the portrait and re-fit from full size.
 * `overflows` must apply scale and portrait visibility, then measure.
 */
export function computeCardFit(
	hasImage: boolean,
	overflows: (scale: number, imageHidden: boolean) => boolean
): FitResult {
	const withImage = computeFitScale((scale) => overflows(scale, false));
	if (withImage.fits || !hasImage) {
		return { ...withImage, imageHidden: false };
	}
	const withoutImage = computeFitScale((scale) => overflows(scale, true));
	return { ...withoutImage, imageHidden: true };
}
