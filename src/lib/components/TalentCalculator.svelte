<script lang="ts">
	import {
		ATTRIBUTE_ABBR,
		ATTRIBUTES,
		derivedTalent,
		talentsInSync,
		TALENT_GROUP_ATTRIBUTES,
		TALENT_LABELS
	} from '$lib/domain/talentCalc';
	import { TALENT_KEYS, type MonsterCard } from '$lib/domain/types';

	let { card = $bindable() }: { card: MonsterCard } = $props();

	const inSync = $derived(talentsInSync(card.attributes, card.talents));

	function applyAll() {
		for (const key of TALENT_KEYS) {
			const derived = derivedTalent(card.attributes, card.talents[key].fw, key);
			card.talents[key].value = derived.value;
			card.talents[key].maxQs = derived.maxQs;
		}
	}
</script>

<section class="talent-calc">
	<h2>Talentwerte</h2>

	<details class="help">
		<summary>Formeln &amp; Hinweise</summary>
		<div class="formula">
			<span>Wert =</span>
			<span class="frac">
				<span class="numerator">E1 + E2 + E3 − 25</span>
				<span>2</span>
			</span>
			<span>+ FW</span>
		</div>
		<div class="formula">
			<span>QS =</span>
			<span class="frac">
				<span class="numerator">FW</span>
				<span>3</span>
			</span>
		</div>
		<p class="note">
			FW = Fertigkeitswert des mittleren gelisteten Talents der Gruppe (bei gerader Anzahl der
			niedrigere der beiden mittleren).
		</p>
		<p class="note">Divisionen werden aufgerundet · Wert und QS mindestens 1</p>
	</details>

	<h3>Eigenschaften</h3>
	<div class="attributes">
		{#each ATTRIBUTES as attribute (attribute.key)}
			<label title={attribute.label}>
				<span>{attribute.abbr}</span>
				<input type="number" bind:value={card.attributes[attribute.key]} />
			</label>
		{/each}
	</div>

	<h3>Talentgruppen</h3>
	<ul class="groups">
		{#each TALENT_KEYS as key (key)}
			{@const derived = derivedTalent(card.attributes, card.talents[key].fw, key)}
			{@const stale =
				derived.value !== card.talents[key].value || derived.maxQs !== card.talents[key].maxQs}
			<li>
				<span class="group">
					<b>{TALENT_LABELS[key]}</b>
					<span class="attrs"
						>{TALENT_GROUP_ATTRIBUTES[key].map((attr) => ATTRIBUTE_ABBR[attr]).join(' · ')}</span
					>
				</span>
				<label class="fw">
					FW <input type="number" min="0" bind:value={card.talents[key].fw} />
				</label>
				<span class="result" class:stale title={stale ? 'Weicht vom Kartenwert ab' : undefined}>
					= <b>{derived.value}</b> (QS <b>{derived.maxQs}</b>)
				</span>
			</li>
		{/each}
	</ul>

	<footer>
		<button type="button" class="apply" disabled={inSync} onclick={applyAll}>
			Auf Karte übernehmen
		</button>
		{#if inSync}
			<span class="sync-hint">Kartenwerte sind aktuell</span>
		{/if}
	</footer>
</section>

<style>
	.talent-calc {
		font-size: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 17rem;
	}

	h2 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 1rem;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--color-brand);
	}

	/* extra space above only, so each header hugs the section it introduces */
	h3 {
		margin: 0.6rem 0 0;
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.help {
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius);
		padding: 0.4rem 0.6rem;
	}

	.help summary {
		cursor: pointer;
		font-size: 0.8rem;
		color: var(--color-muted);
	}

	.help[open] summary {
		margin-bottom: 0.5rem;
	}

	.formula {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		margin-bottom: 0.4rem;
		white-space: nowrap;
	}

	.frac {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
	}

	.numerator {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0 0.2rem 0.15rem;
		border-bottom: 1px solid currentcolor;
		margin-bottom: 0.15rem;
	}

	.attributes {
		display: grid;
		grid-template-columns: repeat(4, auto);
		gap: 0.5rem 0.9rem;
		justify-content: start;
	}

	.attributes label {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.attributes span {
		font-weight: bold;
		width: 1.4rem;
	}

	.groups {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.groups li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 0.75rem;
		padding: 0.4rem 0;
	}

	.groups li + li {
		border-top: 1px solid var(--color-border-soft);
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.attrs {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.fw {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		white-space: nowrap;
	}

	.result {
		white-space: nowrap;
		min-width: 6rem;
		text-align: right;
	}

	.result.stale {
		color: var(--color-brand);
	}

	.result.stale::before {
		content: '●';
		font-size: 0.55em;
		vertical-align: middle;
		margin-right: 0.35rem;
	}

	input {
		font: inherit;
		width: 2rem;
		padding: 0.2rem 0.1rem;
		text-align: center;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		appearance: textfield;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		appearance: none;
		margin: 0;
	}

	.note {
		margin: 0 0 0.4rem;
		max-width: 20rem;
		font-size: 0.8rem;
		color: #6b6152;
	}

	footer {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.apply {
		font: inherit;
		font-weight: bold;
		padding: 0.4rem 0.9rem;
		background: var(--color-brand);
		color: var(--color-cream);
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
	}

	.apply:hover:not(:disabled) {
		background: var(--color-brand-hover);
	}

	.apply:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.sync-hint {
		font-size: 0.8rem;
		color: var(--color-muted);
	}
</style>
