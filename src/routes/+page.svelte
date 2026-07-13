<script lang="ts">
	import { resolve } from '$app/paths';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import {
		deleteCard,
		duplicateCard,
		exportJson,
		importJson,
		store
	} from '$lib/state/storage.svelte';
	import type { MonsterCard } from '$lib/domain/types';

	let search = $state('');
	let categoryFilter = $state('');

	const categories = $derived(
		[...new Set(store.cards.map((card) => card.category).filter(Boolean))].sort()
	);

	const filtered = $derived(
		store.cards.filter((card) => {
			if (categoryFilter && card.category !== categoryFilter) return false;
			return card.name.toLowerCase().includes(search.toLowerCase());
		})
	);

	function onDelete(card: MonsterCard) {
		if (confirm(`Karte „${card.name}" wirklich löschen?`)) {
			deleteCard(card.id);
		}
	}

	function onExport() {
		const blob = new Blob([exportJson()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'adversaria-bellica-karten.json';
		link.click();
		URL.revokeObjectURL(url);
	}

	async function onImport(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			const count = importJson(await file.text());
			alert(`${count} Karte(n) importiert.`);
		} catch (error) {
			alert(`Import fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`);
		}
		input.value = '';
	}
</script>

<svelte:head>
	<title>Bibliothek – Adversaria Bellica</title>
</svelte:head>

<h1>Bibliothek</h1>

{#if store.cards.length === 0}
	<div class="empty">
		<span class="empty-sigil"><StatIcon name="actionCount" cutColor="#f4efe4" /></span>
		<p>Noch keine Gegner in der Bibliothek.</p>
		<a class="primary" href={resolve('/editor')}>Erste Karte anlegen</a>
	</div>
{:else}
	<div class="toolbar">
		<input type="search" placeholder="Suche nach Name…" bind:value={search} />
		<select bind:value={categoryFilter}>
			<option value="">Alle Typen</option>
			{#each categories as category (category)}
				<option value={category}>{category}</option>
			{/each}
		</select>
		<button type="button" onclick={onExport}>Export (JSON)</button>
		<label class="import">
			Import (JSON)
			<input type="file" accept="application/json,.json" onchange={onImport} />
		</label>
	</div>

	{#if filtered.length === 0}
		<p>Keine Karte passt zu Suche/Filter.</p>
	{:else}
		<ul class="cards">
			{#each filtered as card (card.id)}
				<li>
					<a class="tile-head" href="{resolve('/editor')}?id={card.id}">
						{#if card.image}
							<img src={card.image} alt="" />
						{:else}
							<span class="placeholder">{(card.name || '?').slice(0, 1)}</span>
						{/if}
						<span class="naming">
							<strong>{card.name}</strong>
							<small>{card.category || 'ohne Typ'}</small>
						</span>
					</a>
					<div class="stats">
						<span title="Lebenspunkte"><small>LeP</small>{card.lifePoints}</span>
						<span title="Rüstungsschutz"><small>RS</small>{card.armor}</span>
						<span title="Initiative"><small>INI</small>{card.initiative}</span>
						<span title="Geschwindigkeit"><small>GS</small>{card.speed}</span>
					</div>
					<div class="buttons">
						<a href="{resolve('/editor')}?id={card.id}">Bearbeiten</a>
						<button type="button" onclick={() => duplicateCard(card.id)}>Duplizieren</button>
						<button
							type="button"
							class="danger"
							onclick={() => {
								onDelete(card);
							}}>Löschen</button
						>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.toolbar {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.toolbar input[type='search'] {
		flex: 1;
		min-width: 12rem;
	}

	input,
	select,
	button {
		font: inherit;
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	button {
		cursor: pointer;
	}

	button:hover {
		border-color: var(--color-gold);
	}

	.import {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
		padding: 0.4rem 0.6rem;
		cursor: pointer;
	}

	.import:hover {
		border-color: var(--color-gold);
	}

	.import input {
		display: none;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 4rem 1rem;
		color: var(--color-ink-soft);
	}

	.empty-sigil {
		width: 3.5rem;
		height: 3.5rem;
		color: var(--color-gold);
		line-height: 0;
	}

	.empty-sigil :global(svg) {
		width: 100%;
		height: 100%;
	}

	.empty p {
		margin: 0;
	}

	.primary {
		background: var(--color-brand);
		color: var(--color-cream);
		text-decoration: none;
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius);
		font-weight: bold;
	}

	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 0.75rem;
	}

	.cards li {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.9rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-lg);
	}

	.tile-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
	}

	.tile-head img,
	.placeholder {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
		border: 2px solid #e3d8c2;
	}

	.placeholder {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ece4d2;
		color: var(--color-gold);
		font-family: var(--font-serif);
		font-size: 1.5rem;
	}

	.naming {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.naming strong {
		font-family: var(--font-serif);
		font-size: 1.05rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.naming small {
		color: var(--color-ink-soft);
		font-variant: small-caps;
		letter-spacing: 0.04em;
	}

	.stats {
		display: flex;
		gap: 1rem;
		color: var(--color-ink-soft);
		font-size: 0.9rem;
	}

	.stats span {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
	}

	.stats small {
		font-size: 0.7rem;
		color: var(--color-gold);
	}

	.buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		border-top: 1px solid #eee6d6;
		padding-top: 0.6rem;
		font-size: 0.9rem;
	}

	.buttons a {
		color: var(--color-brand);
		font-weight: bold;
		text-decoration: none;
	}

	.buttons a:hover {
		text-decoration: underline;
	}

	.buttons button {
		border: none;
		background: none;
		padding: 0;
		color: var(--color-ink-soft);
		font-size: 0.9rem;
	}

	.buttons button:hover {
		text-decoration: underline;
	}

	.danger {
		margin-left: auto;
	}

	.buttons .danger {
		color: var(--color-danger);
	}
</style>
