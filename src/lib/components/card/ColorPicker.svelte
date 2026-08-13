<script lang="ts">
	import { ENTRY_COLORS, ENTRY_COLOR_LABELS, type EntryColor } from '$lib/domain/entryColor';

	let { color = $bindable() }: { color: EntryColor | null } = $props();

	let open = $state(false);
	let triggerButton = $state<HTMLButtonElement>();

	function pick(value: EntryColor | null) {
		color = value;
		open = false;
		triggerButton?.focus();
	}

	function closeOnFocusLoss(event: FocusEvent) {
		const picker = event.currentTarget as HTMLElement;
		if (!picker.contains(event.relatedTarget as Node)) {
			open = false;
		}
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (!open || event.key !== 'Escape') return;
		event.stopPropagation();
		open = false;
		triggerButton?.focus();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

<span class="picker" onfocusout={closeOnFocusLoss}>
	<button
		type="button"
		class="swatch {color ? `tint-${color}` : ''}"
		class:none={color === null}
		title="Farbe wählen"
		aria-label="Farbe wählen (aktuell: {color ? ENTRY_COLOR_LABELS[color] : 'keine'})"
		aria-expanded={open}
		bind:this={triggerButton}
		onclick={() => (open = !open)}
	></button>
	{#if open}
		<span class="swatches">
			<button
				type="button"
				class="swatch none"
				class:selected={color === null}
				title="Keine Farbe"
				aria-label="Keine Farbe"
				aria-pressed={color === null}
				onclick={() => {
					pick(null);
				}}
			></button>
			{#each ENTRY_COLORS as value (value)}
				<button
					type="button"
					class="swatch tint-{value}"
					class:selected={color === value}
					title={ENTRY_COLOR_LABELS[value]}
					aria-label={ENTRY_COLOR_LABELS[value]}
					aria-pressed={color === value}
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
		position: relative;
		width: 3.2mm;
		height: 3.2mm;
		flex-shrink: 0;
		padding: 0;
		/* --swatch-line lets a dark surface (the banner strip) lighten the outline */
		border: 0.2mm solid var(--swatch-line, var(--color-border));
		border-radius: 50%;
		background: currentColor;
		cursor: pointer;
	}

	/* invisible hit-area extension to roughly 24px without changing the visual size */
	.swatch::after {
		content: '';
		position: absolute;
		inset: -1.6mm;
		border-radius: 50%;
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
			var(--swatch-line, var(--color-border)) 44%,
			var(--swatch-line, var(--color-border)) 56%,
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
		gap: 2mm;
		padding: 1mm;
		background: #fff;
		border: 0.2mm solid var(--color-border);
		border-radius: 1mm;
		box-shadow: 0 1mm 2mm rgb(0 0 0 / 20%);
	}
</style>
