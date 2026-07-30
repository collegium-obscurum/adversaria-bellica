import { browser } from '$app/environment';

/** Null on the server and for settings that were never written. */
export function readSetting(key: string): string | null {
	return browser ? localStorage.getItem(key) : null;
}

/** Returns false when the browser rejected the write, e.g. because the quota is full. */
export function writeSetting(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}
