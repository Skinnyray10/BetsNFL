<script lang="ts">
	/**
	 * ConfidenceGauge - Radial SVG gauge for confidence scores
	 * Color-coded: green (70%+), gold (50-69%), red (<50%)
	 */

	interface Props {
		/**
		 * Confidence value (0-100)
		 */
		value: number;
		/**
		 * Label text
		 */
		label?: string;
		/**
		 * Gauge size in pixels
		 */
		size?: number;
		/**
		 * Show percentage in center
		 */
		showValue?: boolean;
		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let {
		value,
		label,
		size = 120,
		showValue = true,
		class: className = ''
	}: Props = $props();

	// Clamp value between 0-100
	const clampedValue = $derived(Math.max(0, Math.min(100, value)));

	// Circle parameters
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const center = size / 2;

	// Calculate stroke-dashoffset for progress
	const offset = $derived(circumference - (clampedValue / 100) * circumference);

	// Determine color based on confidence
	const getColor = (conf: number): { color: string; glow: string } => {
		if (conf >= 70) {
			return { color: 'var(--neon-green)', glow: 'rgba(0, 255, 136, 0.4)' };
		}
		if (conf >= 50) {
			return { color: 'var(--neon-gold)', glow: 'rgba(255, 213, 0, 0.4)' };
		}
		return { color: 'var(--neon-red)', glow: 'rgba(255, 51, 102, 0.3)' };
	};

	const colors = $derived(getColor(clampedValue));
</script>

<div class="gauge-container {className}" style="width: {size}px; height: {size}px;">
	<svg width={size} height={size} class="gauge-svg">
		<!-- Background circle (glass effect) -->
		<circle
			cx={center}
			cy={center}
			r={radius}
			fill="none"
			stroke="var(--glass-border)"
			stroke-width={strokeWidth}
			class="gauge-background"
		/>

		<!-- Progress circle (neon glow) -->
		<circle
			cx={center}
			cy={center}
			r={radius}
			fill="none"
			stroke={colors.color}
			stroke-width={strokeWidth}
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			stroke-linecap="round"
			class="gauge-progress"
			style="filter: drop-shadow(0 0 8px {colors.glow})"
			role="progressbar"
			aria-valuenow={clampedValue}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={label || `Confidence: ${clampedValue}%`}
		/>
	</svg>

	<!-- Center content -->
	<div class="gauge-content">
		{#if showValue}
			<div class="gauge-value" style="color: {colors.color}">
				{clampedValue.toFixed(0)}<span class="gauge-unit">%</span>
			</div>
		{/if}
		{#if label}
			<div class="gauge-label">{label}</div>
		{/if}
	</div>
</div>

<style>
	.gauge-container {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.gauge-svg {
		position: absolute;
		top: 0;
		left: 0;
		transform: rotate(-90deg);
	}

	.gauge-background {
		opacity: 0.3;
	}

	.gauge-progress {
		transition: stroke-dashoffset var(--transition-slow) var(--ease-out);
	}

	.gauge-content {
		position: relative;
		z-index: 1;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.gauge-value {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-display);
		font-size: var(--text-3xl);
		line-height: 1;
		text-shadow: 0 0 20px currentColor;
	}

	.gauge-unit {
		font-size: var(--text-lg);
		opacity: 0.8;
	}

	.gauge-label {
		margin-top: var(--spacing-1);
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-weight: var(--font-weight-body-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Accessibility: Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.gauge-progress {
			transition: none;
		}
	}
</style>
