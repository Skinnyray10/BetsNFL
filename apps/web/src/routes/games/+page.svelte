<script lang="ts">
	import { onMount } from 'svelte';
	import type { NflPrediction } from '@bets/shared';
	import { apiGet } from '#lib/api.js';
	import { formatDate, percent } from '#lib/format.js';
	import type { PageProps } from './$types';
	import { GlassCard } from '#lib/components/glass';
	import { Button } from '#lib/components/brutal';
	import { ProbabilityBar, ConfidenceGauge } from '#lib/components/data';
	import { FilterPanel } from '#lib/components/composite';
	import { gameFilters } from '#lib/stores/filters.js';

	let { data }: PageProps = $props();
	let predictions = $state<NflPrediction[]>([]);
	let predError = $state<string | null>(null);
	let predLoading = $state(true);
	let fallbackMode = $state(false);
	let filterPanelOpen = $state(false);

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

	// Derived state: filtrar y ordenar juegos
	const filteredGames = $derived(() => {
		if (!data.games) return [];

		let filtered = data.games.filter(game => {
			const forecast = forGame(game.id);

			// Filter by status
			if ($gameFilters.status !== 'all') {
				const isCompleted = game.status === 'STATUS_FINAL';
				const isLive = game.status === 'STATUS_IN_PROGRESS';
				const isUpcoming = !isCompleted && !isLive;

				if ($gameFilters.status === 'completed' && !isCompleted) return false;
				if ($gameFilters.status === 'live' && !isLive) return false;
				if ($gameFilters.status === 'upcoming' && !isUpcoming) return false;
			}

			// Filter by conference
			if ($gameFilters.conference !== 'all') {
				const homeConf = game.home?.conference;
				const awayConf = game.away?.conference;
				if (homeConf !== $gameFilters.conference && awayConf !== $gameFilters.conference) {
					return false;
				}
			}

			// Filter by minimum confidence
			if (forecast && forecast.kind === 'forecast') {
				if (forecast.confidence * 100 < $gameFilters.confidenceMin) return false;

				// Filter by minimum edge
				const edge = Math.abs(forecast.homeWinProb - 0.5) * 100;
				if (edge < $gameFilters.edgeMin) return false;
			} else {
				// Si no hay predicción y los filtros requieren confidence/edge, excluir
				if ($gameFilters.confidenceMin > 0 || $gameFilters.edgeMin > 0) return false;
			}

			return true;
		});

		// Sort games
		filtered.sort((a, b) => {
			const forecastA = forGame(a.id);
			const forecastB = forGame(b.id);

			switch ($gameFilters.sortBy) {
				case 'confidence':
					if (!forecastA || forecastA.kind !== 'forecast') return 1;
					if (!forecastB || forecastB.kind !== 'forecast') return -1;
					return forecastB.confidence - forecastA.confidence;

				case 'edge':
					if (!forecastA || forecastA.kind !== 'forecast') return 1;
					if (!forecastB || forecastB.kind !== 'forecast') return -1;
					const edgeA = Math.abs(forecastA.homeWinProb - 0.5);
					const edgeB = Math.abs(forecastB.homeWinProb - 0.5);
					return edgeB - edgeA;

				case 'alphabetical':
					const nameA = a.home?.name || a.away?.name || '';
					const nameB = b.home?.name || b.away?.name || '';
					return nameA.localeCompare(nameB);

				case 'date':
				default:
					return new Date(a.date).getTime() - new Date(b.date).getTime();
			}
		});

		return filtered;
	});

	function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
		if (confidence >= 0.7) return 'high';
		if (confidence >= 0.5) return 'medium';
		return 'low';
	}

	function getEdge(forecast: NflPrediction): number {
		if (forecast.kind !== 'forecast') return 0;
		return Math.abs(forecast.homeWinProb - 0.5) * 100;
	}
</script>

<!-- Filter Panel -->
<FilterPanel open={filterPanelOpen} onClose={() => filterPanelOpen = false} />

