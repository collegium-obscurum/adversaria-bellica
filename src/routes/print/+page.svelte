<script lang="ts">
	import CardPreview from '$lib/CardPreview.svelte';
	import { store } from '$lib/storage.svelte';

	let selectedIds = $state<string[]>([]);

	const selectedCards = $derived(store.cards.filter((card) => selectedIds.includes(card.id)));

	function selectAll() {
		selectedIds = store.cards.map((card) => card.id);
	}
</script>

<svelte:head>
	<title>Drucken – Adversaria Bellica</title>
</svelte:head>

<div class="no-print controls">
	<h1>Drucken</h1>
	<p>Karten auswählen, dann drucken. 4 Karten (A6) passen auf eine A4-Seite.</p>
	{#if store.cards.length === 0}
		<p>Keine Karten vorhanden.</p>
	{:else}
		<div class="picker">
			{#each store.cards as card (card.id)}
				<label>
					<input type="checkbox" value={card.id} bind:group={selectedIds} />
					{card.name}
				</label>
			{/each}
		</div>
		<div class="buttons">
			<button type="button" onclick={selectAll}>Alle auswählen</button>
			<button type="button" onclick={() => (selectedIds = [])}>Auswahl leeren</button>
			<button type="button" class="print-button" disabled={selectedCards.length === 0} onclick={() => window.print()}>
				Drucken ({selectedCards.length})
			</button>
		</div>
	{/if}
</div>

<div class="sheet">
	{#each selectedCards as card (card.id)}
		<CardPreview {card} />
	{/each}
</div>

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.buttons {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	button {
		font: inherit;
		padding: 0.4rem 0.8rem;
		border: 1px solid #c9c1b2;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
	}

	.print-button {
		font-weight: bold;
		background: #2b2620;
		color: #f5f3ee;
		border: none;
	}

	.print-button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.sheet {
		display: flex;
		flex-wrap: wrap;
		gap: 4mm;
	}

	@media print {
		.sheet {
			width: 210mm;
			gap: 0;
		}
	}

	@page {
		size: A4 portrait;
		margin: 0;
	}
</style>
