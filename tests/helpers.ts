import type { Page } from '@playwright/test';
import type { MonsterCard } from '../src/lib/domain/types';

export const CARDS_KEY = 'adversaria-bellica.cards';

export interface SeedAction {
	span: number;
	name: string;
	effect: string;
	color?: string;
}

/** Minimal card shape for seeding; migrateCard fills every other field on load. */
export interface SeedCard {
	id: string;
	name: string;
	category?: string;
	banner?: string;
	lifePoints?: number;
	initiative?: string;
	actions?: SeedAction[];
}

/** Writes a raw JSON string into the cards key and reloads; for legacy-shape seeds. */
export async function seedRaw(page: Page, json: string): Promise<void> {
	await page.goto('/');
	await page.evaluate(
		([key, value]) => {
			localStorage.setItem(key, value);
		},
		[CARDS_KEY, json] as const
	);
	await page.reload();
}

/** Writes cards into localStorage and reloads so the app boots with them. */
export async function seedCards(page: Page, cards: SeedCard[]): Promise<void> {
	await seedRaw(page, JSON.stringify(cards));
}

export async function storedCards(page: Page): Promise<MonsterCard[]> {
	const json = await page.evaluate((key) => localStorage.getItem(key) ?? '[]', CARDS_KEY);
	return JSON.parse(json) as MonsterCard[];
}
