<script lang="ts">
	import type { MonsterCard } from '$lib/domain/types';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const TALENT_LABELS = {
		body: 'Körper',
		social: 'Gesellschaft',
		nature: 'Natur',
		knowledge: 'Wissen',
		craft: 'Handwerk'
	} as const;
</script>

<div class="talents">
	{#each Object.entries(TALENT_LABELS) as [key, label] (key)}
		{@const talent = card.talents[key as keyof typeof TALENT_LABELS]}
		<div class="talent">
			<b>{label}</b>
			{#if editable}
				<input type="number" min="1" max="20" bind:value={talent.value} title="Wert" />
				(QS <input type="number" min="1" max="6" bind:value={talent.maxQs} title="max. QS" />)
			{:else}
				{talent.value} (QS {talent.maxQs})
			{/if}
		</div>
	{/each}
</div>

<style>
	.talents {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5mm 2mm;
		padding: 1mm 1.5mm;
		border: 0.3mm solid var(--line);
		border-radius: 1mm;
	}

	:global(.card.ornate) .talents {
		background: rgb(255 250 232 / 55%);
		border-color: #b99b5f;
	}

	.talent {
		display: flex;
		align-items: center;
		gap: 0.5mm;
	}

	.talent input {
		width: 5mm;
		padding: 0;
		text-align: center;
	}
</style>
