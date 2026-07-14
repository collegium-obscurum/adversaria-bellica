<script lang="ts">
	import { prefs, setPrintImages } from '$lib/state/preferences.svelte';

	const OPTIONS = [
		{ value: true, label: 'Mit Bild' },
		{ value: false, label: 'Ohne Bild' }
	];
</script>

<div class="toggle" role="group" aria-label="Kartenbilder">
	{#each OPTIONS as option (option.label)}
		<button
			type="button"
			class:active={prefs.printImages === option.value}
			aria-pressed={prefs.printImages === option.value}
			onclick={() => {
				setPrintImages(option.value);
			}}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.toggle {
		display: inline-flex;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: var(--color-surface);
		padding: 2px;
	}

	button {
		font: inherit;
		font-size: 0.85rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--color-muted);
		padding: 0.25rem 0.9rem;
		cursor: pointer;
	}

	button.active {
		background: var(--color-brand);
		color: var(--color-cream);
	}
</style>
