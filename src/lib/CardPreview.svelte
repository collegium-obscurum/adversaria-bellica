<script lang="ts">
	import type { MonsterCard, WoundTrigger } from './types';
	import { woundThresholds } from './wounds';

	let { card }: { card: MonsterCard } = $props();

	const thresholds = $derived(woundThresholds(card.lifePoints));

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

	const specialMoves = $derived(
		(Object.entries(TRIGGER_LABELS) as [WoundTrigger, string][])
			.filter(([trigger]) => card.specialMoves[trigger].trim() !== '')
			.map(([trigger, label]) => ({ label, text: card.specialMoves[trigger] }))
	);

	const sortedActions = $derived([...card.actions].sort((a, b) => a.from - b.from));

	function rangeLabel(from: number, to: number): string {
		return from === to ? String(from) : `${from}–${to}`;
	}
</script>

<article class="card">
	<header>
		<div class="title">
			<h2>{card.name || 'Unbenannt'}</h2>
			{#if card.category}<span class="category">{card.category}</span>{/if}
			{#if card.flavorText}<p class="flavor">{card.flavorText}</p>{/if}
		</div>
		{#if card.image}
			<img src={card.image} alt="" />
		{/if}
	</header>

	<div class="stats">
		<div><b>LeP</b> {card.lifePoints}</div>
		<div><b>RS</b> {card.armor}</div>
		<div><b>INI</b> {card.initiative}</div>
		<div><b>GS</b> {card.speed}</div>
		<div><b>VW</b> {card.defense}</div>
		<div><b>SK</b> {card.soulPower}</div>
		<div><b>ZK</b> {card.toughness}</div>
		<div><b>Aktionen</b> {card.actionCount}</div>
	</div>

	<div class="talents">
		{#each Object.entries(TALENT_LABELS) as [key, label] (key)}
			{@const talent = card.talents[key as keyof typeof TALENT_LABELS]}
			<div><b>{label}</b> {talent.value} (QS {talent.maxQs})</div>
		{/each}
	</div>

	<table class="actions">
		<tbody>
			{#each sortedActions as action, index (index)}
				<tr>
					<td class="range">{rangeLabel(action.from, action.to)}</td>
					<td><b>{action.name}</b>{#if action.effect}: {action.effect}{/if}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="wounds">
		<b>Schmerz bei Schaden:</b>
		{thresholds
			.slice(0, 3)
			.map((threshold) => threshold.damage)
			.join(' / ')}
		· <b>Tod:</b> {thresholds[3].damage}
	</div>

	{#if specialMoves.length > 0}
		<ul class="special-moves">
			{#each specialMoves as move (move.label)}
				<li><b>{move.label}:</b> {move.text}</li>
			{/each}
		</ul>
	{/if}

	{#if card.notes}
		<p class="notes">{card.notes}</p>
	{/if}
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

	header {
		display: flex;
		justify-content: space-between;
		gap: 3mm;
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

	.flavor {
		margin: 1mm 0 0;
		font-style: italic;
		color: #444;
	}

	header img {
		width: 22mm;
		height: 22mm;
		border-radius: 50%;
		border: 0.4mm solid #1a1a1a;
		object-fit: cover;
		flex-shrink: 0;
	}

	.stats,
	.talents {
		display: flex;
		flex-wrap: wrap;
		gap: 1mm 3mm;
		padding: 1.5mm 2mm;
		border: 0.3mm solid #1a1a1a;
		border-radius: 1mm;
	}

	.actions {
		border-collapse: collapse;
		width: 100%;
	}

	.actions td {
		border: 0.3mm solid #1a1a1a;
		padding: 1mm 1.5mm;
		vertical-align: top;
	}

	.actions .range {
		width: 8mm;
		text-align: center;
		font-weight: bold;
		font-variant-numeric: tabular-nums;
	}

	.wounds {
		padding: 1.5mm 2mm;
		border: 0.3mm solid #1a1a1a;
		border-radius: 1mm;
	}

	.special-moves {
		margin: 0;
		padding-left: 4mm;
	}

	.notes {
		margin: 0;
		color: #444;
		font-size: 7.5pt;
	}
</style>
