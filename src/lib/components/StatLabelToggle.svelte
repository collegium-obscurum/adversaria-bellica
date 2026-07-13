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
		border: 1px solid #c9c1b2;
		border-radius: 999px;
		background: #fff;
		padding: 2px;
	}

	button {
		font: inherit;
		font-size: 0.85rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: #6b6353;
		padding: 0.25rem 0.9rem;
		cursor: pointer;
	}

	button.active {
		background: #7a1e12;
		color: #f2e8d0;
	}
</style>
