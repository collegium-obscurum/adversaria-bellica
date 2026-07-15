<script lang="ts">
	import ColorModeToggle from './ColorModeToggle.svelte';
	import ImageToggle from './ImageToggle.svelte';
	import StatLabelToggle from './StatLabelToggle.svelte';
	import StyleToggle from './StyleToggle.svelte';

	let details = $state<HTMLDetailsElement>();

	function closeOnOutsideClick(event: MouseEvent) {
		if (details?.open && !details.contains(event.target as Node)) {
			details.open = false;
		}
	}
</script>

<svelte:window onclick={closeOnOutsideClick} />

<details class="options" bind:this={details}>
	<summary>⚙ Optionen</summary>
	<div class="panel">
		<span class="row-label">Stil</span>
		<StyleToggle />
		<span class="row-label">Werte</span>
		<StatLabelToggle />
		<span class="row-label">Farben</span>
		<ColorModeToggle />
		<span class="row-label">Bilder</span>
		<ImageToggle />
	</div>
</details>

<style>
	.options {
		position: relative;
	}

	summary {
		list-style: none;
		cursor: pointer;
		font-size: 0.95rem;
		color: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: var(--color-surface);
		padding: 0.4rem 1.1rem;
		user-select: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.options[open] summary,
	summary:hover {
		border-color: var(--color-gold);
		color: var(--color-ink);
	}

	.panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 0;
		z-index: 10;
		width: 19rem;
		box-sizing: border-box;
		display: grid;
		/* definite 1fr track so the pills' inner 1fr halves resolve to a true 50/50 split */
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0.5rem 0.75rem;
		padding: 0.75rem 0.9rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
	}

	.panel > :global(.toggle) {
		width: 100%;
		box-sizing: border-box;
	}

	.row-label {
		font-size: 0.8rem;
		color: var(--color-muted);
	}
</style>
