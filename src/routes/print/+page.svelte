<script lang="ts">
	import CardPreview from '$lib/components/card/CardPreview.svelte';
	import OptionsMenu from '$lib/components/OptionsMenu.svelte';
	import defaultCardBack from '$lib/assets/card-back.svg';
	import { BACK_IMAGE_HEIGHT_PX, BACK_IMAGE_WIDTH_PX, coverCropRect } from '$lib/domain/cardBack';
	import {
		CARD_HEIGHT_MM,
		CARD_WIDTH_MM,
		CARDS_PER_PAGE,
		backSlotPosition,
		cardSlotPosition,
		cardsInSelectionOrder
	} from '$lib/domain/printLayout';
	import {
		cardBack,
		setCardBackEnabled,
		setCardBackImage,
		setCardBackMode
	} from '$lib/state/cardBack.svelte';
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

	async function loadImage(src: string): Promise<HTMLImageElement> {
		const image = new Image();
		await new Promise<void>((resolve, reject) => {
			image.onload = () => {
				resolve();
			};
			image.onerror = () => {
				reject(new Error(`Bild nicht ladbar: ${src.slice(0, 50)}`));
			};
			image.src = src;
		});
		return image;
	}

	/** Cover-crops and scales any image to the card's print resolution. */
	async function toCardSizedJpeg(src: string): Promise<string> {
		const image = await loadImage(src);
		const canvas = document.createElement('canvas');
		canvas.width = BACK_IMAGE_WIDTH_PX;
		canvas.height = BACK_IMAGE_HEIGHT_PX;
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas nicht verfügbar');
		const crop = coverCropRect(image.naturalWidth, image.naturalHeight);
		context.drawImage(
			image,
			crop.x,
			crop.y,
			crop.width,
			crop.height,
			0,
			0,
			canvas.width,
			canvas.height
		);
		return canvas.toDataURL('image/jpeg', 0.85);
	}

	async function onBackImageUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const objectUrl = URL.createObjectURL(file);
		try {
			setCardBackImage(await toCardSizedJpeg(objectUrl));
			setCardBackMode('custom');
		} catch (error) {
			console.error(error);
			alert('Bild konnte nicht geladen werden.');
		} finally {
			URL.revokeObjectURL(objectUrl);
			input.value = '';
		}
	}

	async function resolveBackImage(): Promise<string> {
		if (cardBack.mode === 'custom' && cardBack.customImage) {
			return cardBack.customImage;
		}
		return toCardSizedJpeg(defaultCardBack);
	}

	async function downloadPdf() {
		pdfBusy = true;
		try {
			const nodes = Array.from(document.querySelectorAll<HTMLElement>('.sheet .card'));
			const backDataUrl = cardBack.enabled ? await resolveBackImage() : null;
			const { toPng } = await import('html-to-image');
			const { jsPDF } = await import('jspdf');
			const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
			for (let pageStart = 0; pageStart < nodes.length; pageStart += CARDS_PER_PAGE) {
				if (pageStart > 0) pdf.addPage();
				const cardsOnPage = Math.min(CARDS_PER_PAGE, nodes.length - pageStart);
				for (let slot = 0; slot < cardsOnPage; slot++) {
					const dataUrl = await toPng(nodes[pageStart + slot], { pixelRatio: 300 / 96 });
					const { x, y } = cardSlotPosition(slot);
					pdf.addImage(dataUrl, 'PNG', x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, 'FAST');
				}
				if (backDataUrl) {
					pdf.addPage();
					for (let slot = 0; slot < cardsOnPage; slot++) {
						const { x, y } = backSlotPosition(slot);
						pdf.addImage(
							backDataUrl,
							'JPEG',
							x,
							y,
							CARD_WIDTH_MM,
							CARD_HEIGHT_MM,
							undefined,
							'FAST'
						);
					}
				}
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
			<OptionsMenu />
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
		<div class="backs">
			<label class="back-toggle">
				<input
					type="checkbox"
					checked={cardBack.enabled}
					onchange={(event) => {
						setCardBackEnabled(event.currentTarget.checked);
					}}
				/>
				Rückseiten für beidseitigen Druck (nur PDF)
			</label>
			{#if cardBack.enabled}
				<div class="back-options">
					<label>
						<input
							type="radio"
							name="back-mode"
							checked={cardBack.mode === 'default'}
							onchange={() => {
								setCardBackMode('default');
							}}
						/>
						Standardmotiv
					</label>
					<label>
						<input
							type="radio"
							name="back-mode"
							checked={cardBack.mode === 'custom'}
							disabled={!cardBack.customImage}
							onchange={() => {
								setCardBackMode('custom');
							}}
						/>
						Eigenes Bild
					</label>
					<label class="upload">
						Bild wählen …
						<input
							type="file"
							accept="image/*"
							onchange={(event) => {
								void onBackImageUpload(event);
							}}
						/>
					</label>
					<img
						class="back-preview"
						src={cardBack.mode === 'custom' && cardBack.customImage
							? cardBack.customImage
							: defaultCardBack}
						alt="Rückseiten-Vorschau"
					/>
					<span class="hint">Beim Drucken „Beidseitig, an langer Kante spiegeln“ wählen.</span>
				</div>
			{/if}
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

	.backs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.back-toggle,
	.back-options label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
	}

	.back-options {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.upload {
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.upload:hover {
		border-color: var(--color-gold);
	}

	.upload input {
		display: none;
	}

	.back-preview {
		width: 60px;
		height: 84px;
		object-fit: cover;
		border: 1px solid var(--color-border);
		border-radius: 4px;
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
