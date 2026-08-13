<script lang="ts">
	// no props; the script block is what gives svelte-check a typed declaration
</script>

<!-- presentation attributes, not classes: html-to-image drops CSS-class styles on SVG children -->
<svg viewBox="0 0 24 24" aria-hidden="true">
	<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
		<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
		<!-- filled pupil, not a stroked ring: at this size a ring fills in anyway, and
		     without it the shape reads as the color picker's empty circle -->
		<circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
		<path d="M4 20 20 4" />
	</g>
</svg>

<style>
	/* 1.3em square matches the line box of the ✕ buttons, so the two keep the same
	   height and the icon button stays square */
	svg {
		width: 1.3em;
		height: 1.3em;
		display: block;
	}
</style>
