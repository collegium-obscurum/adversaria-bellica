<script lang="ts">
	import { ENTRY_COLOR_LABELS } from '$lib/domain/entryColor';
	import type { MonsterCard, MoveRow } from '$lib/domain/types';
	import { TRIGGER_LABELS } from '$lib/domain/wounds';
	import { prefs } from '$lib/state/preferences.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import EyeOffIcon from './EyeOffIcon.svelte';

	let { card = $bindable(), editable = false }: { card: MonsterCard; editable?: boolean } =
		$props();

	function rowLabel(row: MoveRow): string {
		return row.trigger === null ? row.label : TRIGGER_LABELS[row.trigger];
	}

	// the pain numbers live in the wound row; without it "ab Schmerz 2" refers to nothing
	function available(row: MoveRow): boolean {
		if (!card.wounds.hidden) return true;
		return row.trigger === null || row.trigger === 'combatStart' || row.trigger === 'death';
	}

	// the index travels with the row: the arrows reorder inside the full list
	const rowEntries = $derived(
		card.specialMoves.rows
			.map((row, index) => ({ row, index }))
			.filter((entry) => available(entry.row))
	);
	const visibleRows = $derived(rowEntries.filter((entry) => !entry.row.hidden));
	const hiddenRows = $derived(rowEntries.filter((entry) => entry.row.hidden));
	// hiding keeps the values; a shown but still empty row prints nothing
	const printedRows = $derived(
		visibleRows.filter((entry) => entry.row.name.trim() !== '' || entry.row.effect.trim() !== '')
	);

	/** Swap two rows of the full list, addressed by their place in the visible list. */
	function moveRow(position: number, offset: number) {
		const from = visibleRows[position].index;
		const to = visibleRows[position + offset].index;
		const rows = card.specialMoves.rows;
		[rows[from], rows[to]] = [rows[to], rows[from]];
	}

	let focusRowIndex = $state<number | null>(null);

	function addCustomRow() {
		card.specialMoves.rows.push({
			trigger: null,
			label: '',
			name: '',
			effect: '',
			color: null,
			hidden: false
		});
		focusRowIndex = card.specialMoves.rows.length - 1;
	}

	function removeRow(index: number) {
		// fixed triggers keep their values for when they come back; free rows are gone
		if (card.specialMoves.rows[index].trigger === null) {
			card.specialMoves.rows.splice(index, 1);
		} else {
			card.specialMoves.rows[index].hidden = true;
		}
	}
</script>

{#if card.specialMoves.hidden}
	{#if editable}
		<button
			type="button"
			class="add add-section"
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
			}}><EyeOffIcon /></button
		>
		<!-- own grid so only the rows size the columns, not the heading or the add buttons -->
		<div class="rows">
			{#each visibleRows as entry, position (entry.row)}
				{@const label = rowLabel(entry.row)}
				<div class="entry-row">
					<span class="movers">
						<button
							type="button"
							class="move"
							disabled={position === 0}
							title="Nach oben"
							aria-label="Nach oben{label ? `: ${label}` : ''}"
							onclick={() => {
								moveRow(position, -1);
							}}>▲</button
						>
						<button
							type="button"
							class="move"
							disabled={position === visibleRows.length - 1}
							title="Nach unten"
							aria-label="Nach unten{label ? `: ${label}` : ''}"
							onclick={() => {
								moveRow(position, 1);
							}}>▼</button
						>
					</span>
					<ColorPicker bind:color={card.specialMoves.rows[entry.index].color} />
					<span class="range">
						{#if entry.row.trigger === null}<textarea
								class="trigger-input"
								bind:value={card.specialMoves.rows[entry.index].label}
								placeholder="Auslöser"
								aria-label="Auslöser"
								{@attach (node: HTMLTextAreaElement) => {
									if (entry.index === focusRowIndex) {
										node.focus();
										focusRowIndex = null;
									}
								}}></textarea>{:else}{label}{/if} =
					</span>
					<textarea
						class="entry-name"
						bind:value={card.specialMoves.rows[entry.index].name}
						placeholder="Name"
						aria-label={label ? `Name für ${label}` : 'Name'}></textarea>
					<textarea
						class="entry-effect"
						bind:value={card.specialMoves.rows[entry.index].effect}
						placeholder="Effekt"
						aria-label={label ? `Effekt für ${label}` : 'Effekt'}></textarea>
					<button
						type="button"
						class="remove"
						onclick={() => {
							removeRow(entry.index);
						}}
						title={entry.row.trigger === null ? 'Entfernen' : 'Ausblenden (Werte bleiben erhalten)'}
						aria-label="Spezialmanöver entfernen{label ? `: ${label}` : ''}">✕</button
					>
				</div>
			{/each}
		</div>
		<div class="add-triggers">
			{#each hiddenRows as entry (entry.row)}
				<button
					type="button"
					class="add"
					onclick={() => {
						card.specialMoves.rows[entry.index].hidden = false;
					}}>+ {rowLabel(entry.row)}</button
				>
			{/each}
			<button type="button" class="add" onclick={addCustomRow}>+ Eigener Auslöser</button>
		</div>
	</div>
{:else if printedRows.length > 0}
	<div class="special-moves">
		<h3>Spezialmanöver</h3>
		{#each printedRows as entry (entry.row)}
			{@const move = entry.row}
			{@const label = rowLabel(move)}
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
						: undefined}>{label}{move.name ? ` = ${move.name}` : ''}</b
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

	.special-moves.editor {
		position: relative;
	}

	/* movers, color, trigger, name, effect, remove; widths follow this table's own content.
	   The action table repeats the outer three tracks, so those stay in line. */
	.rows {
		display: grid;
		grid-template-columns: max-content max-content max-content auto auto max-content;
		align-items: center;
		gap: 0.333em 1mm;
	}

	/* the cells are the grid items, so the name and effect columns can size to their text;
	   the .card prefix outranks CardPreview's generic .entry-row flex row */
	:global(.card.editable) .rows > .entry-row {
		display: contents;
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
