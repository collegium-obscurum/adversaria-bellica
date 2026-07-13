<script lang="ts">
	import { tick } from 'svelte';
	import { cardFileName } from '$lib/domain/filename';
	import type { MonsterCard } from '$lib/domain/types';
	import CardPreview from './card/CardPreview.svelte';

	let { card }: { card: MonsterCard } = $props();

	const CARD_WIDTH_MM = 105;
	const CARD_HEIGHT_MM = 148;
	const PIXEL_RATIO = 300 / 96; // 300 DPI over the browser's 96 CSS px per inch

	let details: HTMLDetailsElement;
	let captureArea: HTMLDivElement | undefined = $state();
	let snapshot: MonsterCard | undefined = $state();
	let busy = $state(false);

	async function captureCard(): Promise<string> {
		snapshot = $state.snapshot(card);
		await tick();
		const node = captureArea?.querySelector<HTMLElement>('.card');
		if (!node) throw new Error('Capture card not mounted');
		const { toPng } = await import('html-to-image');
		return toPng(node, { pixelRatio: PIXEL_RATIO });
	}

	async function download(format: 'png' | 'pdf') {
		details.open = false;
		busy = true;
		try {
			const dataUrl = await captureCard();
			if (format === 'png') {
				const link = document.createElement('a');
				link.href = dataUrl;
				link.download = cardFileName(card.name, 'png');
				link.click();
			} else {
				const { jsPDF } = await import('jspdf');
				const pdf = new jsPDF({ unit: 'mm', format: [CARD_WIDTH_MM, CARD_HEIGHT_MM] });
				pdf.addImage(dataUrl, 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, 'FAST');
				pdf.save(cardFileName(card.name, 'pdf'));
			}
		} catch (error) {
			console.error(error);
			alert('Download fehlgeschlagen.');
		} finally {
			snapshot = undefined;
			busy = false;
		}
	}
</script>

<details class="download" bind:this={details}>
	<summary>{busy ? 'Erstelle …' : 'Herunterladen'}</summary>
	<div class="menu">
		<button type="button" disabled={busy} onclick={() => download('png')}>Als PNG</button>
		<button type="button" disabled={busy} onclick={() => download('pdf')}>Als PDF</button>
	</div>
</details>

{#if snapshot}
	<div class="capture-area" bind:this={captureArea} aria-hidden="true">
		<CardPreview card={snapshot} />
	</div>
{/if}

<style>
	.download {
		position: relative;
	}

	summary {
		list-style: none;
		padding: 0.5rem 1rem;
		border: 1px solid #c9c1b2;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		user-select: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.menu {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		min-width: 100%;
		border: 1px solid #c9c1b2;
		border-radius: 6px;
		background: #fff;
		overflow: hidden;
	}

	.menu button {
		font: inherit;
		padding: 0.5rem 1rem;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		white-space: nowrap;
	}

	.menu button:hover {
		background: #f2e8d0;
	}

	.capture-area {
		position: fixed;
		top: 0;
		left: -200mm;
	}
</style>
