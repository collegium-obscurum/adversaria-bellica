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
		<span class="sigil"><StatIcon name="actionCount" /></span>
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
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		color: #2a211a;
		background: #f4efe4;
	}

	:global(h1) {
		font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		color: #2a211a;
	}

	:global(:focus-visible) {
		outline: 2px solid #7a1e12;
		outline-offset: 2px;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 0.65rem 1.5rem;
		background: #262019;
		color: #f2e8d0;
		border-bottom: 2px solid #a5813c;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: #f2e8d0;
	}

	.sigil {
		width: 1.5rem;
		height: 1.5rem;
		color: #a5813c;
		--icon-cut: #262019;
		line-height: 0;
	}

	.sigil :global(svg) {
		width: 100%;
		height: 100%;
	}

	.wordmark {
		font-family: 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
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
		color: #f2e8d0;
		background: #7a1e12;
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
