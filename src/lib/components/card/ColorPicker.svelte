<script lang="ts">
	import { ENTRY_COLORS, type EntryColor } from '$lib/domain/entryColor';

	let { color = $bindable() }: { color: EntryColor | null } = $props();

	const COLOR_LABELS: Record<EntryColor, string> = {
		red: 'Rot',
		orange: 'Orange',
		green: 'Grün',
		blue: 'Blau',
		purple: 'Violett',
		brown: 'Braun'
	};

	let open = $state(false);

	function pick(value: EntryColor | null) {
		color = value;
		open = false;
	}

	function closeOnFocusLoss(event: FocusEvent) {
		const picker = event.currentTarget as HTMLElement;
		if (!picker.contains(event.relatedTarget as Node)) {
			open = false;
		}
	}
</script>

<span class="picker" onfocusout={closeOnFocusLoss}>
	<button
		type="button"
		class="swatch current {color ? `tint-${color}` : ''}"
		class:none={color === null}
		title="Farbe wählen"
		onclick={() => (open = !open)}
	></button>
	{#if open}
		<span class="swatches">
			<button
				type="button"
				class="swatch none"
				class:selected={color === null}
				title="Keine Farbe"
				onclick={() => {
					pick(null);
				}}
			></button>
			{#each ENTRY_COLORS as value (value)}
				<button
					type="button"
					class="swatch tint-{value}"
					class:selected={color === value}
					title={COLOR_LABELS[value]}
					onclick={() => {
						pick(value);
					}}
				></button>
			{/each}
		</span>
	{/if}
</span>

<style>
	.picker {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.swatch {
		width: 3.2mm;
		height: 3.2mm;
		flex-shrink: 0;
		padding: 0;
		border: 0.2mm solid var(--color-border);
		border-radius: 50%;
		background: currentColor;
		cursor: pointer;
	}

	.swatch.none {
		background: transparent;
	}

	/* diagonal stroke marks the "no color" swatch */
	.swatch.none::before {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			transparent 44%,
			var(--color-border) 44%,
			var(--color-border) 56%,
			transparent 56%
		);
		border-radius: 50%;
	}

	.swatch.selected {
		outline: 0.3mm solid var(--color-bronze);
		outline-offset: 0.3mm;
	}

	.swatches {
		position: absolute;
		top: calc(100% + 1mm);
		left: 0;
		z-index: 10;
		display: flex;
		gap: 1mm;
		padding: 1mm;
		background: #fff;
		border: 0.2mm solid var(--color-border);
		border-radius: 1mm;
		box-shadow: 0 1mm 2mm rgb(0 0 0 / 20%);
	}
</style>
