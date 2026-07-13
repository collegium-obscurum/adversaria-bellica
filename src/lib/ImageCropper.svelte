<script lang="ts">
	let { onApply }: { onApply: (dataUrl: string) => void } = $props();

	const VIEWPORT = 200;
	const OUTPUT = 256;

	let sourceUrl = $state<string | null>(null);
	let imageEl: HTMLImageElement | null = $state(null);
	let scale = $state(1);
	let minScale = $state(1);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let dragging = false;
	let lastX = 0;
	let lastY = 0;

	function onFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		if (sourceUrl) URL.revokeObjectURL(sourceUrl);
		sourceUrl = URL.createObjectURL(file);
	}

	function onImageLoad() {
		if (!imageEl) return;
		minScale = Math.max(VIEWPORT / imageEl.naturalWidth, VIEWPORT / imageEl.naturalHeight);
		scale = minScale;
		offsetX = (VIEWPORT - imageEl.naturalWidth * scale) / 2;
		offsetY = (VIEWPORT - imageEl.naturalHeight * scale) / 2;
	}

	function onPointerDown(event: PointerEvent) {
		dragging = true;
		lastX = event.clientX;
		lastY = event.clientY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging) return;
		offsetX += event.clientX - lastX;
		offsetY += event.clientY - lastY;
		lastX = event.clientX;
		lastY = event.clientY;
	}

	function onPointerUp() {
		dragging = false;
	}

	function onZoomInput(event: Event) {
		const newScale = Number((event.target as HTMLInputElement).value);
		const center = VIEWPORT / 2;
		offsetX = center - ((center - offsetX) / scale) * newScale;
		offsetY = center - ((center - offsetY) / scale) * newScale;
		scale = newScale;
	}

	function apply() {
		if (!imageEl || !sourceUrl) return;
		const canvas = document.createElement('canvas');
		canvas.width = OUTPUT;
		canvas.height = OUTPUT;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, OUTPUT, OUTPUT);
		const sourceSize = VIEWPORT / scale;
		ctx.drawImage(
			imageEl,
			-offsetX / scale,
			-offsetY / scale,
			sourceSize,
			sourceSize,
			0,
			0,
			OUTPUT,
			OUTPUT
		);
		onApply(canvas.toDataURL('image/jpeg', 0.85));
		URL.revokeObjectURL(sourceUrl);
		sourceUrl = null;
	}
</script>

<div class="cropper">
	<input type="file" accept="image/*" onchange={onFileChange} />

	{#if sourceUrl}
		<div
			class="viewport"
			role="img"
			aria-label="Bildausschnitt (ziehen zum Verschieben)"
			style="width: {VIEWPORT}px; height: {VIEWPORT}px;"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
		>
			<img
				bind:this={imageEl}
				src={sourceUrl}
				alt="Bildausschnitt wählen"
				style="transform: translate({offsetX}px, {offsetY}px) scale({scale}); transform-origin: 0 0;"
				onload={onImageLoad}
				draggable="false"
			/>
		</div>
		<label>
			Zoom
			<input
				type="range"
				min={minScale}
				max={minScale * 4}
				step="0.01"
				value={scale}
				oninput={onZoomInput}
			/>
		</label>
		<button type="button" onclick={apply}>Ausschnitt übernehmen</button>
	{/if}
</div>

<style>
	.cropper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-start;
	}

	.viewport {
		position: relative;
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid #2b2620;
		cursor: grab;
		touch-action: none;
		background: #ddd;
	}

	.viewport:active {
		cursor: grabbing;
	}

	.viewport img {
		position: absolute;
		top: 0;
		left: 0;
		width: auto;
		height: auto;
		max-width: none;
		user-select: none;
	}
</style>
