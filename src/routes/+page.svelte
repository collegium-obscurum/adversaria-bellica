<script lang="ts">
	import { resolve } from '$app/paths';
	import CardPreview from '$lib/components/card/CardPreview.svelte';
	import DownloadMenu from '$lib/components/DownloadMenu.svelte';
	import OptionsMenu from '$lib/components/OptionsMenu.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import {
		deleteCard,
		duplicateCard,
		exportJson,
		importJson,
		store
	} from '$lib/state/storage.svelte';
	import { cardFitZoom } from '$lib/domain/cardZoom';
	import { STAT_BADGES } from '$lib/domain/statBadges';
	import type { MonsterCard } from '$lib/domain/types';

	let search = $state('');
	let categoryFilter = $state('');
	let sortAlpha = $state(false);
	let viewCard = $state<MonsterCard | undefined>();
	let viewDialog: HTMLDialogElement;
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);

	// Reserve room for dialog padding, toolbar row, and backdrop margin.
	const viewZoom = $derived(cardFitZoom(viewportWidth - 120, viewportHeight - 160));

	function openView(card: MonsterCard) {
		viewCard = card;
		viewDialog.showModal();
	}

	const categories = $derived(
		[...new Set(store.cards.map((card) => card.category).filter(Boolean))].sort()
	);

	const filtered = $derived.by(() => {
		const matching = store.cards.filter((card) => {
			if (categoryFilter && card.category !== categoryFilter) return false;
			return card.name.toLowerCase().includes(search.toLowerCase());
		});
		if (sortAlpha) {
			matching.sort((a, b) => a.name.localeCompare(b.name, 'de'));
		}
		return matching;
	});

	function hideBrokenImage(event: Event) {
		(event.currentTarget as HTMLImageElement).style.display = 'none';
	}

	// tile mirrors the card: badges hidden there or without a value stay off the tile
	function tileStats(card: MonsterCard): { abbr: string; label: string; value: string }[] {
		const stats = [];
		for (const badge of STAT_BADGES) {
			if (card.hiddenStats.includes(badge.key)) continue;
			const raw = badge.key === 'lifePoints' ? card.lifePoints : card[badge.key];
			const value = raw === null ? '' : String(raw).trim();
			if (value === '') continue;
			stats.push({ abbr: badge.abbr, label: badge.label, value });
		}
		return stats;
	}

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

<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

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
		<button
			type="button"
			class="sort"
			class:active={sortAlpha}
			aria-pressed={sortAlpha}
			title="Alphabetisch sortieren"
			onclick={() => (sortAlpha = !sortAlpha)}>A–Z</button
		>
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
					{#if !card.fit.fits || card.fit.imageHidden}
						<span class="tile-flags">
							{#if card.fit.imageHidden}
								<span class="flag" title="Bild passt nicht auf die Karte und wird weggelassen"
									>ohne Bild</span
								>
							{/if}
							{#if !card.fit.fits}
								<span class="flag danger" title="Inhalt passt nicht auf die Karte">Passt nicht</span
								>
							{/if}
						</span>
					{/if}
					<a class="tile-head" href="{resolve('/editor')}?id={card.id}">
						{#if card.image}
							<img src={card.image} alt="" onerror={hideBrokenImage} />
						{:else}
							<span class="placeholder">{(card.name || '?').slice(0, 1)}</span>
						{/if}
						<span class="naming">
							<strong>{card.name}</strong>
							<small>{card.category || 'ohne Typ'}</small>
						</span>
					</a>
					<div class="stats">
						{#each tileStats(card) as stat (stat.abbr)}
							<span title={stat.label}><small>{stat.abbr}</small>{stat.value}</span>
						{/each}
					</div>
					<div class="buttons">
						<button
							type="button"
							class="view"
							title="Ansehen"
							aria-label="{card.name} ansehen"
							onclick={() => {
								openView(card);
							}}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M12 5.5C7 5.5 3.3 9.3 1.8 12c1.5 2.7 5.2 6.5 10.2 6.5S20.7 14.7 22.2 12C20.7 9.3 17 5.5 12 5.5Z"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
								/>
								<circle cx="12" cy="12" r="3" fill="currentColor" />
							</svg>
						</button>
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

<dialog
	bind:this={viewDialog}
	class="view-dialog"
	onclose={() => (viewCard = undefined)}
	onclick={(event) => {
		if (event.target === viewDialog) viewDialog.close();
	}}
>
	{#if viewCard}
		<div class="view-toolbar">
			<OptionsMenu />
			<DownloadMenu card={viewCard} />
			<button
				type="button"
				class="view-close"
				aria-label="Schließen"
				onclick={() => {
					viewDialog.close();
				}}>✕</button
			>
		</div>
		<div style:zoom={viewZoom}>
			<CardPreview card={viewCard} />
		</div>
	{/if}
</dialog>

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

	.sort.active {
		border-color: var(--color-brand);
		box-shadow: 0 0 0 1px var(--color-brand);
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
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.9rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-lg);
	}

	.tile-flags {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		gap: 0.3rem;
	}

	.flag {
		padding: 0.1rem 0.45rem;
		border-radius: var(--radius);
		background: var(--color-border);
		color: var(--color-ink-soft);
		font-size: 0.7rem;
		font-weight: bold;
	}

	.flag.danger {
		background: var(--color-danger);
		color: #fff;
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
		flex-wrap: wrap;
		gap: 0.35rem 0.75rem;
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
		margin-top: auto;
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

	.buttons .view {
		display: inline-flex;
		width: 1.2rem;
		height: 1.2rem;
		line-height: 0;
	}

	.buttons .view:hover {
		color: var(--color-brand);
		text-decoration: none;
	}

	.buttons .view svg {
		width: 100%;
		height: 100%;
	}

	.view-dialog {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem 1.25rem;
	}

	.view-dialog::backdrop {
		background: rgb(0 0 0 / 40%);
	}

	.view-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.view-close {
		border: none;
		background: none;
		padding: 0;
		font: inherit;
		font-size: 1.1rem;
		color: var(--color-ink-soft);
		cursor: pointer;
	}

	.view-close:hover {
		color: var(--color-brand);
	}

	.danger {
		margin-left: auto;
	}

	.buttons .danger {
		color: var(--color-danger);
	}
</style>
