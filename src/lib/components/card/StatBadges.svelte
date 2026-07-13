<script lang="ts">
	import { STAT_BADGES } from '$lib/domain/statBadges';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import type { MonsterCard } from '$lib/domain/types';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();
</script>

<aside class="badges">
	{#each STAT_BADGES as badge (badge.key)}
		<div class="badge" title="{badge.label} ({badge.abbr})">
			<span class="badge-icon"><StatIcon name={badge.key} /></span>
			{#if editable}
				<input type="number" bind:value={card[badge.key]} />
			{:else}
				<span class="badge-value">{card[badge.key]}</span>
			{/if}
		</div>
	{/each}
</aside>

<style>
	.badges {
		display: flex;
		flex-direction: column;
		gap: 1.5mm;
		flex-shrink: 0;
	}

	.badge {
		width: 10mm;
		height: 10mm;
		border: 0.4mm solid var(--line);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #fff;
	}

	:global(.card.ornate) .badge {
		--icon-cut: #7a1e12;
		background: radial-gradient(circle at 35% 30%, #a33a2a 0%, #7a1e12 60%, #57120a 100%);
		border-color: #4a0e07;
		color: #f2e8d0;
		box-shadow: 0 0 0 0.3mm #a5813c;
	}

	.badge-icon {
		width: 3.2mm;
		height: 3.2mm;
		display: block;
		line-height: 0;
	}

	.badge-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.badge-value {
		font-weight: bold;
		font-size: 9pt;
		line-height: 1.1;
	}

	.badge input {
		width: 8mm;
		border: none;
		background: transparent;
		text-align: center;
		color: inherit;
		font: inherit;
		font-weight: bold;
		font-size: 9pt;
		padding: 0;
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.badge input::-webkit-inner-spin-button,
	.badge input::-webkit-outer-spin-button {
		appearance: none;
		margin: 0;
	}

	/* wax seals hold light text; the default bright focus box would swallow it */
	:global(.card.ornate.editable) .badge input:focus {
		background: rgb(0 0 0 / 25%);
		border-color: #f2e8d0;
	}
</style>
