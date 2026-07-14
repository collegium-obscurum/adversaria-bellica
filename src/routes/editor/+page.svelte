<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CardPreview from '$lib/components/card/CardPreview.svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import StatLabelToggle from '$lib/components/StatLabelToggle.svelte';
	import ImageToggle from '$lib/components/ImageToggle.svelte';
	import DownloadMenu from '$lib/components/DownloadMenu.svelte';
	import { STAT_BADGES } from '$lib/domain/statBadges';
	import { prefs } from '$lib/state/preferences.svelte';
	import StyleToggle from '$lib/components/StyleToggle.svelte';
	import TalentCalculator from '$lib/components/TalentCalculator.svelte';
	import { getCard, upsertCard } from '$lib/state/storage.svelte';
	import { cardZoom } from '$lib/domain/cardZoom';
	import type { FitResult } from '$lib/domain/cardFit';
	import { resolveEditorCard } from '$lib/domain/editorCard';

	const editId = page.url.searchParams.get('id');
	const existing = editId ? getCard(editId) : undefined;
	const resolved = resolveEditorCard(editId, existing ? $state.snapshot(existing) : undefined);

	const baseline = JSON.stringify(resolved.card);

	let card = $state(resolved.card);
	let cardMissing = $state(resolved.missing);
	let cropperDialog: HTMLDialogElement;
	let editorWidth = $state(0);
	let skipGuard = false;
	let fit = $state<FitResult>({ scale: 1, fits: true, imageHidden: false });
	const zoom = $derived(cardZoom(editorWidth));

	beforeNavigate((navigation) => {
		if (skipGuard || JSON.stringify($state.snapshot(card)) === baseline) return;
		if (navigation.type === 'leave') {
			navigation.cancel();
			return;
		}
		if (!confirm('Ungespeicherte Änderungen verwerfen?')) {
			navigation.cancel();
		}
	});

	function save() {
		if (!card.name.trim()) {
			alert('Die Karte braucht einen Namen.');
			return;
		}
		card.fit = { ...fit };
		upsertCard($state.snapshot(card));
		skipGuard = true;
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

<div class="editor" bind:clientWidth={editorWidth}>
	{#if cardMissing}
		<div class="notice" role="status">
			<span>Karte nicht gefunden – neue Karte wird angelegt.</span>
			<a href={resolve('/')}>Zur Bibliothek</a>
			<button type="button" aria-label="Hinweis schließen" onclick={() => (cardMissing = false)}
				>✕</button
			>
		</div>
	{/if}
	<div class="toolbar">
		<h1>{existing ? 'Karte bearbeiten' : 'Neue Karte'}</h1>
		<StyleToggle />
		<StatLabelToggle />
		<ImageToggle />
		<DownloadMenu {card} />
		<a class="cancel" href={resolve('/')} onclick={() => (skipGuard = true)}>Abbrechen</a>
		<button type="button" class="save" onclick={save}>Speichern</button>
	</div>

	<div class="workspace">
		<div class="card-column">
			{#if !fit.fits}
				<p class="fit-hint exceeded" role="status">Inhalt passt nicht auf die Karte.</p>
			{:else if fit.imageHidden || fit.scale < 1}
				<p class="fit-hint" role="status">
					{#if fit.imageHidden}Bild passt nicht auf die Karte und wird weggelassen.{/if}
					{#if fit.scale < 1}Text wird auf {Math.round(fit.scale * 100)}&nbsp;% verkleinert.{/if}
				</p>
			{/if}
			<div class="card-zoom" style:zoom>
				<CardPreview
					bind:card
					editable
					onPortraitClick={() => {
						cropperDialog.showModal();
					}}
				/>
			</div>
		</div>

		<!-- offscreen display-mode copy: measures the print fit while editing -->
		<div class="fit-measure" aria-hidden="true">
			<CardPreview
				bind:card
				onFit={(result: FitResult) => {
					fit = result;
				}}
			/>
		</div>

		<div class="side">
			<aside class="legend">
				<h2>Legende</h2>
				<ul>
					{#each STAT_BADGES as badge (badge.key)}
						<li>
							{#if prefs.statLabelMode === 'icons'}
								<span class="legend-icon"><StatIcon name={badge.key} /></span>
							{/if}
							<b>{badge.abbr}</b>
							<span>{badge.label}</span>
						</li>
					{/each}
				</ul>
			</aside>
			<aside class="calc-box">
				<TalentCalculator bind:card />
			</aside>
		</div>
	</div>
</div>

<dialog bind:this={cropperDialog}>
	<h2>Kartenbild</h2>
	{#if card.image}
		<button
			type="button"
			class="remove-image"
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
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.notice {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.9rem;
		background: var(--color-cream);
		border: 1px solid var(--color-gold);
		border-radius: var(--radius);
		color: var(--color-ink-soft);
	}

	.notice a {
		color: var(--color-brand);
		font-weight: bold;
	}

	.notice button {
		font: inherit;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		color: var(--color-ink-soft);
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
	}

	.cancel {
		color: var(--color-ink-soft);
	}

	.workspace {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.card-column {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.fit-hint {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-ink-soft);
	}

	.fit-hint.exceeded {
		color: var(--color-danger);
		font-weight: bold;
	}

	.fit-measure {
		position: absolute;
		left: -300mm;
		top: 0;
		pointer-events: none;
	}

	.side {
		position: sticky;
		top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.legend,
	.calc-box {
		background: var(--color-surface);
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-lg);
		padding: 0.9rem 1.1rem;
	}

	.legend h2 {
		margin: 0 0 0.5rem;
		font-family: var(--font-serif);
		font-size: 1rem;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--color-brand);
	}

	.legend ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.legend b {
		width: 2.2rem;
	}

	.legend-icon {
		width: 1.1rem;
		height: 1.1rem;
		color: var(--color-brand);
		line-height: 0;
	}

	.legend-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.save {
		padding: 0.5rem 1.5rem;
		font: inherit;
		font-weight: bold;
		background: var(--color-brand);
		color: var(--color-cream);
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
	}

	.save:hover {
		background: var(--color-brand-hover);
	}

	dialog {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1.25rem;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 40%);
	}

	dialog h2 {
		margin: 0 0 0.75rem;
		font-family: var(--font-serif);
		font-size: 1rem;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--color-brand);
	}

	dialog button {
		font: inherit;
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
		cursor: pointer;
		margin-top: 0.5rem;
	}

	dialog button:hover {
		border-color: var(--color-gold);
	}

	dialog .remove-image {
		border: none;
		background: none;
		padding: 0;
		color: var(--color-danger);
	}

	dialog .remove-image:hover {
		text-decoration: underline;
	}
</style>
