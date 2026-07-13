<script lang="ts">
	import { STAT_LABEL_MODES, type StatLabelMode } from '$lib/domain/statLabelMode';
	import { prefs, setStatLabelMode } from '$lib/state/preferences.svelte';

	const LABELS: Record<StatLabelMode, string> = {
		icons: 'Symbole',
		text: 'Text'
	};
</script>

<div class="toggle" role="group" aria-label="Wertebeschriftung">
	{#each STAT_LABEL_MODES as mode (mode)}
		<button
			type="button"
			class:active={prefs.statLabelMode === mode}
			aria-pressed={prefs.statLabelMode === mode}
			onclick={() => {
				setStatLabelMode(mode);
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
