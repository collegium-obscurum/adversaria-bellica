<script lang="ts">
	import type { CardStyle } from '$lib/domain/cardStyle';
	import type { ColorMode } from '$lib/domain/colorMode';
	import type { StatLabelMode } from '$lib/domain/statLabelMode';
	import {
		prefs,
		setCardStyle,
		setColorMode,
		setPrintImages,
		setStatLabelMode
	} from '$lib/state/preferences.svelte';
	import Toggle from './Toggle.svelte';

	const STYLE_OPTIONS: { value: CardStyle; label: string }[] = [
		{ value: 'minimal', label: 'Druckfreundlich' },
		{ value: 'ornate', label: 'Aventurisch' }
	];
	const STAT_LABEL_OPTIONS: { value: StatLabelMode; label: string }[] = [
		{ value: 'icons', label: 'Symbole' },
		{ value: 'text', label: 'Text' }
	];
	const COLOR_OPTIONS: { value: ColorMode; label: string }[] = [
		{ value: 'text', label: 'Farbtext' },
		{ value: 'dot', label: 'Farbpunkt' }
	];
	const IMAGE_OPTIONS: { value: boolean; label: string }[] = [
		{ value: true, label: 'Mit Bild' },
		{ value: false, label: 'Ohne Bild' }
	];

	let details = $state<HTMLDetailsElement>();

	function closeOnOutsideClick(event: MouseEvent) {
		if (details?.open && !details.contains(event.target as Node)) {
			details.open = false;
		}
	}
</script>

<svelte:window onclick={closeOnOutsideClick} />

<details class="options" bind:this={details}>
	<summary>⚙ Optionen</summary>
	<div class="panel">
		<span class="row-label">Stil</span>
		<Toggle
			label="Kartenstil"
			options={STYLE_OPTIONS}
			selected={prefs.cardStyle}
			onselect={setCardStyle}
		/>
		<span class="row-label">Werte</span>
		<Toggle
			label="Wertebeschriftung"
			options={STAT_LABEL_OPTIONS}
			selected={prefs.statLabelMode}
			onselect={setStatLabelMode}
		/>
		<span class="row-label">Farben</span>
		<Toggle
			label="Farbdarstellung"
			options={COLOR_OPTIONS}
			selected={prefs.colorMode}
			onselect={setColorMode}
		/>
		<span class="row-label">Bilder</span>
		<Toggle
			label="Kartenbilder"
			options={IMAGE_OPTIONS}
			selected={prefs.printImages}
			onselect={setPrintImages}
		/>
	</div>
</details>

<style>
	.options {
		position: relative;
	}

	summary {
		list-style: none;
		cursor: pointer;
		font-size: 0.95rem;
		color: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: var(--color-surface);
		padding: 0.4rem 1.1rem;
		user-select: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.options[open] summary,
	summary:hover {
		border-color: var(--color-gold);
		color: var(--color-ink);
	}

	.panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 0;
		z-index: 10;
		width: 19rem;
		box-sizing: border-box;
		display: grid;
		/* definite 1fr track so the pills' inner 1fr halves resolve to a true 50/50 split */
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0.5rem 0.75rem;
		padding: 0.75rem 0.9rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
	}

	.panel > :global(.toggle) {
		width: 100%;
		box-sizing: border-box;
	}

	.row-label {
		font-size: 0.8rem;
		color: var(--color-muted);
	}
</style>
