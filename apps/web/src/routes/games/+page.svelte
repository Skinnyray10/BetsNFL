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
									class="h-12 w-12 object-contain drop-shadow-lg"
								/>
							{:else}
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
									{game.away.abbreviation || '?'}
								</div>
							{/if}
							<p class="text-center text-sm font-medium">{game.away.name}</p>
							{#if forecast}
								<div class="w-full pt-1">
									<div class="mb-1 flex justify-between text-xs">
										<span class="text-white/60">{percent(forecast.awayWinProb)}</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
										<div
											class="h-full transition-all duration-500 {getProbBarColor(forecast.awayWinProb)}"
											style="width: {forecast.awayWinProb * 100}%"
										></div>
									</div>
								</div>
							{/if}
						</div>

						<!-- Score / VS -->
						<div class="mx-4 flex flex-col items-center">
							{#if game.away.score && game.home.score}
								<div class="text-xl font-bold text-gold">
									{game.away.score}
								</div>
								<div class="my-0.5 text-sm text-white/30">–</div>
								<div class="text-xl font-bold text-gold">
									{game.home.score}
								</div>
							{:else}
								<div class="text-sm font-semibold text-white/30">VS</div>
							{/if}
						</div>

						<!-- Home Team -->
						<div class="flex flex-1 flex-col items-center gap-2">
							{#if game.home.logo}
								<img
									src={game.home.logo}
									alt={game.home.name}
									class="h-12 w-12 object-contain drop-shadow-lg"
								/>
							{:else}
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
									{game.home.abbreviation || '?'}
								</div>
							{/if}
							<p class="text-center text-sm font-medium">{game.home.name}</p>
							{#if forecast}
								<div class="w-full pt-1">
									<div class="mb-1 flex justify-between text-xs">
										<span class="text-white/60">{percent(forecast.homeWinProb)}</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
										<div
											class="h-full transition-all duration-500 {getProbBarColor(forecast.homeWinProb)}"
											style="width: {forecast.homeWinProb * 100}%"
										></div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</a>
		{/each}
	</div>
{/if}
