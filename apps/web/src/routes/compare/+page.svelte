<script lang="ts">
	import { goto } from '$app/navigation';
	import { GlassCard } from '#lib/components/glass';
	import { Button } from '#lib/components/brutal';
	import { DataCard } from '#lib/components/data';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selectedAId = $state(data.selectedAId || '');
	let selectedBId = $state(data.selectedBId || '');

	function handleTeamSelection() {
		if (selectedAId && selectedBId) {
			goto(`/compare?a=${selectedAId}&b=${selectedBId}`);
		}
	}

	function getStatComparison(statA: number | undefined, statB: number | undefined): 'higher' | 'lower' | 'equal' {
		if (statA === undefined || statB === undefined) return 'equal';
		if (statA > statB) return 'higher';
		if (statA < statB) return 'lower';
		return 'equal';
	}

	function getRecordNumbers(record: string | undefined) {
		if (!record) return { wins: 0, losses: 0, winPct: 0 };
		const match = record.match(/(\d+)-(\d+)/);
		if (!match) return { wins: 0, losses: 0, winPct: 0 };
		const wins = parseInt(match[1]);
		const losses = parseInt(match[2]);
		const total = wins + losses;
		const winPct = total > 0 ? wins / total : 0;
		return { wins, losses, winPct };
	}
</script>

<!-- Header Section -->
<section class="header-section">
	<div class="header-content">
		<div class="header-text">
			<div class="header-label">Head-to-Head Analysis</div>
			<h1 class="header-title">Team Comparison</h1>
			<p class="header-description">
				Compare NFL teams side-by-side. Select two teams to see their stats, records, and head-to-head matchups.
			</p>
		</div>
	</div>
</section>

