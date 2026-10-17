<script lang="ts">
	import { formatDate, percent } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#if data.error || !data.game}
	<p class="text-red-100">{data.error ?? 'Game not found.'}</p>
{:else}
	{@const game = data.game}
	{@const forecast = data.prediction}
	<p class="text-gold text-xs font-medium tracking-[0.2em] uppercase">Game detail</p>
	<h1 class="mt-1 text-3xl font-semibold">{game.name}</h1>
	<p class="mt-1 text-sm text-white/50">{formatDate(game.date)} · {game.status}</p>

	{#if game.away && game.home}
		<div class="mt-6 grid gap-3 sm:grid-cols-2">
			<a href="/teams/{game.away.id}" class="rounded-xl border border-white/10 bg-turf/70 p-4">
				<p class="text-xs text-white/40">Away</p>
				<p class="text-lg font-medium">{game.away.name}</p>
				<p class="text-gold mt-1 text-2xl">{game.away.score ?? '—'}</p>
			</a>
			<a href="/teams/{game.home.id}" class="rounded-xl border border-white/10 bg-turf/70 p-4">
				<p class="text-xs text-white/40">Home</p>
				<p class="text-lg font-medium">{game.home.name}</p>
				<p class="text-gold mt-1 text-2xl">{game.home.score ?? '—'}</p>
			</a>
		</div>
	{/if}

	{#if forecast}
		<section class="mt-8 rounded-xl border border-white/10 bg-turf/70 p-5">
			<p class="text-xs text-white/40">
				{forecast.kind === 'result_analysis' ? 'Claude result analysis' : 'Claude forecast'} · confidence {percent(forecast.confidence)}
			</p>
			<p class="mt-2 text-xl font-semibold">{forecast.winnerName}</p>
			<p class="mt-1 text-sm text-white/60">
				{forecast.awayScore}–{forecast.homeScore} · away {percent(forecast.awayWinProb)} / home {percent(forecast.homeWinProb)} · spread {forecast.spreadHome} · total {forecast.total}
			</p>
			<ul class="mt-4 list-disc space-y-1 pl-5 text-sm text-white/70">
				{#each forecast.keyFactors as factor}
					<li>{factor}</li>
				{/each}
			</ul>
			<p class="mt-4 text-sm leading-relaxed text-white/70">{forecast.rationale}</p>
			<p class="mt-4 text-xs text-white/40">Informational only. Not betting advice.</p>
		</section>
	{/if}
{/if}
