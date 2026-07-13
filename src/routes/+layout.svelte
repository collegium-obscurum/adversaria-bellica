<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Adversaria Bellica</title>
</svelte:head>

<nav class="no-print">
	<strong>Adversaria Bellica</strong>
	<a href={resolve('/')}>Bibliothek</a>
	<a href={resolve('/editor')}>Neue Karte</a>
	<a href={resolve('/print')}>Drucken</a>
</nav>

<main>
	{@render children()}
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		color: #1a1a1a;
		background: #f5f3ee;
	}

	nav {
		display: flex;
		align-items: baseline;
		gap: 1.5rem;
		padding: 0.75rem 1.5rem;
		background: #2b2620;
		color: #f5f3ee;
	}

	nav a {
		color: #d8cfc0;
		text-decoration: none;
	}

	nav a:hover {
		color: #fff;
		text-decoration: underline;
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
