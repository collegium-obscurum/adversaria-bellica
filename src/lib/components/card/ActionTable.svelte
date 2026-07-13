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
	import type { MonsterCard } from '$lib/domain/types';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	const ranges = $derived(actionRanges(card.actions));

	let dragIndex = $state<number | null>(null);

	function onDragStart(event: DragEvent, index: number) {
		dragIndex = index;
		event.dataTransfer?.setData('text/plain', String(index));
	}

	function onDrop(index: number) {
		if (dragIndex !== null) {
			moveAction(card.actions, dragIndex, index);
		}
		dragIndex = null;
	}

	function removeAction(index: number) {
		card.actions.splice(index, 1);
	}
</script>

<div class="actions">
	<h3>Aktionen (1w20)</h3>
	<p class="note">
		Erschwernisse (Schmerz, Zustände) erhöhen das Wurfergebnis. Eine 1 bleibt eine 1.
	</p>
	{#each card.actions as action, index (action)}
		{#if editable}
			<div
				class="entry-row"
				class:drop-target={dragIndex !== null && dragIndex !== index}
				role="listitem"
				ondragover={(event) => {
					event.preventDefault();
				}}
				ondrop={() => {
					onDrop(index);
				}}
			>
				<span
					class="handle"
					draggable="true"
					role="button"
					tabindex="-1"
					title="Ziehen zum Umsortieren"
					ondragstart={(event) => {
						onDragStart(event, index);
					}}
					ondragend={() => (dragIndex = null)}>⠿</span
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
						/>{/if} =
				</span>
				<input class="entry-name" bind:value={action.name} placeholder="Name" />
				<textarea
					class="entry-effect"
					bind:value={action.effect}
					placeholder="Effekt, z.B. 1W6+4 TP"></textarea>
				<button
					type="button"
					class="remove"
					onclick={() => {
						removeAction(index);
					}}
					disabled={card.actions.length <= 1}
					title="Zeile entfernen">✕</button
				>
			</div>
		{:else}
			<p class="entry">
				<b>{rangeLabel(ranges[index], index === card.actions.length - 1)} = {action.name}</b
				>{#if action.effect}:
					{action.effect}{/if}
			</p>
		{/if}
	{/each}
	{#if editable}
		<button
			type="button"
			class="add"
			onclick={() => {
				addAction(card.actions);
			}}
			disabled={card.actions.length >= D20_FACES}>+ Zeile</button
		>
	{/if}
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		gap: 1mm;
	}

	.entry-row.drop-target {
		outline: 0.3mm dashed #8a7d5c;
	}

	.handle {
		cursor: grab;
		color: #999;
		user-select: none;
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
		font-size: 7pt;
		font-style: italic;
		color: #6b6353;
	}
</style>
