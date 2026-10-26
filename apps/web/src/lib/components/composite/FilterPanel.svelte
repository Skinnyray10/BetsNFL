<script lang="ts">
	import { gameFilters, resetFilters } from '#lib/stores/filters.js';
	import { Button } from '#lib/components/brutal';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	const statusOptions = [
		{ value: 'all', label: 'All Games' },
		{ value: 'upcoming', label: 'Upcoming' },
		{ value: 'live', label: 'Live' },
		{ value: 'completed', label: 'Completed' }
	] as const;

	const conferenceOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'AFC', label: 'AFC' },
		{ value: 'NFC', label: 'NFC' }
	] as const;

	const sortOptions = [
		{ value: 'date', label: 'Date' },
		{ value: 'confidence', label: 'Confidence' },
		{ value: 'edge', label: 'Edge' },
		{ value: 'alphabetical', label: 'A-Z' }
	] as const;

	function handleReset() {
		resetFilters();
	}
</script>

<!-- Overlay -->
{#if open}
	<button
		class="overlay"
		onclick={onClose}
		aria-label="Close filters"
	></button>
{/if}

<!-- Panel -->
<aside class="filter-panel" class:open>
	<div class="panel-header">
		<h2 class="panel-title">Filters</h2>
		<button class="close-btn" onclick={onClose} aria-label="Close">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<div class="panel-content">
		<!-- Game Status -->
		<div class="filter-section">
			<label class="filter-label">Game Status</label>
			<div class="tabs">
				{#each statusOptions as option}
					<button
						class="tab"
						class:active={$gameFilters.status === option.value}
						onclick={() => gameFilters.update(f => ({ ...f, status: option.value }))}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Conference -->
		<div class="filter-section">
			<label class="filter-label">Conference</label>
			<div class="button-group">
				{#each conferenceOptions as option}
					<button
						class="group-btn"
						class:active={$gameFilters.conference === option.value}
						onclick={() => gameFilters.update(f => ({ ...f, conference: option.value }))}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Confidence Range -->
		<div class="filter-section">
			<label class="filter-label">
				Minimum Confidence
				<span class="filter-value">{$gameFilters.confidenceMin}%</span>
			</label>
			<input
				type="range"
				min="0"
				max="100"
				step="5"
				bind:value={$gameFilters.confidenceMin}
				class="slider"
			/>
			<div class="slider-labels">
				<span>0%</span>
				<span>50%</span>
				<span>100%</span>
			</div>
		</div>

		<!-- Edge Threshold -->
		<div class="filter-section">
			<label class="filter-label">
				Minimum Edge
				<span class="filter-value">{$gameFilters.edgeMin.toFixed(1)}%</span>
			</label>
			<input
				type="range"
				min="0"
				max="20"
				step="0.5"
				bind:value={$gameFilters.edgeMin}
				class="slider"
			/>
			<div class="slider-labels">
				<span>0%</span>
				<span>10%</span>
				<span>20%</span>
			</div>
		</div>

		<!-- Sort By -->
		<div class="filter-section">
			<label class="filter-label">Sort By</label>
			<select bind:value={$gameFilters.sortBy} class="select">
				{#each sortOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Actions -->
		<div class="panel-actions">
			<Button variant="secondary" onclick={handleReset}>
				Reset Filters
			</Button>
			<Button variant="primary" onclick={onClose}>
				Apply
			</Button>
		</div>
	</div>
</aside>

<style>
	/* Overlay */
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 200;
		cursor: pointer;
		border: none;
		animation: fadeIn var(--transition-base);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Panel */
	.filter-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(400px, 90vw);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur-intense) var(--glass-saturate);
		-webkit-backdrop-filter: var(--glass-blur-intense) var(--glass-saturate);
		border-left: 1px solid var(--glass-border);
		box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
		z-index: 201;
		display: flex;
		flex-direction: column;
		transform: translateX(100%);
		transition: transform var(--transition-slow) var(--ease-out);
	}

	.filter-panel.open {
		transform: translateX(0);
	}

	/* Panel Header */
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-6);
		border-bottom: 1px solid var(--glass-border);
	}

	.panel-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-2xl);
		color: var(--text-primary);
		margin: 0;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-sm);
		background: transparent;
		border: 1px solid var(--glass-border);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.close-btn:hover {
		background: var(--glass-bg-hover);
		border-color: var(--neon-gold);
		color: var(--neon-gold);
	}

	.close-btn .icon {
		width: 20px;
		height: 20px;
	}

	/* Panel Content */
	.panel-content {
		flex: 1;
		padding: var(--spacing-6);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--gap-base);
	}

	/* Filter Section */
	.filter-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}

	.filter-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.filter-value {
		font-family: var(--font-mono);
		color: var(--neon-gold);
		font-size: var(--text-base);
	}

	/* Tabs (Neubrutalist) */
	.tabs {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-2);
	}

	.tab {
		padding: var(--spacing-3) var(--spacing-4);
		background: transparent;
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-base);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.tab:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
		color: var(--text-primary);
	}

	.tab.active {
		background: var(--neon-gold);
		border-color: var(--neon-gold);
		border-bottom-width: 4px;
		color: var(--base-950);
		padding-bottom: calc(var(--spacing-3) - 3px);
		box-shadow: var(--shadow-brutal-sm);
	}

	/* Button Group */
	.button-group {
		display: flex;
		gap: var(--spacing-2);
	}

	.group-btn {
		flex: 1;
		padding: var(--spacing-3) var(--spacing-4);
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-base);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.group-btn:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
		color: var(--text-primary);
	}

	.group-btn.active {
		background: var(--glass-bg-hover);
		border-color: var(--neon-gold);
		color: var(--neon-gold);
	}

	/* Slider */
	.slider {
		width: 100%;
		height: 8px;
		border-radius: var(--border-radius-base);
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		outline: none;
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--neon-gold);
		cursor: pointer;
		box-shadow: 0 0 8px rgba(255, 213, 0, 0.5);
		transition: all var(--transition-fast);
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 12px rgba(255, 213, 0, 0.8);
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--neon-gold);
		cursor: pointer;
		border: none;
		box-shadow: 0 0 8px rgba(255, 213, 0, 0.5);
		transition: all var(--transition-fast);
	}

	.slider::-moz-range-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 12px rgba(255, 213, 0, 0.8);
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	/* Select */
	.select {
		padding: var(--spacing-3) var(--spacing-4);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-base);
		color: var(--text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		cursor: pointer;
		transition: all var(--transition-base);
		outline: none;
	}

	.select:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
	}

	.select:focus {
		border-color: var(--neon-gold);
		box-shadow: 0 0 0 2px rgba(255, 213, 0, 0.2);
	}

	/* Panel Actions */
	.panel-actions {
		display: flex;
		gap: var(--spacing-3);
		padding-top: var(--spacing-6);
		border-top: 1px solid var(--glass-border);
		margin-top: auto;
	}

	/* Responsive */
	@media (prefers-reduced-motion: reduce) {
		.filter-panel,
		.overlay {
			animation: none;
			transition: none;
		}
	}
</style>
