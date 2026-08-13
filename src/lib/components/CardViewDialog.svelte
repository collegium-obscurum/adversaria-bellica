<script lang="ts">
	import CardPreview from '$lib/components/card/CardPreview.svelte';
	import DownloadMenu from '$lib/components/DownloadMenu.svelte';
	import OptionsMenu from '$lib/components/OptionsMenu.svelte';
	import { cardFitZoom } from '$lib/domain/cardZoom';
	import type { MonsterCard } from '$lib/domain/types';

	// setting the card opens the dialog; closing it clears the card again
	let { card = $bindable() }: { card?: MonsterCard } = $props();

	let dialog: HTMLDialogElement;
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);

	// Reserve room for dialog padding, toolbar row, and backdrop margin.
	const zoom = $derived(cardFitZoom(viewportWidth - 120, viewportHeight - 160));

	$effect(() => {
		if (card) dialog.showModal();
	});
</script>

<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

<dialog
	bind:this={dialog}
	class="view-dialog"
	onclose={() => (card = undefined)}
	onclick={(event) => {
		if (event.target === dialog) dialog.close();
	}}
>
	{#if card}
		<div class="view-toolbar">
			<OptionsMenu />
			<DownloadMenu {card} />
			<button
				type="button"
				class="view-close"
				aria-label="Schließen"
				onclick={() => {
					dialog.close();
				}}>✕</button
			>
		</div>
		<div style:zoom>
			<CardPreview {card} />
		</div>
	{/if}
</dialog>

<style>
	dialog {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1rem 1.25rem 1.25rem;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 40%);
	}

	.view-toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.view-close {
		border: none;
		background: none;
		padding: 0.3rem;
		margin: -0.3rem -0.3rem -0.3rem auto;
		font: inherit;
		font-size: 1.1rem;
		color: var(--color-ink-soft);
		cursor: pointer;
	}

	.view-close:hover {
		color: var(--color-brand);
	}
</style>
