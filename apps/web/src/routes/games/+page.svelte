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
	let fallbackMode = $state(false);

	onMount(async () => {
		try {
			const result = await apiGet<{ predictions: NflPrediction[]; fallback?: boolean }>('/api/predictions');
			predictions = result.predictions;
			fallbackMode = result.fallback || false;
		} catch (error) {
			predError = error instanceof Error ? error.message : 'Unable to load forecasts';
		} finally {
			predLoading = false;
		}
	});

	function forGame(id: string) {
		return predictions.find((item) => item.gameId === id);
	}

	function getProbBarColor(prob: number): string {
		if (prob >= 0.7) return 'bg-green-500';
		if (prob >= 0.5) return 'bg-gold';
		return 'bg-red-500';
	}
</script>

<section class="mb-8">
	<p class="text-gold text-xs font-medium tracking-[0.2em] uppercase">ESPN facts · AI forecast</p>
	<h1 class="mt-1 text-3xl font-semibold">Games</h1>
	<p class="mt-2 max-w-2xl text-sm text-white/50">
		Scores and standings come from ESPN. Win probabilities and predicted scores are generated
		on the server by AI. Not betting advice.
	</p>
	{#if fallbackMode}
		<div class="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-950/40 px-3 py-1.5 text-xs text-amber-200">
			<span class="h-2 w-2 rounded-full bg-amber-400"></span>
			Using fallback prediction system
		</div>
	{/if}
</section>

{#if data.error}
	<p class="rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">{data.error}</p>
{:else if data.games.length === 0}
	<p class="text-white/50">No games available.</p>
{:else}
	{#if predError}
		<p class="mb-4 text-sm text-amber-200/80">{predError}</p>
	{/if}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.games as game (game.id)}
			{@const forecast = forGame(game.id)}
			<a
				href="/games/{game.id}"
				class="group relative overflow-hidden rounded-2xl border border-white/10 bg-turf/70 p-5 transition-all hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
			>
				{#if game.away && game.home}
					<div class="flex items-center justify-between">
						<!-- Away Team -->
						<div class="flex flex-1 flex-col items-center gap-2">
							{#if game.away.logo}
								<img
									src={game.away.logo}
									alt={game.away.name}
									class="h-12 w-12 object-contain drop-shadow-lg transition group-hover:scale-110"
								/>
							{:else}
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
									{game.away.abbreviation || '?'}
								</div>
							{/if}
							<p class="text-center text-sm font-medium">{game.away.name}</p>
							{#if forecast}
								<div class="w-full pt-1">
									<div class="mb-1 flex justify-center text-xs">
										<span class="font-semibold text-white/70">{percent(forecast.awayWinProb)}</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
										<div
											class="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
											style="width: {forecast.awayWinProb * 100}%"
										></div>
									</div>
								</div>
							{/if}
						</div>

						<!-- Score / VS -->
						<div class="mx-4 flex flex-col items-center justify-center gap-1">
							{#if game.away.score && game.home.score}
								<div class="text-xl font-bold text-gold">
									{game.away.score}
								</div>
								<div class="text-xs text-white/30">—</div>
								<div class="text-xl font-bold text-gold">
									{game.home.score}
								</div>
							{:else}
								<div class="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/40">VS</div>
								{#if forecast && forecast.kind === 'forecast'}
									<div class="mt-1 flex flex-col items-center gap-0.5">
										<div class="text-xs text-white/30">Pred</div>
										<div class="text-sm font-semibold text-gold/80">{forecast.awayScore}–{forecast.homeScore}</div>
									</div>
								{/if}
							{/if}
						</div>

						<!-- Home Team -->
						<div class="flex flex-1 flex-col items-center gap-2">
							{#if game.home.logo}
								<img
									src={game.home.logo}
									alt={game.home.name}
									class="h-12 w-12 object-contain drop-shadow-lg transition group-hover:scale-110"
								/>
							{:else}
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
									{game.home.abbreviation || '?'}
								</div>
							{/if}
							<p class="text-center text-sm font-medium">{game.home.name}</p>
							{#if forecast}
								<div class="w-full pt-1">
									<div class="mb-1 flex justify-center text-xs">
										<span class="font-semibold text-white/70">{percent(forecast.homeWinProb)}</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
										<div
											class="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
											style="width: {forecast.homeWinProb * 100}%"
										></div>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Betting Info Footer (solo para forecasts) -->
					{#if forecast && forecast.kind === 'forecast'}
						<div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
							<div class="flex items-center gap-1.5">
								<span class="text-white/40">Stake:</span>
								<span class="font-semibold {forecast.stake >= 5 ? 'text-green-400' : 'text-gold'}">{forecast.stake}/10</span>
							</div>
							<div class="flex items-center gap-1.5">
								<span class="text-white/40">Min Odds:</span>
								<span class="font-semibold text-white/70">{forecast.minOdds.toFixed(2)}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<span class="text-white/40">Conf:</span>
								<span class="font-semibold {forecast.confidence >= 0.7 ? 'text-green-400' : forecast.confidence >= 0.5 ? 'text-gold' : 'text-amber-400'}">{percent(forecast.confidence)}</span>
							</div>
						</div>
					{/if}
				{/if}
			</a>
		{/each}
	</div>
{/if}
