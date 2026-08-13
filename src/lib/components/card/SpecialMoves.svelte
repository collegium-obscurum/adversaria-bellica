<script lang="ts">
	import { ENTRY_COLOR_LABELS } from '$lib/domain/entryColor';
	import type { MonsterCard, WoundTrigger } from '$lib/domain/types';
	import { WOUND_TRIGGERS } from '$lib/domain/types';
	import { triggerLabels } from '$lib/domain/wounds';
	import { prefs } from '$lib/state/preferences.svelte';
	import ColorPicker from './ColorPicker.svelte';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const labels = $derived(triggerLabels(card.stats.lifePoints.value));

	// without HP there are no wound thresholds; only Kampfbeginn remains meaningful
	const availableTriggers = $derived(
		card.stats.lifePoints.value === null
			? WOUND_TRIGGERS.filter((t) => t === 'combatStart')
			: WOUND_TRIGGERS
	);
	const visibleTriggers = $derived(
		availableTriggers.filter((trigger) => !card.specialMoves.triggers[trigger].hidden)
	);
	const hiddenTriggers = $derived(
		availableTriggers.filter((trigger) => card.specialMoves.triggers[trigger].hidden)
	);
	// hidden keeps the values; an added but still empty row prints nothing
	const printedTriggers = $derived(
		visibleTriggers.filter((trigger) => {
			const move = card.specialMoves.triggers[trigger];
			return move.name.trim() !== '' || move.effect.trim() !== '';
		})
	);

	function setTriggerHidden(trigger: WoundTrigger, hidden: boolean) {
		card.specialMoves.triggers[trigger].hidden = hidden;
	}

	const visibleCustomMoves = $derived(
		card.specialMoves.custom.filter((move) => move.name.trim() !== '' || move.effect.trim() !== '')
	);
	let focusCustomIndex = $state<number | null>(null);

	function addCustomMove() {
		card.specialMoves.custom.push({ trigger: '', name: '', effect: '', color: null });
		focusCustomIndex = card.specialMoves.custom.length - 1;
	}

	function removeCustomMove(index: number) {
		card.specialMoves.custom.splice(index, 1);
	}
</script>

{#if card.specialMoves.hidden}
	{#if editable}
		<button
			type="button"
			class="add"
			onclick={() => {
				card.specialMoves.hidden = false;
			}}>+ Spezialmanöver</button
		>
	{/if}
{:else if editable}
	<div class="special-moves editor">
		<h3>Spezialmanöver</h3>
		<button
			type="button"
			class="remove hide-toggle"
			title="Spezialmanöver ausblenden (Werte bleiben erhalten)"
			aria-label="Spezialmanöver ausblenden"
			onclick={() => {
				card.specialMoves.hidden = true;
			}}>✕</button
		>
		{#each visibleTriggers as trigger (trigger)}
			<div class="entry-row">
				<ColorPicker bind:color={card.specialMoves.triggers[trigger].color} />
				<span class="range">{labels[trigger]} =</span>
				<textarea
					class="entry-name"
					bind:value={card.specialMoves.triggers[trigger].name}
					placeholder="Name"
					aria-label="Name für {labels[trigger]}"></textarea>
				<textarea
					class="entry-effect"
					bind:value={card.specialMoves.triggers[trigger].effect}
					placeholder="Effekt"
					aria-label="Effekt für {labels[trigger]}"></textarea>
				<button
					type="button"
					class="remove"
					onclick={() => {
						setTriggerHidden(trigger, true);
					}}
					title="Ausblenden (Werte bleiben erhalten)"
					aria-label="Spezialmanöver entfernen: {labels[trigger]}">✕</button
				>
			</div>
		{/each}
		{#each card.specialMoves.custom as move, index (move)}
			<div class="entry-row">
				<ColorPicker bind:color={move.color} />
				<span class="range">
					<textarea
						class="trigger-input"
						bind:value={move.trigger}
						placeholder="Auslöser"
						aria-label="Auslöser"
						{@attach (node: HTMLTextAreaElement) => {
							if (index === focusCustomIndex) {
								node.focus();
								focusCustomIndex = null;
							}
						}}></textarea> =</span
				>
				<textarea class="entry-name" bind:value={move.name} placeholder="Name" aria-label="Name"
				></textarea>
				<textarea
					class="entry-effect"
					bind:value={move.effect}
					placeholder="Effekt"
					aria-label="Effekt"></textarea>
				<button
					type="button"
					class="remove"
					onclick={() => {
						removeCustomMove(index);
					}}
					title="Entfernen"
					aria-label="Spezialmanöver entfernen{move.trigger ? `: ${move.trigger}` : ''}">✕</button
				>
			</div>
		{/each}
		<div class="add-triggers">
			{#each hiddenTriggers as trigger (trigger)}
				<button
					type="button"
					class="add"
					onclick={() => {
						setTriggerHidden(trigger, false);
					}}>+ {labels[trigger]}</button
				>
			{/each}
			<button type="button" class="add" onclick={addCustomMove}>+ Eigener Auslöser</button>
		</div>
	</div>
{:else if printedTriggers.length > 0 || visibleCustomMoves.length > 0}
	<div class="special-moves">
		<h3>Spezialmanöver</h3>
		{#each printedTriggers as trigger (trigger)}
			{@const move = card.specialMoves.triggers[trigger]}
			<p class="entry">
				{#if move.color && prefs.colorMode === 'dot'}<span
						class="color-dot tint-{move.color}"
						role="img"
						aria-label={ENTRY_COLOR_LABELS[move.color]}
						title={ENTRY_COLOR_LABELS[move.color]}
					></span>&nbsp;{/if}<b
					class={move.color && prefs.colorMode === 'text' ? `tint-${move.color}` : ''}
					title={move.color && prefs.colorMode === 'text'
						? ENTRY_COLOR_LABELS[move.color]
						: undefined}>{labels[trigger]}{move.name ? ` = ${move.name}` : ''}</b
				>{#if move.effect}:
					{move.effect}{/if}
			</p>
		{/each}
		{#each visibleCustomMoves as move (move)}
			<p class="entry">
				{#if move.color && prefs.colorMode === 'dot'}<span
						class="color-dot tint-{move.color}"
						role="img"
						aria-label={ENTRY_COLOR_LABELS[move.color]}
						title={ENTRY_COLOR_LABELS[move.color]}
					></span>&nbsp;{/if}<b
					class={move.color && prefs.colorMode === 'text' ? `tint-${move.color}` : ''}
					title={move.color && prefs.colorMode === 'text'
						? ENTRY_COLOR_LABELS[move.color]
						: undefined}>{move.trigger}{move.name ? ` = ${move.name}` : ''}</b
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
		position: relative;
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

	/* indented so these read as part of the section, not as the next block's add button */
	.add-triggers {
		display: flex;
		flex-wrap: wrap;
		gap: 1mm;
		padding-left: var(--block-indent);
	}
</style>
