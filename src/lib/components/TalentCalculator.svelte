<script lang="ts">
	import { TALENT_GROUP_ATTRIBUTES, talentMaxQs, talentValue } from '$lib/domain/talentCalc';
	import { TALENT_KEYS, type TalentKey } from '$lib/domain/types';

	const TALENT_LABELS: Record<TalentKey, string> = {
		body: 'Körper',
		social: 'Gesellschaft',
		nature: 'Natur',
		knowledge: 'Wissen',
		craft: 'Handwerk'
	};

	let attr1 = $state(10);
	let attr2 = $state(10);
	let attr3 = $state(10);
	let fw = $state(5);

	const value = $derived(talentValue(attr1, attr2, attr3, fw));
	const maxQs = $derived(talentMaxQs(fw));
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
	<table>
		<tbody>
			{#each TALENT_KEYS as key (key)}
				<tr>
					<th>{TALENT_LABELS[key]}</th>
					<td>{TALENT_GROUP_ATTRIBUTES[key].join(', ')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="formula calc-row">
		<span class="frac">
			<span class="numerator">
				<input type="number" bind:value={attr1} aria-label="Eigenschaft 1" />
				<span>+</span>
				<input type="number" bind:value={attr2} aria-label="Eigenschaft 2" />
				<span>+</span>
				<input type="number" bind:value={attr3} aria-label="Eigenschaft 3" />
				<span>− 25</span>
			</span>
			<span>2</span>
		</span>
		<span>+</span>
		<input
			type="number"
			min="0"
			bind:value={fw}
			aria-label="FW"
			title="FW des mittleren gelisteten Talents der Gruppe"
		/>
		<span>=</span>
		<b>{value}</b>
		<span>(QS <b>{maxQs}</b>)</span>
	</div>
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

	table {
		border-collapse: collapse;
		margin: 0.5rem 0;
	}

	th {
		text-align: left;
		padding-right: 0.6rem;
		font-weight: bold;
	}

	.calc-row {
		font-size: 1rem;
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
