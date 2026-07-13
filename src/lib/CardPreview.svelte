<script lang="ts">
	import {
		actionRanges,
		addAction,
		D20_FACES,
		moveAction,
		rangeLabel,
		setRangeEnd,
		setRangeStart
	} from './actions';
	import StatIcon from './StatIcon.svelte';
	import type { StatIconName } from './StatIcon.svelte';
	import type { MonsterCard, WoundTrigger } from './types';
	import { WOUND_TRIGGERS } from './types';
	import { woundThresholds } from './wounds';

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
	const ranges = $derived(actionRanges(card.actions));

	const TRIGGER_LABELS: Record<WoundTrigger, string> = {
		combatStart: 'Kampfbeginn',
		hp75: '75% LeP',
		hp50: '50% LeP',
		hp25: '25% LeP',
		death: 'Tod'
	};

	const TALENT_LABELS = {
		body: 'Körper',
		social: 'Gesellschaft',
		nature: 'Natur',
		knowledge: 'Wissen',
		craft: 'Handwerk'
	} as const;

	const STAT_BADGES: {
		key:
			| 'lifePoints'
			| 'armor'
			| 'initiative'
			| 'speed'
			| 'defense'
			| 'soulPower'
			| 'toughness'
			| 'actionCount';
		icon: StatIconName;
		label: string;
	}[] = [
		{ key: 'lifePoints', icon: 'lifePoints', label: 'Lebenspunkte (LeP)' },
		{ key: 'armor', icon: 'armor', label: 'Rüstungsschutz (RS)' },
		{ key: 'initiative', icon: 'initiative', label: 'Initiative (INI)' },
		{ key: 'speed', icon: 'speed', label: 'Geschwindigkeit (GS)' },
		{ key: 'defense', icon: 'defense', label: 'Verteidigung (VW)' },
		{ key: 'soulPower', icon: 'soulPower', label: 'Seelenkraft (SK)' },
		{ key: 'toughness', icon: 'toughness', label: 'Zähigkeit (ZK)' },
		{ key: 'actionCount', icon: 'actionCount', label: 'Aktionen pro Runde' }
	];

	let showFlavor = $state(false);
	let showNotes = $state(false);
	let addedTriggers = $state<WoundTrigger[]>([]);

	const visibleTriggers = $derived(
		WOUND_TRIGGERS.filter((trigger) => {
			const move = card.specialMoves[trigger];
			return (
				move.name.trim() !== '' || move.effect.trim() !== '' || addedTriggers.includes(trigger)
			);
		})
	);
	const hiddenTriggers = $derived(WOUND_TRIGGERS.filter((t) => !visibleTriggers.includes(t)));

	function addTrigger(trigger: WoundTrigger) {
		addedTriggers.push(trigger);
	}

	function removeTrigger(trigger: WoundTrigger) {
		card.specialMoves[trigger] = { name: '', effect: '' };
		addedTriggers = addedTriggers.filter((t) => t !== trigger);
	}

	let dragIndex = $state<number | null>(null);

	function onDragStart(event: DragEvent, index: number) {
		dragIndex = index;
		event.dataTransfer?.setData('text/plain', String(index));
	}

	function onDrop(index: number) {
		if (dragIndex !== null) {
			moveAction(card.actions, dragIndex, index);
		}
		dragIndex = null;
	}

	function removeAction(index: number) {
		card.actions.splice(index, 1);
	}
</script>