<!-- Header Section -->
<section class="header-section">
	<div class="header-content">
		<div class="header-text">
			<div class="header-label">ESPN Data · AI Predictions</div>
			<h1 class="header-title">NFL Games</h1>
			<p class="header-description">
				Live scores and standings from ESPN. Win probabilities powered by AI analysis.
				All predictions are for informational purposes only.
			</p>
			{#if fallbackMode}
				<div class="fallback-badge">
					<span class="fallback-dot"></span>
					Using fallback prediction system
				</div>
			{/if}
		</div>

		<div class="header-actions">
			<Button variant="secondary" onclick={() => filterPanelOpen = true}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
				</svg>
				Filters
				{#if $gameFilters.status !== 'all' || $gameFilters.conference !== 'all' || $gameFilters.confidenceMin > 0 || $gameFilters.edgeMin > 0}
					<span class="filter-count">{
						($gameFilters.status !== 'all' ? 1 : 0) +
						($gameFilters.conference !== 'all' ? 1 : 0) +
						($gameFilters.confidenceMin > 0 ? 1 : 0) +
						($gameFilters.edgeMin > 0 ? 1 : 0)
					}</span>
				{/if}
			</Button>
		</div>
	</div>
</section>

<!-- Error State -->
{#if data.error}
	<div class="error-card">
		<div class="error-icon">⚠️</div>
		<div class="error-content">
			<p class="error-title">{data.error}</p>
			<p class="error-description">Unable to load games. Please check your connection and try again.</p>
		</div>
	</div>
{:else if predLoading}
	<!-- Loading State -->
	<div class="loading-grid">
		{#each Array(6) as _}
			<GlassCard variant="default" class="loading-card">
				<div class="skeleton-pulse"></div>
			</GlassCard>
		{/each}
	</div>
{:else if filteredGames().length === 0}
	<!-- Empty State -->
	<div class="empty-state">
		<div class="empty-icon">🏈</div>
		<h3 class="empty-title">No games match your filters</h3>
		<p class="empty-description">
			Try adjusting your filter settings or reset them to see all games
		</p>
		<Button variant="primary" onclick={() => filterPanelOpen = true}>
			Adjust Filters
		</Button>
	</div>
{:else}
	<!-- Games Grid -->
	{#if predError}
		<div class="warning-banner">
			<span class="warning-icon">⚠️</span>
			<span>{predError}</span>
		</div>
	{/if}

	<div class="games-grid">
		{#each filteredGames() as game (game.id)}
			{@const forecast = forGame(game.id)}
			<GlassCard variant="interactive" class="game-card">
				<a href="/games/{game.id}" class="game-link">
					<!-- Confidence Badge -->
					{#if forecast && forecast.kind === 'forecast'}
						<div class="confidence-badge {getConfidenceLevel(forecast.confidence)}">
							{Math.round(forecast.confidence * 100)}% Confidence
						</div>
					{/if}

					<!-- Teams Container -->
					<div class="teams-container">
						<!-- Away Team -->
						<div class="team">
							{#if game.away?.logo}
								<img
									src={game.away.logo}
									alt={game.away.name}
									class="team-logo"
								/>
							{:else}
								<div class="team-logo-placeholder">
									{game.away?.abbreviation || '?'}
								</div>
							{/if}
							<div class="team-info">
								<p class="team-name">{game.away?.name || 'Away'}</p>
								<p class="team-record">{game.away?.record || '-'}</p>
							</div>
						</div>

						<!-- Score / VS Divider -->
						<div class="score-section">
							{#if game.away?.score !== undefined && game.home?.score !== undefined}
								<div class="score away">{game.away.score}</div>
								<div class="score-divider">—</div>
								<div class="score home">{game.home.score}</div>
							{:else}
								<div class="vs-badge">VS</div>
								{#if forecast && forecast.kind === 'forecast'}
									<div class="predicted-score">
										<span class="predicted-label">Pred</span>
										<span class="predicted-value">{forecast.awayScore}–{forecast.homeScore}</span>
									</div>
								{/if}
							{/if}
						</div>

						<!-- Home Team -->
						<div class="team">
							{#if game.home?.logo}
								<img
									src={game.home.logo}
									alt={game.home.name}
									class="team-logo"
								/>
							{:else}
								<div class="team-logo-placeholder">
									{game.home?.abbreviation || '?'}
								</div>
							{/if}
							<div class="team-info">
								<p class="team-name">{game.home?.name || 'Home'}</p>
								<p class="team-record">{game.home?.record || '-'}</p>
							</div>
						</div>
					</div>

					<!-- Probability Visualization -->
					{#if forecast && forecast.kind === 'forecast'}
						<div class="probability-section">
							<div class="probability-labels">
								<span class="prob-label away">{game.away?.abbreviation || 'AWAY'}</span>
								<span class="prob-label home">{game.home?.abbreviation || 'HOME'}</span>
							</div>
							<ProbabilityBar
								value={forecast.homeWinProb}
								label="Win Probability"
								size="md"
							/>
							<div class="probability-values">
								<span class="prob-value">{percent(forecast.awayWinProb)}</span>
								<span class="prob-value">{percent(forecast.homeWinProb)}</span>
							</div>
						</div>

						<!-- Betting Metrics -->
						<div class="metrics-section">
							<div class="metric">
								<span class="metric-label">Stake</span>
								<span class="metric-value stake-{forecast.stake >= 5 ? 'high' : 'low'}">
									{forecast.stake}/10
								</span>
							</div>
							<div class="metric">
								<span class="metric-label">Edge</span>
								<span class="metric-value">
									{getEdge(forecast).toFixed(1)}%
								</span>
							</div>
							<div class="metric">
								<span class="metric-label">Min Odds</span>
								<span class="metric-value">
									{forecast.minOdds.toFixed(2)}
								</span>
							</div>
						</div>
					{/if}

					<!-- Game Date/Time -->
					<div class="game-footer">
						<span class="game-date">{formatDate(game.date)}</span>
						{#if game.status === 'STATUS_IN_PROGRESS'}
							<span class="live-indicator">
								<span class="live-dot"></span>
								LIVE
							</span>
						{/if}
					</div>
				</a>
			</GlassCard>
		{/each}
	</div>
{/if}

<style>
	/* ========================================
	   HEADER SECTION
	   ======================================== */
	.header-section {
		margin-bottom: var(--gap-base);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--spacing-6);
		flex-wrap: wrap;
	}

	.header-text {
		flex: 1;
		min-width: 300px;
	}

	.header-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		color: var(--neon-gold);
		text-transform: uppercase;
		letter-spacing: 0.2em;
	}

	.header-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-3xl);
		color: var(--text-primary);
		margin-top: var(--spacing-1);
		margin-bottom: var(--spacing-2);
	}

	.header-description {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 600px;
		line-height: 1.6;
	}

	.fallback-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-2);
		margin-top: var(--spacing-3);
		padding: var(--spacing-2) var(--spacing-3);
		background: rgba(255, 193, 7, 0.1);
		border: 1px solid rgba(255, 193, 7, 0.3);
		border-radius: var(--border-radius-sm);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.fallback-dot {
		width: 8px;
		height: 8px;
		background: #ffc107;
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-3);
		align-items: center;
	}

	.header-actions .icon {
		width: 20px;
		height: 20px;
	}

	.filter-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: var(--neon-gold);
		color: var(--base-950);
		border-radius: 50%;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		font-family: var(--font-mono);
	}

	/* ========================================
	   GAMES GRID
	   ======================================== */
	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: var(--gap-base);
	}

	.game-card {
		position: relative;
	}

	.game-link {
		display: block;
		padding: var(--spacing-6);
		text-decoration: none;
		color: inherit;
	}

	/* Confidence Badge */
	.confidence-badge {
		position: absolute;
		top: var(--spacing-4);
		right: var(--spacing-4);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		z-index: 10;
	}

	.confidence-badge.high {
		background: rgba(0, 255, 136, 0.15);
		color: var(--neon-green);
		border: 1px solid var(--neon-green);
		box-shadow: 0 0 12px rgba(0, 255, 136, 0.3);
	}

	.confidence-badge.medium {
		background: rgba(255, 213, 0, 0.15);
		color: var(--neon-gold);
		border: 1px solid var(--neon-gold);
	}

	.confidence-badge.low {
		background: rgba(255, 51, 102, 0.15);
		color: var(--neon-red);
		border: 1px solid var(--neon-red);
	}

	/* Teams Container */
	.teams-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		margin-bottom: var(--spacing-6);
	}

	.team {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2);
	}

	.team-logo {
		width: 56px;
		height: 56px;
		object-fit: contain;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
		transition: transform var(--transition-base);
	}

	.game-link:hover .team-logo {
		transform: scale(1.1);
	}

	.team-logo-placeholder {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--glass-bg-hover);
		border: 1px solid var(--glass-border);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-display);
		color: var(--text-secondary);
	}

	.team-info {
		text-align: center;
		width: 100%;
	}

	.team-name {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		color: var(--text-primary);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.team-record {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin: var(--spacing-1) 0 0 0;
		font-family: var(--font-mono);
	}

	/* Score Section */
	.score-section {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-1);
	}

	.score {
		font-family: var(--font-mono);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-display);
		color: var(--neon-gold);
	}

	.score-divider {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.vs-badge {
		padding: var(--spacing-2) var(--spacing-3);
		background: var(--glass-bg-hover);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-display);
		color: var(--text-secondary);
	}

	.predicted-score {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-1);
		margin-top: var(--spacing-2);
	}

	.predicted-label {
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.predicted-value {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-mono);
		color: var(--neon-gold);
	}

	/* Probability Section */
	.probability-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-4);
	}

	.probability-labels {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.prob-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.probability-values {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.prob-value {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-mono);
		color: var(--text-primary);
	}

	/* Metrics Section */
	.metrics-section {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-4);
		padding: var(--spacing-4) 0;
		border-top: 1px solid var(--glass-border);
	}

	.metric {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-1);
	}

	.metric-label {
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.metric-value {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-mono);
		color: var(--text-primary);
	}

	.metric-value.stake-high {
		color: var(--neon-green);
	}

	.metric-value.stake-low {
		color: var(--neon-gold);
	}

	/* Game Footer */
	.game-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: var(--spacing-4);
		padding-top: var(--spacing-4);
		border-top: 1px solid var(--glass-border);
	}

	.game-date {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		color: var(--neon-red);
		text-transform: uppercase;
	}

	.live-dot {
		width: 6px;
		height: 6px;
		background: var(--neon-red);
		border-radius: 50%;
		box-shadow: 0 0 8px var(--neon-red);
		animation: pulse 1.5s ease-in-out infinite;
	}

	/* ========================================
	   ERROR & EMPTY STATES
	   ======================================== */
	.error-card {
		display: flex;
		gap: var(--spacing-4);
		padding: var(--spacing-6);
		background: rgba(255, 51, 102, 0.08);
		border: 1px solid rgba(255, 51, 102, 0.3);
		border-radius: var(--border-radius-lg);
	}

	.error-icon {
		font-size: var(--text-3xl);
		flex-shrink: 0;
	}

	.error-title {
		font-weight: var(--font-weight-body-medium);
		color: var(--text-primary);
		margin: 0 0 var(--spacing-2) 0;
	}

	.error-description {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-16) var(--spacing-4);
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: var(--spacing-4);
		opacity: 0.5;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		color: var(--text-primary);
		margin: 0 0 var(--spacing-2) 0;
	}

	.empty-description {
		font-size: var(--text-sm);
		color: var(--text-muted);
		margin: 0 0 var(--spacing-6) 0;
	}

	.warning-banner {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		padding: var(--spacing-4);
		margin-bottom: var(--gap-base);
		background: rgba(255, 193, 7, 0.1);
		border: 1px solid rgba(255, 193, 7, 0.3);
		border-radius: var(--border-radius-base);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.warning-icon {
		font-size: var(--text-lg);
	}

	/* Loading State */
	.loading-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: var(--gap-base);
	}

	.loading-card {
		height: 400px;
		position: relative;
		overflow: hidden;
	}

	.skeleton-pulse {
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.03) 50%,
			transparent 100%
		);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* ========================================
	   RESPONSIVE
	   ======================================== */
	@media (max-width: 768px) {
		.games-grid {
			grid-template-columns: 1fr;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
		}

		.header-actions {
			justify-content: flex-start;
		}

		.team-name {
			font-size: var(--text-xs);
		}

		.team-logo {
			width: 48px;
			height: 48px;
		}
	}
</style>
