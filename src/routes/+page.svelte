<script lang="ts">
	import { resolve } from '$app/paths';
	import CardPreview from '$lib/components/card/CardPreview.svelte';
	import DownloadMenu from '$lib/components/DownloadMenu.svelte';
	import OptionsMenu from '$lib/components/OptionsMenu.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import TileHead from '$lib/components/TileHead.svelte';
	import {
		copyToLibrary,
		deleteCard,
		duplicateCard,
		exportJson,
		importJson,
		store
	} from '$lib/state/storage.svelte';
	import { sampleCards } from '$lib/data/samples';
	import { cardFitZoom } from '$lib/domain/cardZoom';
	import { filterCards, WITHOUT } from '$lib/domain/libraryFilter';
	import { prefs } from '$lib/state/preferences.svelte';
	import { STAT_BADGES } from '$lib/domain/statBadges';
	import type { MonsterCard } from '$lib/domain/types';

	let view = $state<'own' | 'samples'>('own');
	let search = $state('');
	let categoryFilter = $state('');
	let bannerFilter = $state('');
	let sortAlpha = $state(false);
	let copiedId = $state('');
	let copiedTimer: ReturnType<typeof setTimeout>;
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

	const shownCards = $derived(view === 'samples' ? sampleCards : store.cards);

	const categories = $derived(
		[...new Set(shownCards.map((card) => card.category).filter(Boolean))].sort()
	);

	const banners = $derived(
		[...new Set(shownCards.map((card) => card.banner).filter((banner) => banner.trim()))].sort()
	);

	const filtered = $derived.by(() => {
		const matching = filterCards(shownCards, {
			search,
			category: categoryFilter,
			banner: bannerFilter
		});
		if (sortAlpha) {
			matching.sort((a, b) => a.name.localeCompare(b.name, 'de'));
		}
		return matching;
	});

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

	function onCopy(card: MonsterCard) {
		copyToLibrary(card);
		copiedId = card.id;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => (copiedId = ''), 1500);
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

{#if view === 'own' && store.cards.length === 0}
	<div class="empty">
		<span class="empty-sigil"><StatIcon name="actionCount" cutColor="#f4efe4" /></span>
		<p>Noch keine Gegner in der Bibliothek.</p>
		<a class="primary" href={resolve('/editor')}>Erste Karte anlegen</a>
		<button type="button" class="secondary" onclick={() => (view = 'samples')}
			>Vorlagen ansehen</button
		>
	</div>
{:else}
	<div class="toolbar">
		<div class="switch" role="group" aria-label="Kartenquelle">
			<button type="button" class:active={view === 'own'} onclick={() => (view = 'own')}
				>Eigene</button
			>
			<button type="button" class:active={view === 'samples'} onclick={() => (view = 'samples')}
				>Vorlagen</button
			>
		</div>
		<input type="search" placeholder="Suche nach Name…" bind:value={search} />
		<select bind:value={categoryFilter}>
			<option value="">Alle Typen</option>
			<option value={WITHOUT}>ohne Typ</option>
			{#each categories as category (category)}
				<option value={category}>{category}</option>
			{/each}
		</select>
		<select bind:value={bannerFilter}>
			<option value="">Alle Banner</option>
			<option value={WITHOUT}>ohne Banner</option>
			{#each banners as banner (banner)}
				<option value={banner}>{banner}</option>
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
		{#if view === 'own'}
			<button type="button" onclick={onExport}>Export (JSON)</button>
			<label class="import">
				Import (JSON)
				<input type="file" accept="application/json,.json" onchange={onImport} />
			</label>
		{/if}
	</div>

	{#if view === 'samples'}
		<p class="samples-note">
			Vorlagen kommen ohne Bilder, aus Urheberrechtsgründen. Eigene Bilder können nach dem Kopieren
			ergänzt werden.
		</p>
	{/if}

	{#if filtered.length === 0}
		<p>Keine Karte passt zu Suche/Filter.</p>
	{:else}
		<ul class="cards" class:ornate-tints={prefs.cardStyle === 'ornate'}>
			{#each filtered as card (card.id)}
				<li
					class:has-banner={card.banner.trim() !== ''}
					style:--wash={card.bannerColor ? `var(--tint-${card.bannerColor})` : null}
				>
					{#if card.banner.trim() !== ''}
						<div
							class="tile-banner"
							style:background={card.bannerColor ? `var(--tint-${card.bannerColor})` : null}
						>
							{card.banner}
						</div>
					{/if}
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
					{#if view === 'samples'}
						<button
							type="button"
							class="tile-head"
							onclick={() => {
								openView(card);
							}}
						>
							<TileHead {card} />
						</button>
					{:else}
						<a class="tile-head" href="{resolve('/editor')}?id={card.id}">
							<TileHead {card} />
						</a>
					{/if}
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
						{#if view === 'samples'}
							<button
								type="button"
								onclick={() => {
									onCopy(card);
								}}
							>
								{copiedId === card.id ? 'Kopiert ✓' : 'In Bibliothek kopieren'}
							</button>
						{:else}
							<a href="{resolve('/editor')}?id={card.id}">Bearbeiten</a>
							<button type="button" onclick={() => duplicateCard(card.id)}>Duplizieren</button>
							<button
								type="button"
								class="danger"
								onclick={() => {
									onDelete(card);
								}}>Löschen</button
							>
						{/if}
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
			<DownloadMenu card={viewCard} />
			<OptionsMenu />
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

	.samples-note {
		color: var(--color-ink-soft);
		font-size: 0.9rem;
		margin: -0.75rem 0 1.5rem;
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

	.switch {
		display: flex;
	}

	.switch button {
		border-radius: 0;
	}

	.switch button:first-child {
		border-radius: var(--radius) 0 0 var(--radius);
	}

	.switch button:last-child {
		border-radius: 0 var(--radius) var(--radius) 0;
		border-left: none;
	}

	.switch button.active {
		background: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-cream);
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

	.empty .secondary {
		padding: 0.5rem 1.25rem;
		font-weight: bold;
		color: var(--color-brand);
		border-color: var(--color-brand);
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
		/* same wash formula as the card itself: banner tint at 16% over the surface */
		--wash-layer: color-mix(in srgb, var(--wash, transparent) 16%, transparent);
		background: linear-gradient(var(--wash-layer), var(--wash-layer)), var(--color-surface);
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-lg);
	}

	.tile-banner {
		margin: -0.9rem -1rem 0;
		padding: 0.25rem 0.75rem;
		border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
		background: var(--color-brand);
		color: var(--color-cream);
		font-variant: small-caps;
		letter-spacing: 0.04em;
		font-size: 0.85rem;
		font-weight: bold;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tile-flags {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		gap: 0.3rem;
	}

	.cards li.has-banner .tile-flags {
		top: 2.1rem;
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

	button.tile-head {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		text-align: left;
		cursor: pointer;
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
		/* darken the separator with the tint so it stays visible on washed tiles */
		border-top: 1px solid color-mix(in srgb, var(--wash, transparent) 35%, #eee6d6);
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
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.view-toolbar .view-close {
		margin-left: auto;
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
