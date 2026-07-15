<script lang="ts" generics="T">
	let {
		label,
		options,
		selected,
		onselect
	}: {
		label: string;
		options: readonly { value: T; label: string }[];
		selected: T;
		onselect: (value: T) => void;
	} = $props();
</script>

<div class="toggle" role="group" aria-label={label}>
	{#each options as option (option.label)}
		<button
			type="button"
			class:active={selected === option.value}
			aria-pressed={selected === option.value}
			onclick={() => {
				onselect(option.value);
			}}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.toggle {
		display: inline-grid;
		grid-template-columns: 1fr 1fr;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: var(--color-surface);
		padding: 2px;
	}

	button {
		font: inherit;
		font-size: 0.8rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--color-muted);
		padding: 0.25rem 0.6rem;
		cursor: pointer;
		text-align: center;
	}

	button.active {
		background: var(--color-brand);
		color: var(--color-cream);
	}
</style>
