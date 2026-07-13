<script lang="ts">
	import type { StatKey } from '$lib/domain/statBadges';
	import { statIconMarkup } from '$lib/domain/statIcons';

	let { name, cutColor = '#fff' }: { name: StatKey; cutColor?: string } = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static string table in statIcons.ts, no user input -->
	{@html statIconMarkup(name, cutColor)}
</svg>