<!-- Team Selection -->
<section class="selection-section">
	<GlassCard variant="default">
		<div class="selection-content">
			<div class="selection-grid">
				<!-- Team A Selector -->
				<div class="selector">
					<label for="team-a" class="selector-label">Team A</label>
					<select
						id="team-a"
						bind:value={selectedAId}
						onchange={handleTeamSelection}
						class="team-select"
					>
						<option value="">Select Team...</option>
						{#each data.allTeams as team}
							<option value={team.id}>{team.displayName}</option>
						{/each}
					</select>
				</div>

				<!-- VS Divider -->
				<div class="vs-divider">
					<div class="vs-circle">
						<span class="vs-text">VS</span>
					</div>
				</div>

				<!-- Team B Selector -->
				<div class="selector">
					<label for="team-b" class="selector-label">Team B</label>
					<select
						id="team-b"
						bind:value={selectedBId}
						onchange={handleTeamSelection}
						class="team-select"
					>
						<option value="">Select Team...</option>
						{#each data.allTeams as team}
							<option value={team.id}>{team.displayName}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</GlassCard>
</section>

<!-- Comparison Content -->
{#if data.error}
	<div class="error-card">
		<div class="error-icon">⚠️</div>
		<div class="error-content">
			<p class="error-title">{data.error}</p>
			<p class="error-description">Unable to load teams. Please try again.</p>
		</div>
	</div>
{:else if !data.teamA || !data.teamB}
	<!-- Empty State -->
	<div class="empty-state">
		<div class="empty-icon">🏈</div>
		<h3 class="empty-title">Select Two Teams to Compare</h3>
		<p class="empty-description">
			Choose teams from the dropdowns above to see a detailed comparison
		</p>
	</div>
{:else}
	<!-- Comparison Grid -->
	<div class="comparison-grid">
		<!-- Team A Column -->
		<div class="team-column">
			<GlassCard variant="default">
				<div class="team-header">
					{#if data.teamA.logo}
						<img src={data.teamA.logo} alt={data.teamA.displayName} class="team-logo-large" />
					{/if}
					<h2 class="team-title">{data.teamA.displayName}</h2>
					<div class="team-meta">
						<span class="team-abbr">{data.teamA.abbreviation}</span>
						<span class="team-divider">·</span>
						<span class="team-conference">{data.teamA.conference}</span>
					</div>
				</div>

				<!-- Team Stats -->
				<div class="stats-section">
					<h3 class="stats-title">Season Stats</h3>

					<div class="stat-row">
						<span class="stat-label">Record</span>
						<span class="stat-value {getStatComparison(
							getRecordNumbers(data.teamA.record).winPct,
							getRecordNumbers(data.teamB.record).winPct
						)}">
							{data.teamA.record || 'N/A'}
						</span>
					</div>

					<div class="stat-row">
						<span class="stat-label">Win Percentage</span>
						<span class="stat-value {getStatComparison(
							getRecordNumbers(data.teamA.record).winPct,
							getRecordNumbers(data.teamB.record).winPct
						)}">
							{(getRecordNumbers(data.teamA.record).winPct * 100).toFixed(1)}%
						</span>
					</div>

					<div class="stat-row">
						<span class="stat-label">Conference Rank</span>
						<span class="stat-value">
							{data.teamA.conferenceRank || 'N/A'}
						</span>
					</div>

					<div class="stat-row">
						<span class="stat-label">Division Rank</span>
						<span class="stat-value">
							{data.teamA.divisionRank || 'N/A'}
						</span>
					</div>
				</div>

				<!-- Roster Info -->
				{#if data.teamA.roster && data.teamA.roster.length > 0}
					<div class="roster-section">
						<h3 class="stats-title">Roster</h3>
						<div class="roster-stat">
							<span class="roster-label">Total Players</span>
							<span class="roster-value">{data.teamA.roster.length}</span>
						</div>
					</div>
				{/if}
			</GlassCard>
		</div>

		<!-- Center Comparison Indicators -->
		<div class="comparison-indicators">
			<GlassCard variant="default" class="indicator-card">
				<div class="indicator-content">
					<h3 class="indicator-title">Head-to-Head</h3>

					<!-- Win Percentage Comparison -->
					<div class="comparison-bar-container">
						<div class="comparison-label">Win %</div>
						<div class="comparison-bar">
							{@const teamAWinPct = getRecordNumbers(data.teamA.record).winPct}
							{@const teamBWinPct = getRecordNumbers(data.teamB.record).winPct}
							{@const total = teamAWinPct + teamBWinPct}
							{@const teamAPercent = total > 0 ? (teamAWinPct / total) * 100 : 50}

							<div class="bar-track">
								<div class="bar-fill bar-a" style="width: {teamAPercent}%"></div>
								<div class="bar-fill bar-b" style="width: {100 - teamAPercent}%"></div>
							</div>
							<div class="bar-labels">
								<span class="bar-value">{(teamAWinPct * 100).toFixed(0)}%</span>
								<span class="bar-value">{(teamBWinPct * 100).toFixed(0)}%</span>
							</div>
						</div>
					</div>

					<!-- Conference -->
					<div class="comparison-item">
						<span class="comparison-item-label">Conference</span>
						<div class="comparison-item-values">
							<span class="comparison-item-value">{data.teamA.conference}</span>
							{#if data.teamA.conference === data.teamB.conference}
								<span class="comparison-match">Same</span>
							{:else}
								<span class="comparison-diff">Different</span>
							{/if}
							<span class="comparison-item-value">{data.teamB.conference}</span>
						</div>
					</div>

					<!-- Division -->
					<div class="comparison-item">
						<span class="comparison-item-label">Division</span>
						<div class="comparison-item-values">
							<span class="comparison-item-value">{data.teamA.division || 'N/A'}</span>
							{#if data.teamA.division === data.teamB.division}
								<span class="comparison-match">Same</span>
							{:else}
								<span class="comparison-diff">Different</span>
							{/if}
							<span class="comparison-item-value">{data.teamB.division || 'N/A'}</span>
						</div>
					</div>

					<!-- Roster Size -->
					{#if data.teamA.roster && data.teamB.roster}
						<div class="comparison-item">
							<span class="comparison-item-label">Roster Size</span>
							<div class="comparison-item-values">
								<span class="comparison-item-value {getStatComparison(
									data.teamA.roster.length,
									data.teamB.roster.length
								)}">
									{data.teamA.roster.length}
								</span>
								<span class="comparison-arrow">
									{#if data.teamA.roster.length > data.teamB.roster.length}
										→
									{:else if data.teamA.roster.length < data.teamB.roster.length}
										←
									{:else}
										=
									{/if}
								</span>
								<span class="comparison-item-value {getStatComparison(
									data.teamB.roster.length,
									data.teamA.roster.length
								)}">
									{data.teamB.roster.length}
								</span>
							</div>
						</div>
					{/if}
				</div>
			</GlassCard>
		</div>

		<!-- Team B Column -->
		<div class="team-column">
			<GlassCard variant="default">
				<div class="team-header">
					{#if data.teamB.logo}
						<img src={data.teamB.logo} alt={data.teamB.displayName} class="team-logo-large" />
					{/if}
					<h2 class="team-title">{data.teamB.displayName}</h2>
					<div class="team-meta">
						<span class="team-abbr">{data.teamB.abbreviation}</span>
						<span class="team-divider">·</span>
						<span class="team-conference">{data.teamB.conference}</span>
					</div>
				</div>

				<!-- Team Stats -->
				<div class="stats-section">
					<h3 class="stats-title">Season Stats</h3>

					<div class="stat-row">
						<span class="stat-label">Record</span>
						<span class="stat-value {getStatComparison(
							getRecordNumbers(data.teamB.record).winPct,
							getRecordNumbers(data.teamA.record).winPct
						)}">
							{data.teamB.record || 'N/A'}
						</span>
					</div>

					<div class="stat-row">
						<span class="stat-label">Win Percentage</span>
						<span class="stat-value {getStatComparison(
							getRecordNumbers(data.teamB.record).winPct,
							getRecordNumbers(data.teamA.record).winPct
						)}">
							{(getRecordNumbers(data.teamB.record).winPct * 100).toFixed(1)}%
						</span>
					</div>

					<div class="stat-row">
						<span class="stat-label">Conference Rank</span>
						<span class="stat-value">
							{data.teamB.conferenceRank || 'N/A'}
						</span>
					</div>

					<div class="stat-row">
						<span class="stat-label">Division Rank</span>
						<span class="stat-value">
							{data.teamB.divisionRank || 'N/A'}
						</span>
					</div>
				</div>

				<!-- Roster Info -->
				{#if data.teamB.roster && data.teamB.roster.length > 0}
					<div class="roster-section">
						<h3 class="stats-title">Roster</h3>
						<div class="roster-stat">
							<span class="roster-label">Total Players</span>
							<span class="roster-value">{data.teamB.roster.length}</span>
						</div>
					</div>
				{/if}
			</GlassCard>
		</div>
	</div>

	<!-- Actions -->
	<div class="actions-section">
		<Button variant="secondary" href="/teams/{data.teamA.id}">
			View {data.teamA.abbreviation} Details
		</Button>
		<Button variant="secondary" href="/teams/{data.teamB.id}">
			View {data.teamB.abbreviation} Details
		</Button>
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

	/* ========================================
	   SELECTION SECTION
	   ======================================== */
	.selection-section {
		margin-bottom: var(--gap-base);
	}

	.selection-content {
		padding: var(--spacing-6);
	}

	.selection-grid {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--spacing-6);
		align-items: end;
	}

	.selector {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.selector-label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.team-select {
		padding: var(--spacing-3) var(--spacing-4);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-base);
		color: var(--text-primary);
		font-size: var(--text-base);
		font-weight: var(--font-weight-body-medium);
		cursor: pointer;
		transition: all var(--transition-base);
		outline: none;
	}

	.team-select:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
	}

	.team-select:focus {
		border-color: var(--neon-gold);
		box-shadow: 0 0 0 2px rgba(255, 213, 0, 0.2);
	}

	.vs-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: var(--spacing-1);
	}

	.vs-circle {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--neon-gold);
		border-radius: 50%;
		box-shadow: var(--shadow-brutal-sm);
	}

	.vs-text {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-lg);
		color: var(--base-950);
	}

	/* ========================================
	   COMPARISON GRID
	   ======================================== */
	.comparison-grid {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--gap-base);
		margin-bottom: var(--gap-base);
	}

	.team-column {
		min-width: 0;
	}

	.team-header {
		text-align: center;
		padding: var(--spacing-6);
		border-bottom: 1px solid var(--glass-border);
	}

	.team-logo-large {
		width: 120px;
		height: 120px;
		object-fit: contain;
		margin: 0 auto var(--spacing-4);
		filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
	}

	.team-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-2xl);
		color: var(--text-primary);
		margin: 0 0 var(--spacing-2) 0;
	}

	.team-meta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.team-abbr {
		font-family: var(--font-mono);
		color: var(--neon-gold);
		font-weight: var(--font-weight-mono);
	}

	.team-divider {
		color: var(--text-muted);
	}

	.team-conference {
		text-transform: uppercase;
	}

	/* Stats Section */
	.stats-section {
		padding: var(--spacing-6);
	}

	.stats-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-lg);
		color: var(--text-primary);
		margin: 0 0 var(--spacing-4) 0;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-3) 0;
		border-bottom: 1px solid var(--glass-border);
	}

	.stat-row:last-child {
		border-bottom: none;
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.stat-value {
		font-family: var(--font-mono);
		font-size: var(--text-base);
		font-weight: var(--font-weight-mono);
		color: var(--text-primary);
	}

	.stat-value.higher {
		color: var(--neon-green);
	}

	.stat-value.lower {
		color: var(--text-muted);
	}

	/* Roster Section */
	.roster-section {
		padding: var(--spacing-6);
		border-top: 1px solid var(--glass-border);
	}

	.roster-stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-3) 0;
	}

	.roster-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.roster-value {
		font-family: var(--font-mono);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-mono);
		color: var(--neon-gold);
	}

	/* ========================================
	   COMPARISON INDICATORS
	   ======================================== */
	.comparison-indicators {
		min-width: 280px;
		align-self: start;
		position: sticky;
		top: calc(var(--spacing-6) + 80px);
	}

	.indicator-card {
		height: fit-content;
	}

	.indicator-content {
		padding: var(--spacing-6);
	}

	.indicator-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-xl);
		color: var(--text-primary);
		text-align: center;
		margin: 0 0 var(--spacing-6) 0;
	}

	.comparison-bar-container {
		margin-bottom: var(--spacing-6);
		padding-bottom: var(--spacing-6);
		border-bottom: 1px solid var(--glass-border);
	}

	.comparison-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--spacing-3);
		text-align: center;
	}

	.comparison-bar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.bar-track {
		display: flex;
		height: 32px;
		background: var(--glass-bg);
		border-radius: var(--border-radius-base);
		overflow: hidden;
		border: 1px solid var(--glass-border);
	}

	.bar-fill {
		height: 100%;
		transition: width var(--transition-base);
	}

	.bar-fill.bar-a {
		background: linear-gradient(90deg, var(--neon-cyan), rgba(0, 217, 255, 0.6));
	}

	.bar-fill.bar-b {
		background: linear-gradient(90deg, rgba(255, 51, 102, 0.6), var(--neon-red));
	}

	.bar-labels {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.bar-value {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-mono);
		color: var(--text-primary);
	}

	.comparison-item {
		padding: var(--spacing-4) 0;
		border-bottom: 1px solid var(--glass-border);
	}

	.comparison-item:last-child {
		border-bottom: none;
	}

	.comparison-item-label {
		display: block;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-body-medium);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--spacing-2);
	}

	.comparison-item-values {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2);
	}

	.comparison-item-value {
		font-size: var(--text-sm);
		color: var(--text-primary);
		font-weight: var(--font-weight-body-medium);
	}

	.comparison-item-value.higher {
		color: var(--neon-green);
	}

	.comparison-item-value.lower {
		color: var(--text-muted);
	}

	.comparison-match {
		font-size: var(--text-xs);
		color: var(--neon-gold);
		font-weight: var(--font-weight-mono);
		font-family: var(--font-mono);
	}

	.comparison-diff {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-weight: var(--font-weight-mono);
		font-family: var(--font-mono);
	}

	.comparison-arrow {
		font-size: var(--text-lg);
		color: var(--neon-gold);
		font-weight: var(--font-weight-display);
	}

	/* ========================================
	   ACTIONS
	   ======================================== */
	.actions-section {
		display: flex;
		gap: var(--spacing-4);
		justify-content: center;
		flex-wrap: wrap;
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
	@media (max-width: 1024px) {
		.comparison-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-4);
		}

		.comparison-indicators {
			position: static;
			min-width: auto;
		}

		.selection-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-4);
		}

		.vs-divider {
			order: 2;
		}
	}

	@media (max-width: 768px) {
		.team-logo-large {
			width: 80px;
			height: 80px;
		}

		.team-title {
			font-size: var(--text-xl);
		}
	}
</style>
