const COMBINING_MARKS = /[̀-ͯ]/g;

export function cardFileName(name: string, extension: string): string {
	const slug = name
		.trim()
		.toLowerCase()
		.replaceAll('ä', 'ae')
		.replaceAll('ö', 'oe')
		.replaceAll('ü', 'ue')
		.replaceAll('ß', 'ss')
		.normalize('NFD')
		.replace(COMBINING_MARKS, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${slug || 'karte'}.${extension}`;
}
