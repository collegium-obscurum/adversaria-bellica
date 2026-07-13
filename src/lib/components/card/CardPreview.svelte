<script lang="ts">
	import { prefs } from '$lib/state/preferences.svelte';
	import type { MonsterCard } from '$lib/domain/types';
	import { woundThresholds } from '$lib/domain/wounds';
	import ActionTable from './ActionTable.svelte';
	import CardHeader from './CardHeader.svelte';
	import SpecialMoves from './SpecialMoves.svelte';
	import StatBadges from './StatBadges.svelte';
	import TalentRow from './TalentRow.svelte';

	let {
		card = $bindable(),
		editable = false,
		onPortraitClick
	}: {
		card: MonsterCard;
		editable?: boolean;
		onPortraitClick?: () => void;
	} = $props();

	const thresholds = $derived(woundThresholds(card.lifePoints));
	const ornate = $derived(prefs.cardStyle === 'ornate');

	let showFlavor = $state(false);
	let showNotes = $state(false);
</script>

<article class="card" class:editable class:ornate>
	{#if ornate}
		{#each ['tl', 'tr', 'bl', 'br'] as position (position)}
			<svg class="corner {position}" viewBox="0 0 20 20" aria-hidden="true">
				<path d="M1.2 19 V6.5 Q1.2 1.2 6.5 1.2 H19" />
				<path d="M4.4 19 V8.5 Q4.4 4.4 8.5 4.4 H19" />
				<path class="gem" d="M8 7.9 l2 2 -2 2 -2 -2 Z" />
			</svg>
		{/each}
	{/if}
	<div class="columns">
		<div class="body">
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

			<div class="wounds">
				<b>Schmerz bei Schaden:</b>
				{thresholds
					.slice(0, 3)
					.map((threshold) => threshold.damage)
					.join(' / ')}
				· <b>Tod:</b>
				{thresholds[3].damage}
			</div>

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

		<StatBadges bind:card {editable} />
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
		background: radial-gradient(ellipse at 30% 15%, #f7efdc 0%, #efe2c2 55%, #e2cfa4 100%);
		border: 0.6mm solid var(--color-brand);
		box-shadow:
			inset 0 0 0 0.5mm var(--color-cream),
			inset 0 0 0 0.8mm var(--color-gold);
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;
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

	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2mm;
		min-width: 0;
	}

	.flavor {
		margin: 0;
		font-style: italic;
		color: var(--muted);
	}

	.wounds {
		padding: 1.5mm 2mm;
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
		gap: 1mm;
	}

	.notes {
		margin: 0;
		color: var(--muted);
		font-size: 7.5pt;
	}

	.notes-input {
		color: var(--muted);
		font-size: 7.5pt;
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
		font-size: 8.5pt;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--accent);
		border-bottom: 0.3mm solid var(--line);
	}

	.card :global(.entry) {
		margin: 0;
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
