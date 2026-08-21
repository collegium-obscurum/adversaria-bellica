<script lang="ts">
	import {
		actionRanges,
		addAction,
		D20_FACES,
		moveAction,
		rangeLabel,
		setRangeEnd,
		setRangeStart
	} from '$lib/domain/actions';
	import { ENTRY_COLOR_LABELS } from '$lib/domain/entryColor';
	import type { MonsterCard } from '$lib/domain/types';
	import { prefs } from '$lib/state/preferences.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import SwordIcon from './SwordIcon.svelte';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const ranges = $derived(actionRanges(card.actions));

	function removeAction(index: number) {
		card.actions.splice(index, 1);
	}
</script>

<div class="actions">
	<h3>Aktionen (1w20)</h3>
	<p class="note">
		Erschwernisse (Schmerz, Zustände) erhöhen das Wurfergebnis. Eine 1 bleibt eine 1. Ist eine
		Aktion nicht möglich, gilt die nächste darunter.
	</p>
	<!-- own grid so only the rows size the columns, not the heading or the note -->
	<!-- marker widths below, so the hanging indent matches what the row actually renders -->
	<div
		class="rows"
		class:editor={editable}
		style:--entry-hang={prefs.colorMode === 'dot' ? '1.85em' : '1.05em'}
	>
		{#each card.actions as action, index (action)}
			{#if editable}
				<div class="entry-row">
					<span class="movers">
						<button
							type="button"
							class="move"
							disabled={index === 0}
							title="Nach oben"
							aria-label="Nach oben{action.name ? `: ${action.name}` : ''}"
							onclick={() => {
								moveAction(card.actions, index, index - 1);
							}}>▲</button
						>
						<button
							type="button"
							class="move"
							disabled={index === card.actions.length - 1}
							title="Nach unten"
							aria-label="Nach unten{action.name ? `: ${action.name}` : ''}"
							onclick={() => {
								moveAction(card.actions, index, index + 1);
							}}>▼</button
						>
					</span>
					<ColorPicker bind:color={action.color} />
					<button
						type="button"
						class="sword-toggle"
						class:on={action.opportunityAttack}
						style:color={action.color ? `var(--tint-${action.color})` : null}
						aria-pressed={action.opportunityAttack}
						title="Passierschlag"
						aria-label="Passierschlag{action.name ? `: ${action.name}` : ''}"
						onclick={() => {
							action.opportunityAttack = !action.opportunityAttack;
						}}><SwordIcon /></button
					>
					<span class="range">
						{#if index === 0}<span class="bound start">1</span>{:else}<input
								class="bound start"
								type="number"
								min={ranges[index - 1].from + 1}
								max={ranges[index].to}
								value={ranges[index].from}
								onchange={(event) => {
									setRangeStart(card.actions, index, Number(event.currentTarget.value));
								}}
								title="Bereichsanfang"
								aria-label="Bereichsanfang"
							/>{/if}&nbsp;–&nbsp;{#if index === card.actions.length - 1}<span class="bound end"
								>{D20_FACES}+</span
							>{:else}<input
								class="bound end"
								type="number"
								min={ranges[index].from}
								max={D20_FACES - (card.actions.length - 1 - index)}
								value={ranges[index].to}
								onchange={(event) => {
									setRangeEnd(card.actions, index, Number(event.currentTarget.value));
								}}
								title="Bereichsende"
								aria-label="Bereichsende"
							/>{/if} =
					</span>
					<textarea
						class="entry-name"
						bind:value={action.name}
						placeholder="Name"
						aria-label="Name der Aktion"></textarea>
					<textarea
						class="entry-effect"
						bind:value={action.effect}
						placeholder="Effekt, z.B. 1W6+4 TP"
						aria-label="Effekt der Aktion"></textarea>
					<button
						type="button"
						class="remove"
						onclick={() => {
							removeAction(index);
						}}
						disabled={card.actions.length <= 1}
						title={card.actions.length <= 1
							? 'Die letzte Aktion kann nicht entfernt werden'
							: 'Aktion entfernen'}
						aria-label="Aktion entfernen{action.name ? `: ${action.name}` : ''}">✕</button
					>
				</div>
			{:else}
				<p class="entry">
					{#if prefs.colorMode === 'dot'}{#if action.color}<span
								class="color-dot tint-{action.color}"
								role="img"
								aria-label={ENTRY_COLOR_LABELS[action.color]}
								title={ENTRY_COLOR_LABELS[action.color]}
							></span>{:else}<span class="color-dot blank"
							></span>{/if}{/if}{#if action.opportunityAttack}<span
							class="sword {action.color ? `tint-${action.color}` : ''}"
							role="img"
							aria-label="Passierschlag"
							title="Passierschlag"><SwordIcon /></span
						>{:else}<span class="sword"></span>{/if}<b
						class={action.color && prefs.colorMode === 'text' ? `tint-${action.color}` : ''}
						title={action.color && prefs.colorMode === 'text'
							? ENTRY_COLOR_LABELS[action.color]
							: undefined}
						>{rangeLabel(ranges[index], index === card.actions.length - 1)} = {action.name}</b
					>{#if action.effect}:
						{action.effect}{/if}
				</p>
			{/if}
		{/each}
	</div>
	{#if editable}
		<button
			type="button"
			class="add"
			onclick={() => {
				addAction(card.actions);
			}}
			disabled={card.actions.length >= D20_FACES}
			title={card.actions.length >= D20_FACES ? `Maximal ${D20_FACES} Aktionen` : undefined}
			>+ Aktion</button
		>
	{/if}
	{#if !card.stats.speed.hidden}
		<p class="note">
			Bewegung (GS) einmal pro Runde zusätzlich zu den Aktionen, oder eine Aktion für doppelte
			Distanz.
		</p>
	{/if}
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.333em;
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.333em;
	}

	/* movers, color, sword, range, name, effect, remove.
	   The name still sizes to its text, but capped, and the effect takes what is left over:
	   an unbounded content-sized track blows the row past the card edge on long entries. */
	.rows.editor {
		display: grid;
		grid-template-columns:
			max-content max-content max-content max-content fit-content(30mm) minmax(0, 1fr)
			max-content;
		align-items: center;
		gap: 0.333em 1mm;
	}

	/* subgrid, not display: contents: each row stays one box, so a row that renders a
	   different number of cells can't shift every following row into the wrong column */
	:global(.card.editable) .rows.editor > .entry-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		align-items: center;
	}

	.range .bound {
		width: 6mm;
		box-sizing: border-box;
		padding: 0;
		font-weight: bold;
		display: inline-block;
	}

	/* two digits at most, so it stays narrower than the end bound ("20+") and the
	   right-aligned number keeps close to the sword next to it */
	.range .start {
		width: 5.2mm;
		text-align: right;
	}

	.range .end {
		text-align: left;
	}

	.sword-toggle {
		position: relative;
		width: 3.2mm;
		height: 3.2mm;
		padding: 0;
		border: none;
		background: none;
		color: var(--color-muted);
		opacity: 0.4;
		line-height: 0;
		cursor: pointer;
	}

	.sword-toggle.on {
		color: inherit;
		opacity: 1;
	}

	/* invisible hit-area extension to roughly 24px without changing the visual size */
	.sword-toggle::after {
		content: '';
		position: absolute;
		inset: -1.6mm;
	}

	/* colorless rows keep the dot's space so the ranges line up under each other */
	.entry .color-dot.blank {
		background: none;
	}

	/* fixed gap instead of a space: --entry-hang above has to know the marker width */
	.entry .color-dot,
	.entry .sword {
		margin-right: 0.25em;
	}

	/* print marker; sized off the text so it rides the line like the color dot.
	   Unmarked rows render the empty span, so every row indents the same */
	.entry .sword {
		display: inline-block;
		width: 0.8em;
		height: 0.8em;
		vertical-align: -0.06em;
		line-height: 0;
	}

	/* the wrapper sizes the icon, like the stat badges do: html-to-image keeps the
	   parent's rule but drops class-scoped styling that sits on the svg itself */
	.sword-toggle :global(svg),
	.entry .sword :global(svg) {
		width: 100%;
		height: 100%;
	}

	.actions .add {
		margin-left: var(--block-indent);
	}

	.note {
		margin: 0;
		font-size: 0.824em;
		font-style: italic;
		color: var(--color-muted);
	}
</style>
