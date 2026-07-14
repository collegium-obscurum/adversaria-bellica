<script lang="ts">
	import {
		clampQs,
		clampTalentValue,
		effectiveTalent,
		TALENT_LABELS
	} from '$lib/domain/talentCalc';
	import type { MonsterCard, TalentKey } from '$lib/domain/types';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const TALENT_ROWS: TalentKey[][] = [
		['body', 'social'],
		['nature', 'knowledge', 'craft']
	];

	function setValueOverride(key: TalentKey, input: HTMLInputElement) {
		const talent = card.talents[key];
		talent.valueOverride = input.value === '' ? null : clampTalentValue(Number(input.value));
		input.value = String(effectiveTalent(card.attributes, talent, key).value);
	}

	function setMaxQsOverride(key: TalentKey, input: HTMLInputElement) {
		const talent = card.talents[key];
		talent.maxQsOverride = input.value === '' ? null : clampQs(Number(input.value));
		input.value = String(effectiveTalent(card.attributes, talent, key).maxQs);
	}
</script>

<div class="talents">
	{#each TALENT_ROWS as row (row[0])}
		<div class="talent-row">
			{#each row as key (key)}
				{@const talent = card.talents[key]}
				{@const shown = effectiveTalent(card.attributes, talent, key)}
				<div class="talent">
					<b>{TALENT_LABELS[key]}</b>
					{#if editable}
						<input
							type="number"
							min="1"
							max="99"
							class:overridden={talent.valueOverride !== null}
							value={shown.value}
							onchange={(event) => {
								setValueOverride(key, event.currentTarget);
							}}
							title="Wert (leeren = berechnet)"
						/>
						(QS
						<input
							class="qs"
							class:overridden={talent.maxQsOverride !== null}
							type="number"
							min="1"
							max="6"
							value={shown.maxQs}
							onchange={(event) => {
								setMaxQsOverride(key, event.currentTarget);
							}}
							title="max. QS (leeren = berechnet)"
						/>)
					{:else}
						{shown.value} (QS {shown.maxQs})
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

	.talent input.overridden {
		font-weight: bold;
		text-decoration: underline dotted;
	}
</style>
