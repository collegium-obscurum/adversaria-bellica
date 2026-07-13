<script lang="ts">
	export type StatIconName =
		| 'lifePoints'
		| 'armor'
		| 'initiative'
		| 'speed'
		| 'defense'
		| 'soulPower'
		| 'toughness'
		| 'actionCount';

	let { name }: { name: StatIconName } = $props();

	/*
	 * Solid silhouettes read better at 3mm print size than thin outlines.
	 * "cut" paths are detail lines drawn in the badge background colour
	 * (see --icon-cut), "line" paths are strokes in the icon colour itself.
	 */
	const ICONS: Record<StatIconName, string> = {
		lifePoints:
			'<path fill="currentColor" d="M12 20.5 C6.6 15.9 3 12.9 3 8.9 C3 5.9 5.3 3.9 7.9 3.9 C9.6 3.9 11.2 4.9 12 6.4 C12.8 4.9 14.4 3.9 16.1 3.9 C18.7 3.9 21 5.9 21 8.9 C21 12.9 17.4 15.9 12 20.5 Z"/>',
		armor:
			'<path fill="currentColor" d="M12 2.2 L20.2 5.4 V11 C20.2 16.6 16.8 20.5 12 21.9 C7.2 20.5 3.8 16.6 3.8 11 V5.4 Z"/>' +
			'<path class="cut" d="M12 5.2 V18.8 M6.6 9.4 H17.4"/>',
		initiative:
			'<path fill="currentColor" d="M13.4 1.8 L4.6 13.4 H10.2 L8.4 22.2 L19.4 9.2 H12.8 Z"/>',
		speed:
			'<path fill="currentColor" d="M8.5 2.8 H14 V10.2 C17.6 10.8 20.4 12.6 20.4 15.6 V17.4 H10.8 L10.4 21.2 H4.6 L6.2 13.2 L8.5 10 Z"/>' +
			'<path class="line" d="M2.2 6.2 H5.6 M1.8 9.6 H4.8"/>',
		defense:
			'<path class="line" d="M5 4 L15.9 15.1 M19 4 L8.1 15.1"/>' +
			'<path class="guard" d="M13.8 17.2 L18 13 M10.2 17.2 L6 13 M16.6 15.8 L18.7 17.9 M7.4 15.8 L5.3 17.9"/>' +
			'<circle fill="currentColor" cx="19.8" cy="19" r="1.4"/>' +
			'<circle fill="currentColor" cx="4.2" cy="19" r="1.4"/>',
		soulPower:
			'<path fill="currentColor" d="M12 1.8 L14.7 8 L21.2 8.7 L16.3 13.1 L17.8 19.8 L12 16.2 L6.2 19.8 L7.7 13.1 L2.8 8.7 L9.3 8 Z"/>',
		toughness:
			'<path fill="currentColor" d="M6.8 21.5 V12.2 C6.8 8.2 9 6 12 6 C15 6 17.2 8.2 17.2 12.2 V21.5 Z"/>' +
			'<path class="cut" d="M6.8 13.2 H17.2 M10.3 13.2 V17.4 M13.7 13.2 V17.4"/>' +
			'<path class="line" d="M9.3 4.4 V2.6 M12 3.9 V1.9 M14.7 4.4 V2.6"/>',
		actionCount:
			'<path fill="currentColor" d="M12 1.6 L21 6.8 V17.2 L12 22.4 L3 17.2 V6.8 Z"/>' +
			'<path class="cut" d="M12 7.6 L17.7 16.4 L6.3 16.4 Z M12 1.6 V7.6 M21 6.8 L17.7 16.4 M3 6.8 L6.3 16.4 M12 22.4 L6.3 16.4 M12 22.4 L17.7 16.4 M21 17.2 L17.7 16.4 M3 17.2 L6.3 16.4"/>'
	};
</script>

<svg viewBox="0 0 24 24" aria-hidden="true">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static string table above, no user input -->
	{@html ICONS[name]}
</svg>

<style>
	svg :global(.cut) {
		fill: none;
		stroke: var(--icon-cut, #fff);
		stroke-width: 1.3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	svg :global(.line) {
		fill: none;
		stroke: currentColor;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	svg :global(.guard) {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linecap: round;
	}
</style>
