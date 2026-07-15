import type { StatKey } from './statBadges';

/*
 * Solid silhouettes read better at 3mm print size than thin outlines.
 * All styling lives in SVG attributes, not CSS classes: html-to-image
 * (PNG/PDF export) deep-clones <svg> without inlining computed styles on its
 * children, so class-styled strokes disappear from the capture.
 * "cut" paths are detail lines drawn in the badge background colour.
 */
function cut(d: string, cutColor: string): string {
	return `<path fill="none" stroke="${cutColor}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`;
}

function line(d: string, width: number): string {
	return `<path fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" d="${d}"/>`;
}

const ICONS: Record<StatKey, (cutColor: string) => string> = {
	lifePoints: () =>
		'<path fill="currentColor" d="M12 20.5 C6.6 15.9 3 12.9 3 8.9 C3 5.9 5.3 3.9 7.9 3.9 C9.6 3.9 11.2 4.9 12 6.4 C12.8 4.9 14.4 3.9 16.1 3.9 C18.7 3.9 21 5.9 21 8.9 C21 12.9 17.4 15.9 12 20.5 Z"/>',
	armor: (cutColor) =>
		'<path fill="currentColor" d="M12 2.2 L20.2 5.4 V11 C20.2 16.6 16.8 20.5 12 21.9 C7.2 20.5 3.8 16.6 3.8 11 V5.4 Z"/>' +
		cut('M12 5.2 V18.8 M6.6 9.4 H17.4', cutColor),
	initiative: () =>
		'<path fill="currentColor" d="M13.4 1.8 L4.6 13.4 H10.2 L8.4 22.2 L19.4 9.2 H12.8 Z"/>',
	speed: () =>
		'<path fill="currentColor" d="M5 3.5 L13.5 12 L5 20.5 V14.4 L7.4 12 L5 9.6 Z"/>' +
		'<path fill="currentColor" d="M11.5 3.5 L20 12 L11.5 20.5 V14.4 L13.9 12 L11.5 9.6 Z"/>',
	defense: () =>
		line('M5 4.4 L15.6 15 M19 4.4 L8.4 15', 3) +
		line('M13.4 17.4 L18.4 12.4 M10.6 17.4 L5.6 12.4', 1.9) +
		line('M16.5 15.9 L18.9 18.3 M7.5 15.9 L5.1 18.3', 2.4) +
		'<circle fill="currentColor" cx="20" cy="19.4" r="1.5"/>' +
		'<circle fill="currentColor" cx="4" cy="19.4" r="1.5"/>',
	soulPower: () =>
		'<path fill="currentColor" d="M12 1.8 L14.7 8 L21.2 8.7 L16.3 13.1 L17.8 19.8 L12 16.2 L6.2 19.8 L7.7 13.1 L2.8 8.7 L9.3 8 Z"/>',
	toughness: () =>
		'<path fill="currentColor" d="M2.5 6.5 H13 C16.5 6.5 19.5 5.5 21.5 3.8 C21.5 7.6 18.8 10.2 15 10.6 L14.4 13.6 H16.2 V16.4 H7.8 V13.6 H9.6 L9 10.6 H7 C4.2 10.6 2.5 8.8 2.5 6.5 Z"/>' +
		'<path fill="currentColor" d="M6.5 18 H17.5 V20.5 H6.5 Z"/>',
	sizeCategory: () =>
		'<path fill="currentColor" d="M12.6 3 H21 V11.4 Z"/>' +
		'<path fill="currentColor" d="M11.4 21 H3 V12.6 Z"/>' +
		line('M8.6 15.4 L15.4 8.6', 3),
	actionCount: (cutColor) =>
		'<path fill="currentColor" d="M12 1.6 L21 6.8 V17.2 L12 22.4 L3 17.2 V6.8 Z"/>' +
		cut(
			'M12 7.6 L17.7 16.4 L6.3 16.4 Z M12 1.6 V7.6 M21 6.8 L17.7 16.4 M3 6.8 L6.3 16.4 M12 22.4 L6.3 16.4 M12 22.4 L17.7 16.4 M21 17.2 L17.7 16.4 M3 17.2 L6.3 16.4',
			cutColor
		)
};

export function statIconMarkup(name: StatKey, cutColor = '#fff'): string {
	return ICONS[name](cutColor);
}
