<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CardPreview from '$lib/CardPreview.svelte';
	import ImageCropper from '$lib/ImageCropper.svelte';
	import StyleToggle from '$lib/StyleToggle.svelte';
	import { getCard, upsertCard } from '$lib/storage.svelte';
	import { createEmptyCard } from '$lib/types';

	const editId = page.url.searchParams.get('id');
	const existing = editId ? getCard(editId) : undefined;

	let card = $state(existing ? structuredClone($state.snapshot(existing)) : createEmptyCard());
	let cropperDialog: HTMLDialogElement;

	function save() {
		if (!card.name.trim()) {
			alert('Die Karte braucht einen Namen.');
			return;
		}
		upsertCard($state.snapshot(card));
		void goto(resolve('/'));
	}

	function applyImage(dataUrl: string) {
		card.image = dataUrl;
		cropperDialog.close();
	}
</script>

<svelte:head>
	<title>{existing ? 'Karte bearbeiten' : 'Neue Karte'} – Adversaria Bellica</title>
</svelte:head>

<div class="editor">
	<div class="toolbar">
		<h1>{existing ? 'Karte bearbeiten' : 'Neue Karte'}</h1>
		<StyleToggle />
		<a class="cancel" href={resolve('/')}>Abbrechen</a>
		<button type="button" class="save" onclick={save}>Speichern</button>
	</div>

	<div class="card-zoom">
		<CardPreview
			bind:card
			editable
			onPortraitClick={() => {
				cropperDialog.showModal();
			}}
		/>
	</div>
</div>

<dialog bind:this={cropperDialog}>
	<h2>Kartenbild</h2>
	{#if card.image}
		<button
			type="button"
			onclick={() => {
				card.image = null;
				cropperDialog.close();
			}}>Bild entfernen</button
		>
	{/if}
	<ImageCropper onApply={applyImage} />
	<button
		type="button"
		onclick={() => {
			cropperDialog.close();
		}}>Schließen</button
	>
</dialog>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	h1 {
		margin: 0;
	}

	.cancel {
		color: #5c4a30;
	}

	.card-zoom {
		zoom: 1.7;
	}

	@media (max-width: 900px) {
		.card-zoom {
			zoom: 1;
		}
	}

	.save {
		padding: 0.5rem 1.5rem;
		font: inherit;
		font-weight: bold;
		background: #7a1e12;
		color: #f2e8d0;
		border: none;
		border-radius: 6px;
		cursor: pointer;
	}

	.save:hover {
		background: #8e2717;
	}

	dialog {
		border: 1px solid #c9c1b2;
		border-radius: 6px;
		padding: 1rem;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 40%);
	}

	dialog h2 {
		margin-top: 0;
	}

	dialog button {
		font: inherit;
		padding: 0.4rem 0.8rem;
		border: 1px solid #c9c1b2;
		border-radius: 4px;
		background: #fff;
		cursor: pointer;
		margin-top: 0.5rem;
	}
</style>
