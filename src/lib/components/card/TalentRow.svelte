<script lang="ts">
	import { clampQs, clampTalentValue, TALENT_LABELS } from '$lib/domain/talentCalc';
	import type { MonsterCard, TalentKey } from '$lib/domain/types';
	import EyeOffIcon from './EyeOffIcon.svelte';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const TALENT_ROWS: TalentKey[][] = [
		['body', 'social'],
		['nature', 'knowledge', 'craft']
	];

	function setValue(key: TalentKey, input: HTMLInputElement) {
		card.talents.entries[key].value = clampTalentValue(Number(input.value));
		input.value = String(card.talents.entries[key].value);
	}

	function setMaxQs(key: TalentKey, input: HTMLInputElement) {
		card.talents.entries[key].maxQs = clampQs(Number(input.value));
		input.value = String(card.talents.entries[key].maxQs);
	}
</script>

{#if card.talents.hidden}
	{#if editable}
		<button
			type="button"
			class="add talents-add"
			onclick={() => {
				card.talents.hidden = false;
			}}>+ Talente</button
		>
	{/if}
{:else}
	<div class="talents">
		{#if editable}
			<button
				type="button"
				class="remove hide-toggle"
				title="Talente ausblenden (Werte bleiben erhalten)"
				aria-label="Talente ausblenden"
				onclick={() => {
					card.talents.hidden = true;
				}}><EyeOffIcon /></button
			>
		{/if}
		{#each TALENT_ROWS as row (row[0])}
			<div class="talent-row">
				{#each row as key (key)}
					{@const talent = card.talents.entries[key]}
					<div class="talent">
						<b>{TALENT_LABELS[key]}</b>
						{#if editable}
							<input
								type="number"
								min="1"
								max="99"
								value={talent.value}
								onchange={(event) => {
									setValue(key, event.currentTarget);
								}}
								title="Wert"
								aria-label="{TALENT_LABELS[key]} Wert"
							/>
							(QS
							<input
								class="qs"
								type="number"
								min="1"
								max="6"
								value={talent.maxQs}
								onchange={(event) => {
									setMaxQs(key, event.currentTarget);
								}}
								title="max. QS"
								aria-label="{TALENT_LABELS[key]} max. QS"
							/>)
						{:else}
							{talent.value} (QS {talent.maxQs})
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.talents {
		--block-border: 0.3mm;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5mm;
		padding: 1mm 1.5mm;
		border: 0.3mm solid var(--line);
		border-radius: 1mm;
	}

	:global(.card.ornate) .talents {
		background: rgb(255 250 232 / 55%);
		border-color: var(--color-gold-soft);
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
