<script lang="ts">
	/**
	 * ProbabilityBar - Glassmorphic probability visualization
	 * Displays a horizontal bar with gradient fill encoding win probability
	 */

	interface Props {
		/**
		 * Probability value (0-100)
		 */
		value: number;
		/**
		 * Label text (e.g., "Home Win Probability")
		 */
		label?: string;
		/**
		 * Show percentage label
		 */
		showPercentage?: boolean;
		/**
		 * Bar size
		 */
		size?: 'sm' | 'md' | 'lg';
		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let {
		value,
		label,
		showPercentage = true,
		size = 'md',
		class: className = ''
	}: Props = $props();

	// Clamp value between 0-100
	const clampedValue = $derived(Math.max(0, Math.min(100, value)));

	// Determine color based on probability
	const getColor = (prob: number): string => {
		if (prob >= 70) return 'high'; // Green
		if (prob >= 50) return 'medium'; // Gold
		return 'low'; // Red
	};

	const colorClass = $derived(getColor(clampedValue));
</script>

<div class="probability-bar-container {className}">
	{#if label}
		<div class="probability-label">
			<span class="label-text">{label}</span>
			{#if showPercentage}
				<span class="label-percentage">{clampedValue.toFixed(1)}%</span>
			{/if}
		</div>
	{/if}

	<div class="probability-track {size}">
		<div
			class="probability-fill {colorClass}"
			style="width: {clampedValue}%"
			role="progressbar"
			aria-valuenow={clampedValue}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={label || `Probability: ${clampedValue}%`}
		>
			{#if showPercentage && !label}
				<span class="fill-percentage">{clampedValue.toFixed(1)}%</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.probability-bar-container {
		width: 100%;
	}

	.probability-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-2);
		font-size: var(--text-sm);
	}

	.label-text {
		color: var(--text-secondary);
		font-weight: var(--font-weight-body-medium);
	}

	.label-percentage {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-mono);
		color: var(--text-primary);
		font-size: var(--text-base);
	}

	/* Track - Glass background */
	.probability-track {
		position: relative;
		width: 100%;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-base);
		overflow: hidden;
	}

	.probability-track.sm {
		height: 8px;
	}

	.probability-track.md {
		height: 12px;
	}

	.probability-track.lg {
		height: 16px;
	}

	/* Fill - Gradient with neon colors */
	.probability-fill {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: var(--spacing-2);
		transition: width var(--transition-slow) var(--ease-out);
		position: relative;
	}

	/* High confidence (70-100%) - Green gradient */
	.probability-fill.high {
		background: linear-gradient(90deg, var(--neon-cyan) 0%, var(--neon-green) 100%);
		box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
	}

	/* Medium confidence (50-69%) - Gold */
	.probability-fill.medium {
		background: linear-gradient(90deg, var(--neon-gold) 0%, #ffaa00 100%);
		box-shadow: 0 0 20px rgba(255, 213, 0, 0.4);
	}

	/* Low confidence (<50%) - Red */
	.probability-fill.low {
		background: linear-gradient(90deg, #ff6b6b 0%, var(--neon-red) 100%);
		box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
	}

	.fill-percentage {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-mono);
		font-size: var(--text-xs);
		color: var(--base-950);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		white-space: nowrap;
	}

	/* Hide percentage on small widths */
	.probability-fill[style*='width: 0%'] .fill-percentage,
	.probability-fill[style*='width: 1%'] .fill-percentage,
	.probability-fill[style*='width: 2%'] .fill-percentage,
	.probability-fill[style*='width: 3%'] .fill-percentage,
	.probability-fill[style*='width: 4%'] .fill-percentage,
	.probability-fill[style*='width: 5%'] .fill-percentage {
		display: none;
	}

	/* Accessibility: Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.probability-fill {
			transition: none;
		}
	}
</style>
