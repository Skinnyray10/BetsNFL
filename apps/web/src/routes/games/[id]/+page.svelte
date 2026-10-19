<script lang="ts">
	import { formatDate, percent } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function getConfidenceColor(confidence: number): string {
		if (confidence >= 0.7) return 'text-green-400';
		if (confidence >= 0.5) return 'text-gold';
		return 'text-amber-400';
	}

	function getStakeColor(stake: number): string {
		if (stake >= 7) return 'bg-green-500/20 border-green-500/40 text-green-300';
		if (stake >= 4) return 'bg-gold/20 border-gold/40 text-gold';
		return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
	}

	function getStakeLabel(stake: number): string {
		if (stake >= 7) return 'High';
		if (stake >= 4) return 'Medium';
		return 'Low';
	}
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
			<a href="/teams/{game.away.id}" class="group rounded-xl border border-white/10 bg-turf/70 p-5 transition hover:border-gold/40">
				<div class="flex items-center gap-3">
					{#if game.away.logo}
						<img src={game.away.logo} alt={game.away.name} class="h-14 w-14 object-contain drop-shadow-lg" />
					{/if}
					<div class="flex-1">
						<p class="text-xs text-white/40">Away</p>
						<p class="text-lg font-medium group-hover:text-gold transition">{game.away.name}</p>
					</div>
					<p class="text-gold text-3xl font-bold">{game.away.score ?? '—'}</p>
				</div>
				{#if forecast}
					<div class="mt-4 flex items-center gap-2">
						<div class="flex-1">
							<div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
								<div
									class="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
									style="width: {forecast.awayWinProb * 100}%"
								></div>
							</div>
						</div>
						<span class="text-sm font-semibold text-white/70">{percent(forecast.awayWinProb)}</span>
					</div>
				{/if}
			</a>
			<a href="/teams/{game.home.id}" class="group rounded-xl border border-white/10 bg-turf/70 p-5 transition hover:border-gold/40">
				<div class="flex items-center gap-3">
					{#if game.home.logo}
						<img src={game.home.logo} alt={game.home.name} class="h-14 w-14 object-contain drop-shadow-lg" />
					{/if}
					<div class="flex-1">
						<p class="text-xs text-white/40">Home</p>
						<p class="text-lg font-medium group-hover:text-gold transition">{game.home.name}</p>
					</div>
					<p class="text-gold text-3xl font-bold">{game.home.score ?? '—'}</p>
				</div>
				{#if forecast}
					<div class="mt-4 flex items-center gap-2">
						<div class="flex-1">
							<div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
								<div
									class="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
									style="width: {forecast.homeWinProb * 100}%"
								></div>
							</div>
						</div>
						<span class="text-sm font-semibold text-white/70">{percent(forecast.homeWinProb)}</span>
					</div>
				{/if}
			</a>
		</div>
	{/if}

	{#if forecast}
		<!-- Prediction Header -->
		<section class="mt-8 rounded-xl border border-white/10 bg-turf/70 p-6">
			<div class="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<p class="text-xs text-white/40">
						{forecast.kind === 'result_analysis' ? 'Result Analysis' : 'AI Forecast'}
					</p>
					<p class="mt-2 text-2xl font-semibold text-gold">{forecast.winnerName}</p>
					<p class="mt-2 text-sm text-white/60">
						Predicted: {forecast.awayScore}–{forecast.homeScore} · Spread: {forecast.spreadHome.toFixed(1)} · Total: {forecast.total}
					</p>
				</div>
				<div class="flex flex-col items-end gap-2">
					<div class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
						<span class="text-xs text-white/50">Confidence</span>
						<span class="text-sm font-bold {getConfidenceColor(forecast.confidence)}">{percent(forecast.confidence)}</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Betting Guidance -->
		{#if forecast.kind === 'forecast'}
			<section class="mt-4 rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-950/40 to-amber-900/20 p-6">
				<h2 class="flex items-center gap-2 text-sm font-semibold text-amber-200">
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Betting Guidance
				</h2>
				<div class="mt-4 grid gap-4 sm:grid-cols-3">
					<div class="rounded-lg border {getStakeColor(forecast.stake)} p-4">
						<p class="text-xs uppercase tracking-wider opacity-70">Suggested Stake</p>
						<p class="mt-1 text-2xl font-bold">{forecast.stake}<span class="text-base font-normal">/10</span></p>
						<p class="mt-1 text-xs opacity-70">{getStakeLabel(forecast.stake)} Risk</p>
					</div>
					<div class="rounded-lg border border-white/10 bg-white/5 p-4">
						<p class="text-xs uppercase tracking-wider text-white/50">Min Acceptable Odds</p>
						<p class="mt-1 text-2xl font-bold text-white">{forecast.minOdds.toFixed(2)}</p>
						<p class="mt-1 text-xs text-white/50">Decimal format</p>
					</div>
					<div class="rounded-lg border border-white/10 bg-white/5 p-4">
						<p class="text-xs uppercase tracking-wider text-white/50">Estimated Edge</p>
						<p class="mt-1 text-sm leading-relaxed text-white/80">{forecast.value}</p>
					</div>
				</div>
			</section>
		{/if}

		<!-- Key Factors -->
		<section class="mt-4 rounded-xl border border-white/10 bg-turf/70 p-6">
			<h2 class="text-sm font-semibold text-white/70">Key Factors</h2>
			<ul class="mt-3 space-y-2">
				{#each forecast.keyFactors as factor}
					<li class="flex items-start gap-2">
						<span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"></span>
						<span class="text-sm leading-relaxed text-white/80">{factor}</span>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Rationale -->
		<section class="mt-4 rounded-xl border border-white/10 bg-turf/70 p-6">
			<h2 class="text-sm font-semibold text-white/70">Analysis</h2>
			<p class="mt-3 text-sm leading-relaxed text-white/80">{forecast.rationale}</p>
		</section>

		<!-- Warning -->
		<div class="mt-4 rounded-xl border border-red-400/30 bg-red-950/30 p-4">
			<div class="flex items-start gap-3">
				<svg class="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<p class="text-xs leading-relaxed text-red-200">{forecast.warning}</p>
			</div>
		</div>
	{/if}
{/if}
