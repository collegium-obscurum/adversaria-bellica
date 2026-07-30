/** Triggers a browser download for a blob URL or data URL. */
export function downloadUrl(href: string, filename: string) {
	const link = document.createElement('a');
	link.href = href;
	link.download = filename;
	link.click();
}

export function downloadJson(json: string, filename: string) {
	const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
	downloadUrl(url, filename);
	URL.revokeObjectURL(url);
}
