<script lang="ts">
	import { CARD_STYLES, type CardStyle } from './cardStyle';
	import { prefs, setCardStyle } from './preferences.svelte';

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
