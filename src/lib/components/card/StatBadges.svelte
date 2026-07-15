<script lang="ts">
	import { STAT_BADGES } from '$lib/domain/statBadges';
	import type { StatBadgeInfo, StatKey, TextStatKey } from '$lib/domain/statBadges';
	import BadgeFace from './BadgeFace.svelte';
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

	function normalizeLifePoints() {
		if (card.lifePoints !== null && (!Number.isFinite(card.lifePoints) || card.lifePoints < 1)) {
			card.lifePoints = null;
		}
	}

	function isHidden(key: StatKey): boolean {
		return card.hiddenStats.includes(key);
	}

	function toggleHidden(key: StatKey) {
		if (isHidden(key)) {
			card.hiddenStats = card.hiddenStats.filter((hiddenKey) => hiddenKey !== key);
		} else {
			card.hiddenStats = [...card.hiddenStats, key];
		}
	}

	function toggleTitle(key: StatKey): string {
		return isHidden(key)
			? 'Wird nicht gedruckt – klicken zum Einblenden'
			: 'Klicken zum Ausblenden';
	}
</script>

<aside class="badges">
	{#if editable || !isHidden('lifePoints')}
		<div
			class="badge"
			class:stat-hidden={editable && isHidden('lifePoints')}
			title="{lifePointsBadge.label} ({lifePointsBadge.abbr})"
		>
			{#if editable}
				<button
					type="button"
					class="badge-toggle"
					title={toggleTitle('lifePoints')}
					onclick={() => {
						toggleHidden('lifePoints');
					}}><BadgeFace badge={lifePointsBadge} cutColor={iconCutColor} /></button
				>
				<input
					type="number"
					min="1"
					bind:value={card.lifePoints}
					onblur={normalizeLifePoints}
					style:font-size={valueFontSize(card.lifePoints ?? '')}
				/>
			{:else}
				<BadgeFace badge={lifePointsBadge} cutColor={iconCutColor} />
				<span class="badge-value" style:font-size={valueFontSize(card.lifePoints ?? '')}
					>{card.lifePoints}</span
				>
			{/if}
		</div>
	{/if}
	{#each textBadges as badge (badge.key)}
		{#if editable || !isHidden(badge.key)}
			<div
				class="badge"
				class:stat-hidden={editable && isHidden(badge.key)}
				title="{badge.label} ({badge.abbr})"
			>
				{#if editable}
					<button
						type="button"
						class="badge-toggle"
						title={toggleTitle(badge.key)}
						onclick={() => {
							toggleHidden(badge.key);
						}}><BadgeFace {badge} cutColor={iconCutColor} /></button
					>
					<input
						type="text"
						bind:value={card[badge.key]}
						style:font-size={valueFontSize(card[badge.key])}
					/>
				{:else}
					<BadgeFace {badge} cutColor={iconCutColor} />
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
		background: radial-gradient(
			circle at 35% 30%,
			#a33a2a 0%,
			var(--color-brand) 60%,
			#57120a 100%
		);
		border-color: #4a0e07;
		color: var(--color-cream);
		box-shadow: 0 0 0 0.3mm var(--color-gold);
	}

	/* unstamped seal: hidden badges drop their fill and fade to a dashed sketch */
	.badge.stat-hidden,
	:global(.card.ornate) .badge.stat-hidden {
		background: transparent;
		border-style: dashed;
		box-shadow: none;
		color: inherit;
		opacity: 0.45;
		transition: opacity 120ms;
	}

	.badge.stat-hidden:hover {
		opacity: 0.7;
	}

	.badge-toggle {
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		line-height: 0;
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
		border-color: var(--color-cream);
	}
</style>
