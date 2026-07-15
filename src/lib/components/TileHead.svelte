<script lang="ts">
	import type { MonsterCard } from '$lib/domain/types';

	let { card }: { card: MonsterCard } = $props();

	function hideBrokenImage(event: Event) {
		(event.currentTarget as HTMLImageElement).style.display = 'none';
	}
</script>

{#if card.image}
	<img src={card.image} alt="" onerror={hideBrokenImage} />
{:else}
	<span class="placeholder">{(card.name || '?').slice(0, 1)}</span>
{/if}
<span class="naming">
	<strong>{card.name}</strong>
	<small>{card.category || 'ohne Typ'}</small>
</span>

<style>
	img,
	.placeholder {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
		border: 2px solid #e3d8c2;
	}

	.placeholder {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ece4d2;
		color: var(--color-gold);
		font-family: var(--font-serif);
		font-size: 1.5rem;
	}

	.naming {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.naming strong {
		font-family: var(--font-serif);
		font-size: 1.05rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.naming small {
		color: var(--color-ink-soft);
		font-variant: small-caps;
		letter-spacing: 0.04em;
	}
</style>
