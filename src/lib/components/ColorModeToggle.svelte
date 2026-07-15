<script lang="ts">
	import { COLOR_MODES, type ColorMode } from '$lib/domain/colorMode';
	import { prefs, setColorMode } from '$lib/state/preferences.svelte';

	const LABELS: Record<ColorMode, string> = {
		text: 'Farbtext',
		dot: 'Farbpunkt'
	};
</script>

<div class="toggle" role="group" aria-label="Farbdarstellung">
	{#each COLOR_MODES as mode (mode)}
		<button
			type="button"
			class:active={prefs.colorMode === mode}
			aria-pressed={prefs.colorMode === mode}
			onclick={() => {
				setColorMode(mode);
			}}
		>
			{LABELS[mode]}
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
		font-size: 0.8rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--color-muted);
		padding: 0.25rem 0.6rem;
		cursor: pointer;
	}

	button.active {
		background: var(--color-brand);
		color: var(--color-cream);
	}
</style>
