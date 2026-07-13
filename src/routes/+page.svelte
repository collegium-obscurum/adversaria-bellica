<script lang="ts">
	import { resolve } from '$app/paths';
	import { deleteCard, duplicateCard, exportJson, importJson, store } from '$lib/storage.svelte';
	import type { MonsterCard } from '$lib/types';

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

<div class="toolbar">
	<input type="search" placeholder="Suche nach Name…" bind:value={search} />
	<select bind:value={categoryFilter}>
		<option value="">Alle Typen</option>
		{#each categories as category (category)}
			<option value={category}>{category}</option>
		{/each}
	</select>
	<button type="button" onclick={onExport} disabled={store.cards.length === 0}>Export (JSON)</button
	>
	<label class="import">
		Import (JSON)
		<input type="file" accept="application/json,.json" onchange={onImport} />
	</label>
</div>

{#if store.cards.length === 0}
	<p>Noch keine Karten. <a href={resolve('/editor')}>Lege die erste an.</a></p>
{:else if filtered.length === 0}
	<p>Keine Karte passt zu Suche/Filter.</p>
{:else}
	<ul class="cards">
		{#each filtered as card (card.id)}
			<li>
				{#if card.image}
					<img src={card.image} alt="" />
				{:else}
					<span class="placeholder"></span>
				{/if}
				<div class="info">
					<strong>{card.name}</strong>
					<small>
						{card.category || 'ohne Typ'} · LeP {card.lifePoints} · RS {card.armor} · INI {card.initiative}
					</small>
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
		border: 1px solid #c9c1b2;
		border-radius: 4px;
		background: #fff;
	}

	button {
		cursor: pointer;
	}

	.import {
		border: 1px solid #c9c1b2;
		border-radius: 4px;
		background: #fff;
		padding: 0.4rem 0.6rem;
		cursor: pointer;
	}

	.import input {
		display: none;
	}

	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cards img,
	.placeholder {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.placeholder {
		background: #e5dfd2;
	}

	.cards li {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.6rem 1rem;
		background: #fff;
		border: 1px solid #c9c1b2;
		border-radius: 4px;
	}

	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.info small {
		color: #666;
	}

	.buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.danger {
		color: #a3231d;
	}
</style>
