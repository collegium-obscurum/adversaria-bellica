<script lang="ts">
	import { STAT_BADGES, badgeLabel } from '$lib/domain/statBadges';
	import type { StatBadgeInfo, TextStatKey } from '$lib/domain/statBadges';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import { prefs } from '$lib/state/preferences.svelte';
	import type { MonsterCard } from '$lib/domain/types';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const lifePointsBadge = STAT_BADGES[0];
	const textBadges = STAT_BADGES.slice(1) as (StatBadgeInfo & { key: TextStatKey })[];

	// icon cut lines are drawn in the badge background colour
	const iconCutColor = $derived(prefs.cardStyle === 'ornate' ? '#7a1e12' : '#fff');

	function valueFontSize(value: string | number): string {
		const length = String(value).length;
		if (length <= 2) return '9pt';
		if (length <= 4) return '7pt';
		return '5.5pt';
	}

	function labelFontSize(label: string): string {
		return label.length > 4 ? '3.8pt' : '5pt';
	}

	function clampLifePoints() {
		if (!Number.isFinite(card.lifePoints) || card.lifePoints < 1) card.lifePoints = 1;
	}
</script>

<aside class="badges">
	<div class="badge" title="{lifePointsBadge.label} ({lifePointsBadge.abbr})">
		{#if prefs.statLabelMode === 'icons'}
			<span class="badge-icon"><StatIcon name={lifePointsBadge.key} cutColor={iconCutColor} /></span
			>
		{:else}
			<span class="badge-label" style:font-size={labelFontSize(badgeLabel(lifePointsBadge))}
				>{badgeLabel(lifePointsBadge)}</span
			>
		{/if}
		{#if editable}
			<input
				type="number"
				min="1"
				bind:value={card.lifePoints}
				onblur={clampLifePoints}
				style:font-size={valueFontSize(card.lifePoints)}
			/>
		{:else}
			<span class="badge-value" style:font-size={valueFontSize(card.lifePoints)}
				>{card.lifePoints}</span
			>
		{/if}
	</div>
	{#each textBadges as badge (badge.key)}
		{#if editable || card[badge.key].trim() !== ''}
			<div class="badge" title="{badge.label} ({badge.abbr})">
				{#if prefs.statLabelMode === 'icons'}
					<span class="badge-icon"><StatIcon name={badge.key} cutColor={iconCutColor} /></span>
				{:else}
					<span class="badge-label" style:font-size={labelFontSize(badgeLabel(badge))}
						>{badgeLabel(badge)}</span
					>
				{/if}
				{#if editable}
					<input
						type="text"
						bind:value={card[badge.key]}
						style:font-size={valueFontSize(card[badge.key])}
					/>
				{:else}
					<span class="badge-value" style:font-size={valueFontSize(card[badge.key])}
						>{card[badge.key]}</span
					>
				{/if}
			</div>
		{/if}
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

	.badge-label {
		line-height: 1;
		letter-spacing: 0.02em;
	}

	.badge-value {
		font-weight: bold;
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
