/** Returns the user-facing error for an invalid card name, or null if it is fine. */
export function cardNameError(name: string): string | null {
	return name.trim() === '' ? 'Die Karte braucht einen Namen.' : null;
}
