<script lang="ts">
	import {
		ATTRIBUTE_ABBR,
		ATTRIBUTES,
		derivedTalent,
		TALENT_GROUP_ATTRIBUTES,
		TALENT_LABELS
	} from '$lib/domain/talentCalc';
	import { TALENT_KEYS, type MonsterCard } from '$lib/domain/types';

	let { card = $bindable() }: { card: MonsterCard } = $props();
</script>

<section class="talent-calc">
	<h2>Talentwerte</h2>
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
	<div class="attributes">
		{#each ATTRIBUTES as attribute (attribute.key)}
			<label title={attribute.label}>
				<span>{attribute.abbr}</span>
				<input type="number" bind:value={card.attributes[attribute.key]} />
			</label>
		{/each}
	</div>
	<table>
		<tbody>
			{#each TALENT_KEYS as key (key)}
				{@const derived = derivedTalent(card.attributes, card.talents[key].fw, key)}
				<tr>
					<th>{TALENT_LABELS[key]}</th>
					<td>{TALENT_GROUP_ATTRIBUTES[key].map((attr) => ATTRIBUTE_ABBR[attr]).join(', ')}</td>
					<td class="fw-cell">
						FW <input type="number" min="0" bind:value={card.talents[key].fw} aria-label="FW" />
					</td>
					<td class="result">= <b>{derived.value}</b> (QS <b>{derived.maxQs}</b>)</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="note">Divisionen werden aufgerundet · Wert und QS mindestens 1</p>
</section>

<style>
	.talent-calc {
		font-size: 0.9rem;
	}

	h2 {
		margin: 0 0 0.5rem;
		font-family: var(--font-serif);
		font-size: 1rem;
		font-variant: small-caps;
		letter-spacing: 0.05em;
		color: var(--color-brand);
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
		gap: 0.3rem 0.5rem;
		justify-content: start;
		margin: 0.5rem 0;
	}

	.attributes label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.attributes span {
		font-weight: bold;
		width: 1.4rem;
	}

	table {
		border-collapse: collapse;
		margin: 0.5rem 0;
	}

	th {
		text-align: left;
		padding-right: 0.6rem;
		font-weight: bold;
	}

	td {
		padding-right: 0.6rem;
	}

	.fw-cell {
		white-space: nowrap;
	}

	.result {
		white-space: nowrap;
		padding-right: 0;
	}

	input {
		font: inherit;
		width: 1.8rem;
		padding: 0.15rem 0.1rem;
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
		margin: 0.4rem 0 0;
		max-width: 20rem;
		font-size: 0.8rem;
		color: #6b6152;
	}
</style>
