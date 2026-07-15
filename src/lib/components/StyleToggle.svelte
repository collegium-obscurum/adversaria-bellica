<script lang="ts">
	import { CARD_STYLES, type CardStyle } from '$lib/domain/cardStyle';
	import { prefs, setCardStyle } from '$lib/state/preferences.svelte';

	const LABELS: Record<CardStyle, string> = {
		minimal: 'Druckfreundlich',
		ornate: 'Aventurisch'
	};
</script>

<div class="toggle" role="group" aria-label="Kartenstil">
	{#each CARD_STYLES as style (style)}
		<button
			type="button"
			class:active={prefs.cardStyle === style}
			aria-pressed={prefs.cardStyle === style}
			onclick={() => {
				setCardStyle(style);
			}}
		>
			{LABELS[style]}
		</button>
	{/each}
</div>

<style>
	.toggle {
		display: inline-grid;
		grid-template-columns: 1fr 1fr;
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
		text-align: center;
	}

	button.active {
		background: var(--color-brand);
		color: var(--color-cream);
	}
</style>
