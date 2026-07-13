<script lang="ts">
	import CardPreview from '$lib/components/card/CardPreview.svelte';
	import StatLabelToggle from '$lib/components/StatLabelToggle.svelte';
	import StyleToggle from '$lib/components/StyleToggle.svelte';
	import {
		CARD_HEIGHT_MM,
		CARD_WIDTH_MM,
		CARDS_PER_PAGE,
		cardSlotPosition,
		cardsInSelectionOrder
	} from '$lib/domain/printLayout';
	import { prefs } from '$lib/state/preferences.svelte';
	import { store } from '$lib/state/storage.svelte';

	let selectedIds = $state<string[]>([]);
	let pdfBusy = $state(false);

	function hideBrokenImage(event: Event) {
		(event.currentTarget as HTMLImageElement).style.display = 'none';
	}

	const selectedCards = $derived(cardsInSelectionOrder(store.cards, selectedIds));

	function toggleCard(id: string, checked: boolean) {
		if (checked) {
			selectedIds = [...selectedIds, id];
		} else {
			selectedIds = selectedIds.filter((existing) => existing !== id);
		}
	}

	function selectAll() {
		selectedIds = store.cards.map((card) => card.id);
	}

	async function downloadPdf() {
		pdfBusy = true;
		try {
			const nodes = Array.from(document.querySelectorAll<HTMLElement>('.sheet .card'));
			const { toPng } = await import('html-to-image');
			const { jsPDF } = await import('jspdf');
			const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
			for (let index = 0; index < nodes.length; index++) {
				if (index > 0 && index % CARDS_PER_PAGE === 0) {
					pdf.addPage();
				}
				const dataUrl = await toPng(nodes[index], { pixelRatio: 300 / 96 });
				const { x, y } = cardSlotPosition(index);
				pdf.addImage(dataUrl, 'PNG', x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, 'FAST');
			}
			pdf.save('adversaria-bellica-karten.pdf');
		} catch (error) {
			console.error(error);
			alert('PDF-Erstellung fehlgeschlagen.');
		} finally {
			pdfBusy = false;
		}
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
		<div class="style-row">
			<StyleToggle />
			<StatLabelToggle />
			{#if prefs.cardStyle === 'ornate'}
				<span class="hint"
					>Der aventurische Stil druckt vollflächig Farbe und braucht viel Tinte.</span
				>
			{/if}
		</div>
		<div class="picker">
			{#each store.cards as card (card.id)}
				<label class="chip" class:selected={selectedIds.includes(card.id)}>
					<input
						type="checkbox"
						checked={selectedIds.includes(card.id)}
						onchange={(event) => {
							toggleCard(card.id, event.currentTarget.checked);
						}}
					/>
					{#if card.image}
						<img src={card.image} alt="" onerror={hideBrokenImage} />
					{:else}
						<span class="placeholder">{(card.name || '?').slice(0, 1)}</span>
					{/if}
					{card.name}
				</label>
			{/each}
		</div>
		<div class="buttons">
			<button type="button" onclick={selectAll}>Alle auswählen</button>
			<button type="button" onclick={() => (selectedIds = [])}>Auswahl leeren</button>
			<button
				type="button"
				disabled={selectedCards.length === 0 || pdfBusy}
				onclick={() => {
					void downloadPdf();
				}}
			>
				{pdfBusy ? 'Erstelle …' : 'PDF herunterladen'}
			</button>
			<button
				type="button"
				class="print-button"
				disabled={selectedCards.length === 0}
				onclick={() => {
					window.print();
				}}
			>
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
	.style-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.hint {
		color: var(--color-brand);
		font-size: 0.85rem;
	}

	.picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.8rem 0.3rem 0.3rem;
		border: 1px solid var(--color-border-soft);
		border-radius: 999px;
		background: var(--color-surface);
		cursor: pointer;
	}

	.chip.selected {
		border-color: var(--color-brand);
		box-shadow: 0 0 0 1px var(--color-brand);
	}

	.chip input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.chip:has(input:focus-visible) {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	.chip img,
	.placeholder {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ece4d2;
		color: var(--color-gold);
		font-family: var(--font-serif);
	}

	.buttons {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	button {
		font: inherit;
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
		cursor: pointer;
	}

	button:hover {
		border-color: var(--color-gold);
	}

	.print-button {
		font-weight: bold;
		background: var(--color-brand);
		color: var(--color-cream);
		border: none;
	}

	.print-button:hover {
		background: var(--color-brand-hover);
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

		.sheet :global(.card) {
			break-inside: avoid;
		}
	}

	@page {
		size: A4 portrait;
		margin: 0;
	}
</style>
