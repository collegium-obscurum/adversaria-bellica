<script lang="ts">
	import type { MonsterCard, WoundTrigger } from '$lib/domain/types';
	import { WOUND_TRIGGERS } from '$lib/domain/types';
	import { triggerLabels } from '$lib/domain/wounds';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const labels = $derived(triggerLabels(card.lifePoints));

	let addedTriggers = $state<WoundTrigger[]>([]);

	const visibleTriggers = $derived(
		WOUND_TRIGGERS.filter((trigger) => {
			const move = card.specialMoves[trigger];
			return (
				move.name.trim() !== '' || move.effect.trim() !== '' || addedTriggers.includes(trigger)
			);
		})
	);
	const hiddenTriggers = $derived(WOUND_TRIGGERS.filter((t) => !visibleTriggers.includes(t)));

	function addTrigger(trigger: WoundTrigger) {
		addedTriggers.push(trigger);
	}

	function removeTrigger(trigger: WoundTrigger) {
		card.specialMoves[trigger] = { name: '', effect: '' };
		addedTriggers = addedTriggers.filter((t) => t !== trigger);
	}

	const visibleCustomMoves = $derived(
		card.customMoves.filter((move) => move.name.trim() !== '' || move.effect.trim() !== '')
	);
	let focusCustomIndex = $state<number | null>(null);

	function addCustomMove() {
		card.customMoves.push({ trigger: '', name: '', effect: '' });
		focusCustomIndex = card.customMoves.length - 1;
	}

	function removeCustomMove(index: number) {
		card.customMoves.splice(index, 1);
	}
</script>

{#if editable}
	<div class="special-moves">
		<h3>Spezialmanöver</h3>
		{#each visibleTriggers as trigger (trigger)}
			<div class="entry-row">
				<span class="range">{labels[trigger]} =</span>
				<input class="entry-name" bind:value={card.specialMoves[trigger].name} placeholder="Name" />
				<textarea
					class="entry-effect"
					bind:value={card.specialMoves[trigger].effect}
					placeholder="Effekt"></textarea>
				<button
					type="button"
					class="remove"
					onclick={() => {
						removeTrigger(trigger);
					}}
					title="Entfernen">✕</button
				>
			</div>
		{/each}
		{#each card.customMoves as move, index (move)}
			<div class="entry-row">
				<span class="range">
					<input
						class="trigger-input"
						bind:value={move.trigger}
						placeholder="Auslöser"
						{@attach (node: HTMLInputElement) => {
							if (index === focusCustomIndex) {
								node.focus();
								focusCustomIndex = null;
							}
						}}
					/> =</span
				>
				<input class="entry-name" bind:value={move.name} placeholder="Name" />
				<textarea class="entry-effect" bind:value={move.effect} placeholder="Effekt"></textarea>
				<button
					type="button"
					class="remove"
					onclick={() => {
						removeCustomMove(index);
					}}
					title="Entfernen">✕</button
				>
			</div>
		{/each}
		<div class="add-triggers">
			{#each hiddenTriggers as trigger (trigger)}
				<button
					type="button"
					class="add"
					onclick={() => {
						addTrigger(trigger);
					}}>+ {labels[trigger]}</button
				>
			{/each}
			<button type="button" class="add" onclick={addCustomMove}>+ Eigener Auslöser</button>
		</div>
	</div>
{:else if visibleTriggers.length > 0 || visibleCustomMoves.length > 0}
	<div class="special-moves">
		<h3>Spezialmanöver</h3>
		{#each visibleTriggers as trigger (trigger)}
			{@const move = card.specialMoves[trigger]}
			<p class="entry">
				<b>{labels[trigger]}{move.name ? ` = ${move.name}` : ''}</b>{#if move.effect}:
					{move.effect}{/if}
			</p>
		{/each}
		{#each visibleCustomMoves as move (move)}
			<p class="entry">
				<b>{move.trigger}{move.name ? ` = ${move.name}` : ''}</b>{#if move.effect}:
					{move.effect}{/if}
			</p>
		{/each}
	</div>
{/if}

<style>
	.special-moves {
		display: flex;
		flex-direction: column;
		gap: 0.333em;
	}

	.special-moves .range {
		width: 24mm;
		justify-content: flex-end;
	}

	.trigger-input {
		width: 20mm;
		font-weight: bold;
		text-align: right;
	}

	.add-triggers {
		display: flex;
		flex-wrap: wrap;
		gap: 1mm;
	}
</style>
