<script lang="ts">
	import { prefs } from '$lib/state/preferences.svelte';
	import { STAT_BADGES } from '$lib/domain/statBadges';
	import { computeCardFit, type FitResult } from '$lib/domain/cardFit';
	import type { MonsterCard } from '$lib/domain/types';
	import { woundThresholds } from '$lib/domain/wounds';
	import ActionTable from './ActionTable.svelte';
	import CardHeader from './CardHeader.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import SpecialMoves from './SpecialMoves.svelte';
	import StatBadges from './StatBadges.svelte';
	import TalentRow from './TalentRow.svelte';

	let {
		card = $bindable(),
		editable = false,
		onPortraitClick,
		onFit
	}: {
		card: MonsterCard;
		editable?: boolean;
		onPortraitClick?: () => void;
		onFit?: (fit: FitResult) => void;
	} = $props();

	const thresholds = $derived(card.lifePoints === null ? null : woundThresholds(card.lifePoints));
	const ornate = $derived(prefs.cardStyle === 'ornate');
	let showBanner = $state(false);
	// the banner strip replaces the top brand mark and top corner ornaments
	const hasBanner = $derived(card.banner.trim() !== '' || (editable && showBanner));
	const cornerPositions = $derived(hasBanner ? ['bl', 'br'] : ['tl', 'tr', 'bl', 'br']);

	function removeBanner() {
		card.banner = '';
		card.bannerColor = null;
		showBanner = false;
	}
	// when every badge is hidden the whole column disappears and the body takes its width
	const allBadgesHidden = $derived(card.hiddenStats.length === STAT_BADGES.length);

	let showFlavor = $state(false);
	let showNotes = $state(false);

	let cardElement = $state<HTMLElement>();
	let bodyElement = $state<HTMLElement>();
	let hidePortrait = $state(false);

	$effect(() => {
		if (editable || !cardElement || !bodyElement) return;
		const cardNode = cardElement;
		const bodyNode = bodyElement;
		// re-run whenever any card content or the card style changes
		JSON.stringify($state.snapshot(card));
		void prefs.cardStyle;
		const imagesEnabled = prefs.printImages;
		const fit = computeCardFit(imagesEnabled && card.image !== null, (scale, imageHidden) => {
			cardNode.style.setProperty('--fit-scale', String(scale));
			// classList instead of state: the measure loop needs the DOM updated synchronously
			cardNode.classList.toggle('hide-portrait', imageHidden || !imagesEnabled);
			return bodyNode.scrollHeight - bodyNode.clientHeight > 1;
		});
		hidePortrait = fit.imageHidden || !imagesEnabled;
		onFit?.(fit);
	});
</script>

<article
	class="card"
	class:editable
	class:ornate
	class:ornate-tints={ornate}
	class:hide-portrait={hidePortrait}
	style:--wash={card.bannerColor ? `var(--tint-${card.bannerColor})` : null}
	bind:this={cardElement}
