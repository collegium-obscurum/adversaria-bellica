<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import StatIcon from '$lib/components/StatIcon.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const LINKS = [
		{ path: '/', label: 'Bibliothek' },
		{ path: '/editor', label: 'Neue Karte' },
		{ path: '/print', label: 'Drucken' }
	] as const;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Adversaria Bellica</title>
</svelte:head>

<nav class="no-print">
	<a class="brand" href={resolve('/')}>
		<span class="sigil"><StatIcon name="actionCount" cutColor="#262019" /></span>
		<span class="wordmark">Adversaria Bellica</span>
	</a>
	<div class="links">
		{#each LINKS as link (link.path)}
			<a href={resolve(link.path)} class:active={page.url.pathname === resolve(link.path)}>
				{link.label}
			</a>
		{/each}
	</div>
</nav>

<main>
	{@render children()}
</main>

<style>
	:global(:root) {
		--color-brand: #7a1e12;
		--color-brand-hover: #8e2717;
		--color-danger: #a3231d;
		--color-gold: #a5813c;
		--color-gold-soft: #b99b5f;
		--color-bronze: #8a7d5c;
		--color-cream: #f2e8d0;
		--color-parchment: #f4efe4;
		--color-surface: #fff;
		--color-ink: #2a211a;
		--color-ink-deep: #262019;
		--color-ink-soft: #5c4a30;
		--color-muted: #6b6353;
		--color-border: #c9c1b2;
		--color-border-soft: #ddd4c2;
		--font-serif: 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		--radius: 6px;
		--radius-lg: 8px;
	}

	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		color: var(--color-ink);
		background: var(--color-parchment);
	}

	:global(h1) {
		font-family: var(--font-serif);
		color: var(--color-ink);
	}

	:global(:focus-visible) {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 0.65rem 1.5rem;
		background: var(--color-ink-deep);
		color: var(--color-cream);
		border-bottom: 2px solid var(--color-gold);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--color-cream);
	}

	.sigil {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--color-gold);
		line-height: 0;
	}

	.sigil :global(svg) {
		width: 100%;
		height: 100%;
	}

	.wordmark {
		font-family: var(--font-serif);
		font-variant: small-caps;
		letter-spacing: 0.08em;
		font-size: 1.15rem;
	}

	.links {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.links a {
		color: #d8cfc0;
		text-decoration: none;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
	}

	.links a:hover {
		color: #fff;
		background: rgb(255 255 255 / 8%);
	}

	.links a.active {
		color: var(--color-cream);
		background: var(--color-brand);
	}

	main {
		padding: 1.5rem;
		max-width: 70rem;
		margin: 0 auto;
	}

	@media print {
		:global(.no-print) {
			display: none !important;
		}

		:global(body) {
			background: #fff;
		}

		main {
			padding: 0;
			max-width: none;
			margin: 0;
		}
	}
</style>
