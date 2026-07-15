import { migrateCard } from '$lib/domain/migrations';
import type { MonsterCard } from '$lib/domain/types';

const modules = import.meta.glob('./samples/*.json', { eager: true, import: 'default' });

// the in-app JSON download wraps the card in a one-element array; bare objects work too.
// clone before migrating: migrateCard mutates, and glob modules are shared singletons
export const sampleCards: MonsterCard[] = Object.values(modules)
	.flatMap((raw) => (Array.isArray(raw) ? (raw as unknown[]) : [raw]))
	.map((raw) => migrateCard(structuredClone(raw) as Record<string, unknown>))
	.sort((a, b) => a.name.localeCompare(b.name, 'de'));