>
	{#if hasBanner}
		<div class="banner" style:color={card.bannerColor ? `var(--tint-${card.bannerColor})` : null}>
			{#if editable}
				<input class="banner-input" bind:value={card.banner} placeholder="Banner" />
				<ColorPicker bind:color={card.bannerColor} />
				<button type="button" class="remove" onclick={removeBanner} title="Banner entfernen"
					>✕</button
				>
			{:else}
				<span class="banner-label">{card.banner}</span>
			{/if}
		</div>
	{:else}
		<span class="brand-mark top">Collegium Obscurum</span>
		{#if editable}
			<button type="button" class="add add-banner" onclick={() => (showBanner = true)}
				>+ Banner</button
			>
		{/if}
	{/if}
	<span class="brand-mark bottom">Adversaria Bellica</span>
	{#if ornate}
		{#each cornerPositions as position (position)}
			<svg class="corner {position}" viewBox="0 0 20 20" aria-hidden="true">
				<path d="M1.2 19 V6.5 Q1.2 1.2 6.5 1.2 H19" />
				<path d="M4.4 19 V8.5 Q4.4 4.4 8.5 4.4 H19" />
				<path class="gem" d="M8 7.9 l2 2 -2 2 -2 -2 Z" />
			</svg>
		{/each}
	{/if}
	<div class="columns">
		<div class="body" bind:this={bodyElement}>
			<CardHeader bind:card {editable} {onPortraitClick} />

			{#if editable}
				{#if showFlavor || card.flavorText.trim() !== ''}
					<div class="removable">
						<textarea class="flavor-input" bind:value={card.flavorText} placeholder="Flavourtext"
						></textarea>
						<button
							type="button"
							class="remove"
							onclick={() => {
								card.flavorText = '';
								showFlavor = false;
							}}
							title="Flavourtext entfernen">✕</button
						>
					</div>
				{:else}
					<button type="button" class="add" onclick={() => (showFlavor = true)}
						>+ Flavourtext</button
					>
				{/if}
			{:else if card.flavorText}
				<p class="flavor">{card.flavorText}</p>
			{/if}

			<ActionTable bind:card {editable} />

			{#if thresholds}
				<div class="wounds">
					<b>Schmerz bei Schaden:</b>
					{thresholds
						.slice(0, 3)
						.map((threshold) => threshold.damage)
						.join(' / ')}
					· <b>Tod:</b>
					{thresholds[3].damage}
				</div>
			{/if}

			<SpecialMoves bind:card {editable} />

			{#if editable}
				<div class="notes-section">
					<h3>Notizen</h3>
					{#if showNotes || card.notes.trim() !== ''}
						<div class="removable">
							<textarea
								class="notes-input"
								bind:value={card.notes}
								placeholder="Notizen (Immunitäten, Schwächen, Taktik)"></textarea>
							<button
								type="button"
								class="remove"
								onclick={() => {
									card.notes = '';
									showNotes = false;
								}}
								title="Notizen entfernen">✕</button
							>
						</div>
					{:else}
						<button type="button" class="add" onclick={() => (showNotes = true)}>+ Notizen</button>
					{/if}
				</div>
			{:else if card.notes}
				<div class="notes-section">
					<h3>Notizen</h3>
					<p class="notes">{card.notes}</p>
				</div>
			{/if}
		</div>

		{#if editable || !allBadgesHidden}
			<StatBadges bind:card {editable} />
		{/if}
	</div>

	<TalentRow bind:card {editable} />
</article>

<style>
	.card {
		--line: #1a1a1a;
		--accent: #1a1a1a;
		--muted: #444;
		position: relative;
		width: 105mm;
		height: 148mm;
		box-sizing: border-box;
		padding: 5mm;
		display: flex;
		flex-direction: column;
		gap: 2mm;
		color: #1a1a1a;
		background: #fff;
		border: 0.4mm solid var(--line);
		border-radius: 2mm;
		font-size: 8.5pt;
		line-height: 1.3;
		overflow: hidden;
	}

	.card.editable {
		overflow: visible;
		height: auto;
		min-height: 148mm;
	}

	.card.ornate {
		--line: #8a6b3f;
		--accent: var(--color-brand);
		--muted: var(--color-ink-soft);
		color: var(--color-ink);
		/* wash of the card's banner color over the parchment; transparent without one */
		--wash-layer: color-mix(in srgb, var(--wash, transparent) 16%, transparent);
		background:
			linear-gradient(var(--wash-layer), var(--wash-layer)),
			radial-gradient(ellipse at 30% 15%, #f7efdc 0%, #efe2c2 55%, #e2cfa4 100%);
		border: 0.6mm solid var(--color-brand);
		box-shadow:
			inset 0 0 0 0.5mm var(--color-cream),
			inset 0 0 0 0.8mm var(--color-gold);
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;
	}

	.brand-mark {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5mm;
		font-family: var(--font-serif);
		font-size: 6pt;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--muted);
		opacity: 0.45;
		pointer-events: none;
	}

	.brand-mark::before,
	.brand-mark::after {
		content: '';
		width: 8mm;
		border-top: 0.2mm solid var(--line);
	}

	.brand-mark.top {
		top: 1mm;
	}

	.brand-mark.bottom {
		bottom: 1mm;
	}

	/* full-bleed strip along the top edge, replacing the top brand mark */
	.banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5mm;
		margin: -5mm -5mm 1mm;
		padding: 1.2mm 5mm 1mm;
		font-family: var(--font-serif);
		font-variant: small-caps;
		font-size: 10pt;
		letter-spacing: 0.15em;
		color: var(--line);
		border-bottom: 0.4mm solid currentColor;
	}

	.card.ornate .banner {
		color: var(--color-brand);
		background: currentColor;
		border-bottom: 0.35mm solid var(--color-gold);
		box-shadow: inset 0 -0.8mm 0 -0.45mm var(--color-cream);
	}

	.card.ornate .banner .banner-label,
	.card.ornate .banner .banner-input {
		color: var(--color-cream);
	}

	/* focus swaps in a light background, so the light banner text must darken */
	.banner-input:focus,
	.card.ornate .banner .banner-input:focus {
		color: var(--color-ink);
	}

	.banner-input {
		font-family: inherit;
		font-variant: inherit;
		font-size: inherit;
		letter-spacing: inherit;
		text-align: center;
		color: inherit;
		width: 60%;
	}

	/* floats in the whitespace between the top brand mark and the header,
	   out of flow so it neither covers the mark nor pushes the card content */
	.card .add-banner {
		position: absolute;
		top: 4.8mm;
		left: 50%;
		transform: translateX(-50%);
	}

	.corner {
		position: absolute;
		width: 6.5mm;
		height: 6.5mm;
		fill: none;
		stroke: var(--color-brand);
		stroke-width: 1.3;
		pointer-events: none;
	}

	.corner .gem {
		fill: var(--color-gold);
		stroke: none;
	}

	.corner.tl {
		top: 1.4mm;
		left: 1.4mm;
	}

	.corner.tr {
		top: 1.4mm;
		right: 1.4mm;
		transform: scaleX(-1);
	}

	.corner.bl {
		bottom: 1.4mm;
		left: 1.4mm;
		transform: scaleY(-1);
	}

	.corner.br {
		bottom: 1.4mm;
		right: 1.4mm;
		transform: scale(-1);
	}

	.columns {
		flex: 1;
		display: flex;
		gap: 2mm;
		min-height: 0;
	}

	.card:not(.editable) .body {
		overflow: hidden;
	}

	/* body text and spacing are em-based so --fit-scale shrinks them together;
	   badges, talent box and card chrome keep their fixed sizes */
	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		font-size: calc(8.5pt * var(--fit-scale, 1));
		gap: 0.667em;
		min-width: 0;
	}

	.flavor {
		margin: 0;
		font-style: italic;
		color: var(--muted);
	}

	.wounds {
		padding: 0.5em 0.667em;
		border: 0.3mm solid var(--line);
		border-radius: 1mm;
	}

	.card.ornate .wounds {
		background: rgb(255 250 232 / 55%);
		border-color: var(--color-gold-soft);
	}

	.notes-section {
		display: flex;
		flex-direction: column;
		gap: 0.333em;
	}

	.notes {
		margin: 0;
		color: var(--muted);
		font-size: 0.882em;
	}

	.notes-input {
		color: var(--muted);
		font-size: 0.882em;
	}

	.flavor-input {
		font-style: italic;
		color: var(--muted);
	}

	.removable {
		display: flex;
		align-items: flex-start;
		gap: 1mm;
	}

	/* shared card styles: used by the section subcomponents too, hence :global */
	.card :global(h3) {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 1em;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--accent);
		border-bottom: 0.3mm solid var(--line);
	}

	.card :global(.entry) {
		margin: 0;
	}

	/* entry colors: tint sets color, the dot paints itself via currentColor */
	.card :global(.tint-red) {
		color: var(--tint-red);
	}

	.card :global(.tint-orange) {
		color: var(--tint-orange);
	}

	.card :global(.tint-green) {
		color: var(--tint-green);
	}

	.card :global(.tint-blue) {
		color: var(--tint-blue);
	}

	.card :global(.tint-purple) {
		color: var(--tint-purple);
	}

	.card :global(.tint-brown) {
		color: var(--tint-brown);
	}

	.card :global(.color-dot) {
		display: inline-block;
		width: 0.55em;
		height: 0.55em;
		border-radius: 50%;
		background: currentColor;
		vertical-align: baseline;
	}

	.card :global(.entry-row) {
		display: flex;
		align-items: center;
		gap: 1mm;
		border-radius: 1mm;
	}

	.card :global(.range) {
		font-weight: bold;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
	}

	.card :global(.entry-name) {
		width: 22mm;
		font-weight: bold;
	}

	.card :global(.entry-effect) {
		flex: 1;
	}

	.card :global(.remove),
	.card :global(.add) {
		font: inherit;
		font-size: 7pt;
		border: 0.2mm solid var(--color-border);
		border-radius: 0.8mm;
		background: #f7f5ef;
		color: var(--color-muted);
		cursor: pointer;
		padding: 0.2mm 1mm;
	}

	.card :global(.remove:disabled),
	.card :global(.add:disabled) {
		opacity: 0.35;
		cursor: default;
	}

	.card :global(.remove) {
		flex-shrink: 0;
	}

	.card :global(.add) {
		align-self: flex-start;
	}

	/* edit controls */
	.card.editable :global(input),
	.card.editable :global(select),
	.card.editable :global(textarea) {
		font: inherit;
		border: 0.2mm solid transparent;
		border-radius: 0.5mm;
		background: transparent;
		padding: 0.3mm 0.5mm;
	}

	.card.editable :global(input:hover),
	.card.editable :global(select:hover),
	.card.editable :global(textarea:hover) {
		border-color: var(--color-border);
	}

	.card.editable :global(input:focus),
	.card.editable :global(select:focus),
	.card.editable :global(textarea:focus) {
		border-color: var(--color-bronze);
		outline: none;
		background: #fdfcf8;
	}

	.card.editable :global(textarea) {
		resize: none;
		field-sizing: content;
		min-height: 1.4em;
		width: 100%;
		box-sizing: border-box;
	}

	/* name fields wrap instead of clipping; fixed width keeps rows aligned */
	.card.editable :global(textarea.entry-name) {
		width: 22mm;
		flex-shrink: 0;
		font-weight: bold;
	}

	.card.editable :global(input[type='number']) {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.card.editable :global(input[type='number']::-webkit-inner-spin-button),
	.card.editable :global(input[type='number']::-webkit-outer-spin-button) {
		appearance: none;
		margin: 0;
	}

	.card.ornate.editable :global(input:focus),
	.card.ornate.editable :global(select:focus),
	.card.ornate.editable :global(textarea:focus) {
		background: #fffbf0;
	}
</style>
