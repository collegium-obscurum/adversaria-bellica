<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import CardPreview from '$lib/CardPreview.svelte';
	import ImageCropper from '$lib/ImageCropper.svelte';
	import { getCard, upsertCard } from '$lib/storage.svelte';
	import { createEmptyCard, WOUND_TRIGGERS, type WoundTrigger } from '$lib/types';
	import { validateActionRanges } from '$lib/validation';

	const editId = page.url.searchParams.get('id');
	const existing = editId ? getCard(editId) : undefined;

	let card = $state(existing ? structuredClone($state.snapshot(existing)) : createEmptyCard());

	const rangeErrors = $derived(validateActionRanges(card.actions));

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

	function addAction() {
		card.actions.push({ from: 1, to: 1, name: '', effect: '' });
	}

	function removeAction(index: number) {
		card.actions.splice(index, 1);
	}

	function save() {
		if (!card.name.trim()) {
			alert('Die Karte braucht einen Namen.');
			return;
		}
		if (rangeErrors.length > 0) {
			alert('Die W20-Tabelle ist noch nicht gültig.');
			return;
		}
		upsertCard($state.snapshot(card));
		goto(`${base}/`);
	}
</script>

<svelte:head>
	<title>{existing ? 'Karte bearbeiten' : 'Neue Karte'} – Adversaria Bellica</title>
</svelte:head>

<div class="editor">
	<form onsubmit={(event) => { event.preventDefault(); save(); }}>
		<h1>{existing ? 'Karte bearbeiten' : 'Neue Karte'}</h1>

		<fieldset>
			<legend>Allgemein</legend>
			<label>Name <input bind:value={card.name} required /></label>
			<label>Typ <input bind:value={card.category} placeholder="z.B. Tier, Dämon, Untoter" /></label>
			<label>Flavourtext <input bind:value={card.flavorText} /></label>
			<label>Notizen (Immunitäten, Schwächen, Taktik)
				<textarea bind:value={card.notes} rows="2"></textarea>
			</label>
		</fieldset>

		<fieldset>
			<legend>Bild</legend>
			{#if card.image}
				<div class="image-row">
					<img class="current-image" src={card.image} alt="Aktuelles Kartenbild" />
					<button type="button" onclick={() => (card.image = null)}>Bild entfernen</button>
				</div>
			{/if}
			<ImageCropper onApply={(dataUrl) => (card.image = dataUrl)} />
		</fieldset>

		<fieldset>
			<legend>Werte</legend>
			<div class="grid">
				<label>LeP <input type="number" min="1" bind:value={card.lifePoints} /></label>
				<label>RS <input type="number" min="0" bind:value={card.armor} /></label>
				<label>INI <input type="number" bind:value={card.initiative} /></label>
				<label>GS <input type="number" min="0" bind:value={card.speed} /></label>
				<label>Verteidigung <input type="number" min="0" bind:value={card.defense} /></label>
				<label>SK <input type="number" bind:value={card.soulPower} /></label>
				<label>ZK <input type="number" bind:value={card.toughness} /></label>
				<label>Aktionen <input type="number" min="1" bind:value={card.actionCount} /></label>
			</div>
		</fieldset>

		<fieldset>
			<legend>Talentgruppen (1W20-Probe, Wert + max. QS)</legend>
			<div class="grid">
				{#each Object.entries(TALENT_LABELS) as [key, label] (key)}
					<div class="talent">
						<span>{label}</span>
						<label>Wert <input type="number" min="1" max="20" bind:value={card.talents[key as keyof typeof TALENT_LABELS].value} /></label>
						<label>max. QS <input type="number" min="1" max="6" bind:value={card.talents[key as keyof typeof TALENT_LABELS].maxQs} /></label>
					</div>
				{/each}
			</div>
		</fieldset>

		<fieldset>
			<legend>W20-Aktionstabelle (muss 1–20 lückenlos abdecken)</legend>
			{#each card.actions as action, index (index)}
				<div class="action-row">
					<input class="num" type="number" min="1" max="20" bind:value={action.from} aria-label="Von" />
					<span>–</span>
					<input class="num" type="number" min="1" max="20" bind:value={action.to} aria-label="Bis" />
					<input bind:value={action.name} placeholder="Name" aria-label="Name" />
					<input class="wide" bind:value={action.effect} placeholder="Effekt, z.B. 1W6+4 TP" aria-label="Effekt" />
					<button type="button" onclick={() => removeAction(index)} aria-label="Zeile entfernen">✕</button>
				</div>
			{/each}
			<button type="button" onclick={addAction}>+ Zeile</button>
			{#if rangeErrors.length > 0}
				<ul class="errors">
					{#each rangeErrors as error (error)}
						<li>{error}</li>
					{/each}
				</ul>
			{/if}
		</fieldset>

		<fieldset>
			<legend>Spezialmanöver an Wundschwellen (optional)</legend>
			{#each WOUND_TRIGGERS as trigger (trigger)}
				<label>{TRIGGER_LABELS[trigger]}
					<input bind:value={card.specialMoves[trigger]} placeholder="leer = nur Schmerzstufe" />
				</label>
			{/each}
		</fieldset>

		<button type="submit" class="save">Speichern</button>
	</form>

	<aside>
		<h2>Vorschau</h2>
		<CardPreview {card} />
	</aside>
</div>

<style>
	.editor {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	form {
		flex: 1;
		min-width: 24rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	aside {
		position: sticky;
		top: 1rem;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px solid #c9c1b2;
		border-radius: 4px;
		background: #fff;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		font-size: 0.85rem;
	}

	input,
	textarea {
		font: inherit;
		padding: 0.3rem 0.4rem;
		border: 1px solid #c9c1b2;
		border-radius: 3px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	.talent {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.talent > span {
		font-weight: bold;
		font-size: 0.85rem;
	}

	.action-row {
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.action-row .num {
		width: 3.2rem;
	}

	.action-row .wide {
		flex: 1;
	}

	.image-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.current-image {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 2px solid #2b2620;
	}

	.errors {
		margin: 0;
		padding-left: 1.2rem;
		color: #a3231d;
		font-size: 0.85rem;
	}

	.save {
		align-self: flex-start;
		padding: 0.5rem 1.5rem;
		font: inherit;
		font-weight: bold;
		background: #2b2620;
		color: #f5f3ee;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
