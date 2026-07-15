<script lang="ts">
	import type { MonsterCard, WoundTrigger } from '$lib/domain/types';
	import { WOUND_TRIGGERS } from '$lib/domain/types';
	import { triggerLabels } from '$lib/domain/wounds';
	import { prefs } from '$lib/state/preferences.svelte';
	import ColorPicker from './ColorPicker.svelte';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const labels = $derived(triggerLabels(card.lifePoints));

	let addedTriggers = $state<WoundTrigger[]>([]);

	// without HP there are no wound thresholds; only Kampfbeginn remains meaningful
	const availableTriggers = $derived(
		card.lifePoints === null ? WOUND_TRIGGERS.filter((t) => t === 'combatStart') : WOUND_TRIGGERS
	);
	const visibleTriggers = $derived(
		availableTriggers.filter((trigger) => {
			const move = card.specialMoves[trigger];
			return (
				move.name.trim() !== '' || move.effect.trim() !== '' || addedTriggers.includes(trigger)
			);
		})
	);
	const hiddenTriggers = $derived(availableTriggers.filter((t) => !visibleTriggers.includes(t)));

	function addTrigger(trigger: WoundTrigger) {
		addedTriggers.push(trigger);
	}

	function removeTrigger(trigger: WoundTrigger) {
		card.specialMoves[trigger] = { name: '', effect: '', color: null };
		addedTriggers = addedTriggers.filter((t) => t !== trigger);
	}

	const visibleCustomMoves = $derived(
		card.customMoves.filter((move) => move.name.trim() !== '' || move.effect.trim() !== '')
	);
	let focusCustomIndex = $state<number | null>(null);

	function addCustomMove() {
		card.customMoves.push({ trigger: '', name: '', effect: '', color: null });
		focusCustomIndex = card.customMoves.length - 1;
	}

	function removeCustomMove(index: number) {
		card.customMoves.splice(index, 1);
	}
</script>

{#if editable}
	<div class="special-moves editor">
		<h3>Spezialmanöver</h3>
		{#each visibleTriggers as trigger (trigger)}
			<div class="entry-row">
				<ColorPicker bind:color={card.specialMoves[trigger].color} />
				<span class="range">{labels[trigger]} =</span>
				<textarea class="entry-name" bind:value={card.specialMoves[trigger].name} placeholder="Name"
				></textarea>
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
				<ColorPicker bind:color={move.color} />
				<span class="range">
					<textarea
						class="trigger-input"
						bind:value={move.trigger}
						placeholder="Auslöser"
						{@attach (node: HTMLTextAreaElement) => {
							if (index === focusCustomIndex) {
								node.focus();
								focusCustomIndex = null;
							}
						}}></textarea> =</span
				>
				<textarea class="entry-name" bind:value={move.name} placeholder="Name"></textarea>
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
				{#if move.color && prefs.colorMode === 'dot'}<span class="color-dot tint-{move.color}"
					></span>&nbsp;{/if}<b
					class={move.color && prefs.colorMode === 'text' ? `tint-${move.color}` : ''}
					>{labels[trigger]}{move.name ? ` = ${move.name}` : ''}</b
				>{#if move.effect}:
					{move.effect}{/if}
			</p>
		{/each}
		{#each visibleCustomMoves as move (move)}
			<p class="entry">
				{#if move.color && prefs.colorMode === 'dot'}<span class="color-dot tint-{move.color}"
					></span>&nbsp;{/if}<b
					class={move.color && prefs.colorMode === 'text' ? `tint-${move.color}` : ''}
					>{move.trigger}{move.name ? ` = ${move.name}` : ''}</b
				>{#if move.effect}:
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

	/* shared column tracks so trigger/name widths line up across rows */
	.special-moves.editor {
		display: grid;
		grid-template-columns: auto fit-content(30mm) 22mm 1fr auto;
		gap: 0.333em 1mm;
	}

	.special-moves.editor > h3,
	.special-moves.editor > .add-triggers {
		grid-column: 1 / -1;
	}

	.special-moves.editor > .entry-row {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
	}

	/* :global(.card) outranks CardPreview's `.card :global(.range)` nowrap;
	   left-aligned because right alignment reads oddly once the text wraps */
	:global(.card) .special-moves .range {
		justify-content: flex-start;
		text-align: left;
		white-space: normal;
	}

	/* .card.editable prefix outranks CardPreview's generic textarea width: 100% */
	:global(.card.editable) .trigger-input {
		width: 20mm;
		font-weight: bold;
	}

	.add-triggers {
		display: flex;
		flex-wrap: wrap;
		gap: 1mm;
	}
</style>
