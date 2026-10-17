<script lang="ts">
	import { onMount } from 'svelte';
	import type { NflPrediction } from '@bets/shared';
	import { apiGet } from '#lib/api.js';
	import { formatDate, percent } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let predictions = $state<NflPrediction[]>([]);
	let predError = $state<string | null>(null);
	let predLoading = $state(true);

	onMount(async () => {
		try {
			const result = await apiGet<{ predictions: NflPrediction[] }>('/api/predictions');
			predictions = result.predictions;
		} catch (error) {
			predError = error instanceof Error ? error.message : 'Unable to load forecasts';
		} finally {
			predLoading = false;
		}
	});

	function forGame(id: string) {
		return predictions.find((item) => item.gameId === id);
	}
</script>

<section class="mb-8">
	<p class="text-gold text-xs font-medium tracking-[0.2em] uppercase">RapidAPI facts · Claude forecast</p>
	<h1 class="mt-1 text-3xl font-semibold">Games</h1>
	<p class="mt-2 max-w-2xl text-sm text-white/50">
		Scores and standings come from the sports API. Win probabilities and predicted scores are generated
		on the server by Claude. Not betting advice.
	</p>
</section>

{#if data.error}
	<p class="rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">{data.error}</p>
{:else if data.games.length === 0}
	<p class="text-white/50">No games in the current RapidAPI payload.</p>
{:else}
	{#if predError}
		<p class="mb-4 text-sm text-amber-200/80">{predError}</p>
	{/if}
	<ul class="space-y-3">
		{#each data.games as game (game.id)}
			{@const forecast = forGame(game.id)}
			<li class="rounded-xl border border-white/10 bg-turf/70 p-4">
				<a href="/games/{game.id}" class="block">
					<p class="text-xs text-white/40">{formatDate(game.date)} · {game.status}</p>
					<p class="mt-1 font-medium">{game.name}</p>
					{#if game.away && game.home}
						<div class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
							<span>{game.away.name}</span>
							<span class="text-gold font-semibold">{game.away.score ?? '—'} – {game.home.score ?? '—'}</span>
							<span class="text-right">{game.home.name}</span>
						</div>
					{/if}
				</a>
				{#if predLoading}
					<p class="mt-3 text-xs text-white/40">Forecasting…</p>
				{:else if forecast}
					<div class="mt-3 border-t border-white/10 pt-3 text-sm">
						<p class="text-gold">
							{forecast.kind === 'result_analysis' ? 'Result' : 'Pick'}: {forecast.winnerName}
							<span class="text-white/50">
								({percent(forecast.awayWinProb)} / {percent(forecast.homeWinProb)})
							</span>
						</p>
						<p class="mt-1 text-white/60">
							Projected {forecast.awayScore}–{forecast.homeScore} · total {forecast.total} · home spread {forecast.spreadHome}
						</p>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
