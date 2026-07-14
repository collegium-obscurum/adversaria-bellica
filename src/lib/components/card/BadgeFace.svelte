<script lang="ts">
	import { badgeLabel } from '$lib/domain/statBadges';
	import type { StatBadgeInfo } from '$lib/domain/statBadges';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import { prefs } from '$lib/state/preferences.svelte';

	let { badge, cutColor }: { badge: StatBadgeInfo; cutColor: string } = $props();

	function labelFontSize(label: string): string {
		return label.length > 4 ? '3.8pt' : '5pt';
	}
</script>

{#if prefs.statLabelMode === 'icons'}
	<span class="badge-icon"><StatIcon name={badge.key} {cutColor} /></span>
{:else}
	<span class="badge-label" style:font-size={labelFontSize(badgeLabel(badge))}
		>{badgeLabel(badge)}</span
	>
{/if}

<style>
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
</style>
