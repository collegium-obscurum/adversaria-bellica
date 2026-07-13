<script lang="ts">
	import { categoryOptions } from '$lib/domain/creatureTypes';
	import { store } from '$lib/state/storage.svelte';
	import type { MonsterCard } from '$lib/domain/types';

	let {
		card = $bindable(),
		editable = false,
		onPortraitClick
	}: {
		card: MonsterCard;
		editable?: boolean;
		onPortraitClick?: () => void;
	} = $props();

	const CUSTOM_TYPE = '__custom__';
	let customCategory = $state(false);
	const typeOptions = $derived(categoryOptions(store.cards, card.category));

	function hideBrokenImage(event: Event) {
		(event.currentTarget as HTMLImageElement).style.display = 'none';
	}

	function onCategoryChange(event: Event & { currentTarget: HTMLSelectElement }) {
		const value = event.currentTarget.value;
		if (value === CUSTOM_TYPE) {
			customCategory = true;
		} else {
			card.category = value;
		}
	}
</script>

<header>
	{#if editable}
		<button type="button" class="portrait" onclick={onPortraitClick} title="Bild wählen">
			{#if card.image}
				<img src={card.image} alt="" onerror={hideBrokenImage} />
			{:else}
				<span class="portrait-hint">Bild</span>
			{/if}
		</button>
	{:else if card.image}
		<img class="portrait" src={card.image} alt="" onerror={hideBrokenImage} />
	{/if}
	<div class="title">
		{#if editable}
			<input class="name-input" bind:value={card.name} placeholder="Name" required />
			{#if customCategory}
				<input
					class="category-input"
					bind:value={card.category}
					placeholder="Eigener Typ"
					onblur={() => (customCategory = false)}
					onkeydown={(event) => {
						if (event.key === 'Enter') event.currentTarget.blur();
					}}
					{@attach (node: HTMLInputElement) => {
						node.focus();
					}}
				/>
			{:else}
				<select class="category-input" value={card.category} onchange={onCategoryChange}>
					<option value="">– kein Typ –</option>
					{#each typeOptions as type (type)}
						<option value={type}>{type}</option>
					{/each}
					<option value={CUSTOM_TYPE}>Eigener Typ…</option>
				</select>
			{/if}
		{:else}
			<h2>{card.name || 'Unbenannt'}</h2>
			{#if card.category}<span class="category">{card.category}</span>{/if}
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		gap: 3mm;
	}

	.portrait {
		width: 22mm;
		height: 22mm;
		border-radius: 50%;
		border: 0.4mm solid var(--line);
		object-fit: cover;
		flex-shrink: 0;
	}

	:global(.card.ornate) .portrait {
		border-color: var(--color-brand);
		box-shadow: 0 0 0 0.35mm var(--color-gold);
	}

	button.portrait {
		padding: 0;
		background: #f0ece2;
		cursor: pointer;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button.portrait img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.portrait-hint {
		color: #888;
		font-size: 7pt;
	}

	.title {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5mm;
		border-bottom: 0.5mm double var(--line);
		padding-bottom: 1mm;
	}

	:global(.card.ornate) .title {
		border-bottom-color: var(--color-gold);
	}

	h2 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 13pt;
		color: var(--accent);
	}

	.category {
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.name-input {
		font-family: var(--font-serif);
		font-size: 13pt;
		font-weight: bold;
		color: var(--accent);
		width: 100%;
		box-sizing: border-box;
	}

	.category-input {
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--muted);
		width: 100%;
		box-sizing: border-box;
	}
</style>
