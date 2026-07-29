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
					title={card.actions.length <= 1 ? 'Die letzte Aktion kann nicht entfernt werden' : 'Zeile entfernen'}
					aria-label="Aktion entfernen{action.name ? `: ${action.name}` : ''}">✕</button
				>
			</div>
		{:else}
			<p class="entry">
				{#if action.color && prefs.colorMode === 'dot'}<span
						class="color-dot tint-{action.color}"
						role="img"
						aria-label={ENTRY_COLOR_LABELS[action.color]}
						title={ENTRY_COLOR_LABELS[action.color]}></span>&nbsp;{/if}<b
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
	{#if !card.hiddenStats.includes('speed')}
		<p class="note">
			Bewegung (GS) einmal pro Runde zusätzlich zu den Aktionen, oder eine Aktion für doppelte
			Distanz.
		</p>
	{/if}
	{#if editable}
		<button
			type="button"
			class="add"
			onclick={() => {
				addAction(card.actions);
			}}
			disabled={card.actions.length >= D20_FACES}
			title={card.actions.length >= D20_FACES ? `Maximal ${D20_FACES} Zeilen` : undefined}
			>+ Zeile</button
		>
	{/if}
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.333em;
	}

	.movers {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.move {
		font: inherit;
		font-size: 5pt;
		line-height: 1.2;
		padding: 0 0.5mm;
		border: none;
		background: none;
		color: var(--color-muted);
		cursor: pointer;
	}

	.move:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.range .bound {
		width: 6mm;
		box-sizing: border-box;
		padding: 0;
		font-weight: bold;
		display: inline-block;
	}

	.range .start {
		text-align: right;
	}

	.range .end {
		text-align: left;
	}

	.note {
		margin: 0;
		font-size: 0.824em;
		font-style: italic;
		color: var(--color-muted);
	}
</style>
