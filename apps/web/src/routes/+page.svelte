<script lang="ts">
	import { GlassCard } from '#lib/components/glass';
	import { Button } from '#lib/components/brutal';
	import { DataCard, ProbabilityBar, ConfidenceGauge } from '#lib/components/data';
	import { hexColor } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Hero Section -->
<section class="hero">
	<div class="hero-content">
		<h1 class="hero-title">
			NFL Predictions
			<span class="hero-accent">Powered by AI</span>
		</h1>
		<p class="hero-description">
			Data-driven insights with integrated bankroll management. Make informed betting decisions
			based on AI analysis and probability calculations.
		</p>
		<div class="hero-actions">
			<Button href="/games" variant="primary" size="lg">
				View All Games
			</Button>
			<Button href="/teams" variant="secondary" size="lg">
				Browse Teams
			</Button>
		</div>
	</div>
</section>

<!-- Stats Cards -->
<section class="stats-section">
	<h2 class="section-title">This Week's Overview</h2>
	<div class="stats-grid">
		<DataCard
			value={data.stats.totalGames}
			label="Total Games"
			icon="🏈"
			color="cyan"
			mono
		/>
		<DataCard
			value={data.stats.highConfidencePicks}
			label="High Confidence Picks"
			icon="⚡"
			color="green"
			mono
		/>
		<DataCard
			value="{data.stats.avgConfidence}%"
			label="Average Confidence"
			icon="📊"
			color="gold"
			mono
		/>
	</div>
</section>

<!-- Featured Games -->
{#if data.error}
	<div class="error-card">
		<div class="error-icon">⚠️</div>
		<div class="error-content">
			<p class="error-title">{data.error}</p>
			<p class="error-description">
				Unable to load predictions. Please check your API configuration and try again.
			</p>
		</div>
	</div>
{:else if data.featuredGames.length > 0}
	<section class="featured-section">
		<div class="section-header">
			<div>
				<h2 class="section-title">Top Predictions</h2>
				<p class="section-subtitle">
					Highest confidence picks for upcoming games
				</p>
			</div>
			<Button href="/games" variant="ghost">
				View All →
			</Button>
		</div>

		<div class="games-grid">
			{#each data.featuredGames as game (game.id)}
				<GlassCard variant="interactive" class="game-card">
					<a href="/games/{game.id}" class="game-link">
						<!-- Confidence Badge -->
						{#if game.prediction}
							<div class="confidence-badge {game.prediction.confidence >= 0.7 ? 'high' : game.prediction.confidence >= 0.5 ? 'medium' : 'low'}">
								{Math.round(game.prediction.confidence * 100)}% Confidence
							</div>
						{/if}

						<!-- Teams -->
						<div class="teams-container">
							<!-- Away Team -->
							<div class="team">
								{#if game.away?.logo}
									<img
										src={game.away.logo}
										alt={game.away.name}
										class="team-logo"
									/>
								{/if}
								<div class="team-info">
									<p class="team-name">{game.away?.name || 'Away'}</p>
									<p class="team-record">{game.away?.record || '-'}</p>
								</div>
							</div>

							<!-- VS -->
							<div class="vs-divider">
								<span class="vs-text">VS</span>
							</div>

							<!-- Home Team -->
							<div class="team">
								{#if game.home?.logo}
									<img
										src={game.home.logo}
										alt={game.home.name}
										class="team-logo"
									/>
								{/if}
								<div class="team-info">
									<p class="team-name">{game.home?.name || 'Home'}</p>
									<p class="team-record">{game.home?.record || '-'}</p>
								</div>
							</div>
						</div>

						<!-- Prediction -->
						{#if game.prediction}
							<div class="prediction-section">
								<div class="prediction-row">
									<span class="prediction-label">Winner</span>
									<span class="prediction-value winner">{game.prediction.winnerName}</span>
								</div>
								<ProbabilityBar
									value={game.prediction.homeWinProb}
									label="Home Win Probability"
									size="sm"
								/>
								<div class="prediction-meta">
									<span class="meta-item">Edge: <strong>{(Math.abs(game.prediction.homeWinProb - 0.5) * 100).toFixed(1)}%</strong></span>
									<span class="meta-item">Stake: <strong>{game.prediction.stake}/10</strong></span>
								</div>
							</div>
						{/if}
					</a>
				</GlassCard>
			{/each}
		</div>
	</section>
{:else}
	<div class="empty-state">
		<div class="empty-icon">📭</div>
		<h3 class="empty-title">No games available</h3>
		<p class="empty-description">
			Check back later for this week's predictions
		</p>
	</div>
{/if}

<style>
	/* ========================================
	   HERO SECTION
	   ======================================== */
	.hero {
		margin-bottom: var(--gap-section);
		padding: var(--spacing-12) 0;
		text-align: center;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-4xl);
		line-height: var(--line-height-display);
		letter-spacing: var(--letter-spacing-display);
		color: var(--text-primary);
		margin-bottom: var(--spacing-4);
	}

	.hero-accent {
		display: block;
		color: var(--neon-gold);
		text-shadow: 0 0 40px rgba(255, 213, 0, 0.3);
	}

	.hero-description {
		font-size: var(--text-lg);
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: var(--spacing-8);
	}

	.hero-actions {
		display: flex;
		gap: var(--spacing-4);
		justify-content: center;
		flex-wrap: wrap;
	}

	/* ========================================
	   STATS SECTION
	   ======================================== */
	.stats-section {
		margin-bottom: var(--gap-section);
	}

	.section-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-2xl);
		color: var(--text-primary);
		margin-bottom: var(--spacing-6);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--gap-base);
	}

	/* ========================================
	   FEATURED GAMES SECTION
	   ======================================== */
	.featured-section {
		margin-bottom: var(--gap-section);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: var(--spacing-6);
		gap: var(--spacing-4);
		flex-wrap: wrap;
	}

	.section-subtitle {
		font-size: var(--text-sm);
		color: var(--text-muted);
		margin-top: var(--spacing-1);
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--gap-base);
	}

	/* ========================================
	   GAME CARD
	   ======================================== */
	.game-card {
		position: relative;
	}

	.game-link {
		display: block;
		text-decoration: none;
		color: inherit;
		padding: var(--spacing-6);
	}

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

	.teams-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-4);
		margin-bottom: var(--spacing-6);
	}

	.team {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
	}

	.team-logo {
		width: 48px;
		height: 48px;
		object-fit: contain;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
	}

	.team-info {
		flex: 1;
		min-width: 0;
	}

	.team-name {
		font-weight: var(--font-weight-body-medium);
		font-size: var(--text-sm);
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
	}

	.vs-divider {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--glass-bg-hover);
		border: 1px solid var(--glass-border);
	}

	.vs-text {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-display);
		color: var(--text-secondary);
	}

	.prediction-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}

	.prediction-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.prediction-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.prediction-value.winner {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-mono);
		color: var(--neon-gold);
		font-size: var(--text-base);
	}

	.prediction-meta {
		display: flex;
		gap: var(--spacing-4);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.meta-item strong {
		color: var(--text-primary);
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
		margin: 0;
	}

	/* ========================================
	   RESPONSIVE
	   ======================================== */
	@media (max-width: 768px) {
		.hero-title {
			font-size: var(--text-3xl);
		}

		.hero-description {
			font-size: var(--text-base);
		}

		.games-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