<article class="card" class:editable>
	<header>
		{#if editable}
			<button type="button" class="portrait" onclick={onPortraitClick} title="Bild wählen">
				{#if card.image}
					<img src={card.image} alt="" />
				{:else}
					<span class="portrait-hint">Bild</span>
				{/if}
			</button>
		{:else if card.image}
			<img class="portrait" src={card.image} alt="" />
		{/if}
		<div class="title">
			{#if editable}
				<input class="name-input" bind:value={card.name} placeholder="Name" required />
				<input
					class="category-input"
					bind:value={card.category}
					placeholder="Typ (z.B. Tier, Dämon)"
				/>
			{:else}
				<h2>{card.name || 'Unbenannt'}</h2>
				{#if card.category}<span class="category">{card.category}</span>{/if}
			{/if}
		</div>
	</header>

	<div class="columns">
		<div class="body">
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

			<div class="actions">
				{#each card.actions as action, index (action)}
					{#if editable}
						<div
							class="entry-row"
							class:drop-target={dragIndex !== null && dragIndex !== index}
							role="listitem"
							ondragover={(event) => {
								event.preventDefault();
							}}
							ondrop={() => {
								onDrop(index);
							}}
						>
							<span
								class="handle"
								draggable="true"
								role="button"
								tabindex="-1"
								title="Ziehen zum Umsortieren"
								ondragstart={(event) => {
									onDragStart(event, index);
								}}
								ondragend={() => (dragIndex = null)}>⠿</span
							>
							<span class="range">
								{#if index === 0}<span class="bound">1</span>{:else}<input
										class="bound"
										type="number"
										min={ranges[index - 1].from + 1}
										max={ranges[index].to}
										value={ranges[index].from}
										onchange={(event) => {
											setRangeStart(card.actions, index, Number(event.currentTarget.value));
										}}
										title="Bereichsanfang"
									/>{/if}–{#if index === card.actions.length - 1}<span class="bound"
										>{D20_FACES}</span
									>{:else}<input
										class="bound"
										type="number"
										min={ranges[index].from}
										max={D20_FACES - (card.actions.length - 1 - index)}
										value={ranges[index].to}
										onchange={(event) => {
											setRangeEnd(card.actions, index, Number(event.currentTarget.value));
										}}
										title="Bereichsende"
									/>{/if} =
							</span>
							<input class="entry-name" bind:value={action.name} placeholder="Name" />
							<textarea
								class="entry-effect"
								bind:value={action.effect}
								placeholder="Effekt, z.B. 1W6+4 TP"></textarea>
							<button
								type="button"
								class="remove"
								onclick={() => {
									removeAction(index);
								}}
								disabled={card.actions.length <= 1}
								title="Zeile entfernen">✕</button
							>
						</div>
					{:else}
						<p class="entry">
							<b>{rangeLabel(ranges[index])} = {action.name}</b>{#if action.effect}:
								{action.effect}{/if}
						</p>
					{/if}
				{/each}
				{#if editable}
					<button
						type="button"
						class="add"
						onclick={() => {
							addAction(card.actions);
						}}
						disabled={card.actions.length >= D20_FACES}>+ Zeile</button
					>
				{/if}
			</div>

			<div class="talents">
				{#each Object.entries(TALENT_LABELS) as [key, label] (key)}
					{@const talent = card.talents[key as keyof typeof TALENT_LABELS]}
					<div class="talent">
						<b>{label}</b>
						{#if editable}
							<input type="number" min="1" max="20" bind:value={talent.value} title="Wert" />
							(QS <input type="number" min="1" max="6" bind:value={talent.maxQs} title="max. QS" />)
						{:else}
							{talent.value} (QS {talent.maxQs})
						{/if}
					</div>
				{/each}
			</div>

			<div class="wounds">
				<b>Schmerz bei Schaden:</b>
				{thresholds
					.slice(0, 3)
					.map((threshold) => threshold.damage)
					.join(' / ')}
				· <b>Tod:</b>
				{thresholds[3].damage}
			</div>

			{#if editable}
				<div class="special-moves">
					<h3>Spezialmanöver</h3>
					{#each visibleTriggers as trigger (trigger)}
						<div class="entry-row">
							<span class="range">{TRIGGER_LABELS[trigger]} =</span>
							<input
								class="entry-name"
								bind:value={card.specialMoves[trigger].name}
								placeholder="Name"
							/>
							<textarea
								class="entry-effect"
								bind:value={card.specialMoves[trigger].effect}
								placeholder="Effekt"></textarea>
							<button
								type="button"
								class="remove"
								onclick={() => {
									removeTrigger(trigger);
								}}
								title="Entfernen">✕</button
							>
						</div>
					{/each}
					{#if hiddenTriggers.length > 0}
						<div class="add-triggers">
							{#each hiddenTriggers as trigger (trigger)}
								<button
									type="button"
									class="add"
									onclick={() => {
										addTrigger(trigger);
									}}>+ {TRIGGER_LABELS[trigger]}</button
								>
							{/each}
						</div>
					{/if}
				</div>
			{:else if visibleTriggers.length > 0}
				<div class="special-moves">
					<h3>Spezialmanöver</h3>
					{#each visibleTriggers as trigger (trigger)}
						{@const move = card.specialMoves[trigger]}
						<p class="entry">
							<b>{TRIGGER_LABELS[trigger]}{move.name ? ` = ${move.name}` : ''}</b>{#if move.effect}:
								{move.effect}{/if}
						</p>
					{/each}
				</div>
			{/if}

			{#if editable}
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
			{:else if card.notes}
				<p class="notes">{card.notes}</p>
			{/if}
		</div>

		<aside class="badges">
			{#each STAT_BADGES as badge (badge.key)}
				<div class="badge" title={badge.label}>
					<span class="badge-icon"><StatIcon name={badge.icon} /></span>
					{#if editable}
						<input type="number" bind:value={card[badge.key]} />
					{:else}
						<span class="badge-value">{card[badge.key]}</span>
					{/if}
				</div>
			{/each}
		</aside>
	</div>
</article>

<style>
	.card {
		width: 105mm;
		height: 148mm;
		box-sizing: border-box;
		padding: 5mm;
		display: flex;
		flex-direction: column;
		gap: 2mm;
		background: #fff;
		border: 0.4mm solid #1a1a1a;
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

	header {
		display: flex;
		align-items: center;
		gap: 3mm;
	}

	.portrait {
		width: 22mm;
		height: 22mm;
		border-radius: 50%;
		border: 0.4mm solid #1a1a1a;
		object-fit: cover;
		flex-shrink: 0;
	}

	button.portrait {
		padding: 0;
		background: #f0ece2;
		cursor: pointer;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button.portrait img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.portrait-hint {
		color: #888;
		font-size: 7pt;
	}

	.title {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5mm;
		border-bottom: 0.5mm double #1a1a1a;
		padding-bottom: 1mm;
	}

	h2 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 13pt;
	}

	.category {
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: #444;
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

	.badges {
		display: flex;
		flex-direction: column;
		gap: 1.5mm;
		flex-shrink: 0;
	}

	.badge {
		width: 10mm;
		height: 10mm;
		border: 0.4mm solid #1a1a1a;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #fff;
	}

	.badge-icon {
		width: 3.2mm;
		height: 3.2mm;
		display: block;
		line-height: 0;
	}

	.badge-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.badge-value {
		font-weight: bold;
		font-size: 9pt;
		line-height: 1.1;
	}

	.badge input {
		width: 8mm;
		border: none;
		background: transparent;
		text-align: center;
		font: inherit;
		font-weight: bold;
		font-size: 9pt;
		padding: 0;
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.badge input::-webkit-inner-spin-button,
	.badge input::-webkit-outer-spin-button {
		appearance: none;
		margin: 0;
	}

	.flavor {
		margin: 0;
		font-style: italic;
		color: #444;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 1mm;
	}

	.entry {
		margin: 0;
	}

	.entry-row {
		display: flex;
		align-items: center;
		gap: 1mm;
		border-radius: 1mm;
	}

	.entry-row.drop-target {
		outline: 0.3mm dashed #8a7d5c;
	}

	.handle {
		cursor: grab;
		color: #999;
		user-select: none;
	}

	.range {
		font-weight: bold;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
	}

	.range .bound {
		width: 5mm;
		box-sizing: border-box;
		padding: 0;
		text-align: center;
		font-weight: bold;
		display: inline-block;
	}

	.entry-name {
		width: 22mm;
		font-weight: bold;
	}

	.entry-effect {
		flex: 1;
	}

	.wounds {
		padding: 1.5mm 2mm;
		border: 0.3mm solid #1a1a1a;
		border-radius: 1mm;
	}

	.talents {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5mm 2mm;
		padding: 1mm 1.5mm;
		border: 0.3mm solid #1a1a1a;
		border-radius: 1mm;
	}

	.talent {
		display: flex;
		align-items: center;
		gap: 0.5mm;
	}

	.talent input {
		width: 5mm;
		padding: 0;
		text-align: center;
	}

	.editable input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.editable input[type='number']::-webkit-inner-spin-button,
	.editable input[type='number']::-webkit-outer-spin-button {
		appearance: none;
		margin: 0;
	}

	.special-moves {
		display: flex;
		flex-direction: column;
		gap: 1mm;
	}

	.special-moves h3 {
		margin: 0;
		font-size: 8.5pt;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		border-bottom: 0.3mm solid #1a1a1a;
	}

	.special-moves .range {
		width: 22mm;
		justify-content: flex-end;
	}

	.notes {
		margin: 0;
		color: #444;
		font-size: 7.5pt;
	}

	.notes-input {
		color: #444;
		font-size: 7.5pt;
	}

	/* edit controls */
	.editable input,
	.editable textarea {
		font: inherit;
		border: 0.2mm solid transparent;
		border-radius: 0.5mm;
		background: transparent;
		padding: 0.3mm 0.5mm;
	}

	.editable input:hover,
	.editable textarea:hover {
		border-color: #c9c1b2;
	}

	.editable input:focus,
	.editable textarea:focus {
		border-color: #8a7d5c;
		outline: none;
		background: #fdfcf8;
	}

	.editable textarea {
		resize: none;
		field-sizing: content;
		min-height: 1.4em;
		width: 100%;
		box-sizing: border-box;
	}

	.name-input {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 13pt;
		font-weight: bold;
		width: 100%;
		box-sizing: border-box;
	}

	.category-input {
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: #444;
		width: 100%;
		box-sizing: border-box;
	}

	.flavor-input {
		font-style: italic;
		color: #444;
	}

	.removable {
		display: flex;
		align-items: flex-start;
		gap: 1mm;
	}

	.remove,
	.add {
		font: inherit;
		font-size: 7pt;
		border: 0.2mm solid #c9c1b2;
		border-radius: 0.8mm;
		background: #f7f5ef;
		color: #6b6353;
		cursor: pointer;
		padding: 0.2mm 1mm;
	}

	.remove:disabled,
	.add:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.remove {
		flex-shrink: 0;
	}

	.add {
		align-self: flex-start;
	}

	.add-triggers {
		display: flex;
		flex-wrap: wrap;
		gap: 1mm;
	}
</style>
