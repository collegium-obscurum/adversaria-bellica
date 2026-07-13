<script lang="ts">
	import { clampQs, clampTalentValue } from '$lib/domain/talentCalc';
	import type { MonsterCard, TalentKey } from '$lib/domain/types';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const TALENT_LABELS: Record<TalentKey, string> = {
		body: 'Körper',
		social: 'Gesellschaft',
		nature: 'Natur',
		knowledge: 'Wissen',
		craft: 'Handwerk'
	};

	const TALENT_ROWS: TalentKey[][] = [
		['body', 'social'],
		['nature', 'knowledge', 'craft']
	];
</script>

<div class="talents">
	{#each TALENT_ROWS as row (row[0])}
		<div class="talent-row">
			{#each row as key (key)}
				{@const talent = card.talents[key]}
				<div class="talent">
					<b>{TALENT_LABELS[key]}</b>
					{#if editable}
						<input
							type="number"
							min="1"
							max="99"
							bind:value={talent.value}
							onchange={() => (talent.value = clampTalentValue(talent.value))}
							title="Wert"
						/>
						(QS
						<input
							class="qs"
							type="number"
							min="1"
							max="6"
							bind:value={talent.maxQs}
							onchange={() => (talent.maxQs = clampQs(talent.maxQs))}
							title="max. QS"
						/>)
					{:else}
						{talent.value} (QS {talent.maxQs})
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.talents {
		display: flex;
		flex-direction: column;
		gap: 0.5mm;
		padding: 1mm 1.5mm;
		border: 0.3mm solid var(--line);
		border-radius: 1mm;
	}

	:global(.card.ornate) .talents {
		background: rgb(255 250 232 / 55%);
		border-color: #b99b5f;
	}

	.talent-row {
		display: flex;
		justify-content: center;
		gap: 2mm;
	}

	.talent {
		display: flex;
		align-items: center;
		gap: 0.5mm;
		white-space: nowrap;
	}

	.talent input {
		width: 4mm;
		padding: 0;
		text-align: center;
	}

	.talent input.qs {
		width: 3mm;
	}
</style>
