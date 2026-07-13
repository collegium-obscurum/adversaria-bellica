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

	const PATHS: Record<StatIconName, string> = {
		lifePoints:
			'M12 20 C7 15.5 3 12.5 3 8.5 C3 5.5 5.2 4 7.5 4 C9.3 4 11 5 12 6.8 C13 5 14.7 4 16.5 4 C18.8 4 21 5.5 21 8.5 C21 12.5 17 15.5 12 20 Z',
		armor: 'M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z',
		initiative: 'M13 2 L5 13 H11 L9 22 L19 9 H12.5 Z',
		speed: 'M8 3 H13 L15 10 C18 10.5 20 12 20 14.5 V17 H10 L9.5 21 H4 L6 13 L8 10 Z',
		defense:
			'M4 4 L16 16 M20 4 L8 16 M4 4 L8 5 M4 4 L5 8 M20 4 L16 5 M20 4 L19 8 M6.5 18.5 L9 21 M17.5 18.5 L15 21',
		soulPower:
			'M12 2 L14.4 8.6 L21 9.2 L16 13.5 L17.6 20.4 L12 16.8 L6.4 20.4 L8 13.5 L3 9.2 L9.6 8.6 Z',
		toughness:
			'M7 21 V12 C7 8 9 6 12 6 C15 6 17 8 17 12 V21 M7 13 H17 M9.5 6.5 V4 M12 6 V3 M14.5 6.5 V4',
		actionCount:
			'M12 2 L21 9 L17.5 20 H6.5 L3 9 Z M12 2 V8.5 M3 9 L12 8.5 L21 9 M6.5 20 L12 8.5 L17.5 20'
	};
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linejoin="round"
	stroke-linecap="round"
	aria-hidden="true"
>
	<path d={PATHS[name]} />
</svg>
