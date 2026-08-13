<script lang="ts">
	// no props; the script block is what gives svelte-check a typed declaration
</script>

<!-- solid silhouette, styled with SVG attributes only: html-to-image (PNG/PDF export)
     drops class-based styling on <svg> children -->
<svg viewBox="0 0 24 24" aria-hidden="true">
	<!-- drawn upright, tilted as a whole; every point stays inside the viewBox radius -->
	<g transform="rotate(45 12 12)">
		<path fill="currentColor" d="M12 1.2 L14.1 5.4 V15.4 H9.9 V5.4 Z" />
		<path fill="currentColor" d="M5.6 15.4 H18.4 V17.2 H5.6 Z" />
		<path fill="currentColor" d="M10.9 17.2 H13.1 V20.2 H10.9 Z" />
		<circle fill="currentColor" cx="12" cy="21.3" r="1.5" />
	</g>
</svg>
