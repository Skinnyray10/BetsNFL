<script lang="ts">
	/**
	 * DataCard - Small glass card for displaying statistics
	 * Shows a large number with label below
	 */

	interface Props {
		/**
		 * Stat value (number or string)
		 */
		value: number | string;
		/**
		 * Label text below value
		 */
		label: string;
		/**
		 * Optional icon (emoji or SVG content)
		 */
		icon?: string;
		/**
		 * Accent color for value
		 */
		color?: 'gold' | 'green' | 'cyan' | 'purple' | 'red' | 'default';
		/**
		 * Use monospace font for value
		 */
		mono?: boolean;
		/**
		 * Additional CSS classes
		 */
		class?: string;
	}

	let {
		value,
		label,
		icon,
		color = 'default',
		mono = false,
		class: className = ''
	}: Props = $props();

	const colorMap: Record<string, string> = {
		gold: 'var(--neon-gold)',
		green: 'var(--neon-green)',
		cyan: 'var(--neon-cyan)',
		purple: 'var(--neon-purple)',
		red: 'var(--neon-red)',
		default: 'var(--text-primary)'
	};

	const valueColor = colorMap[color];
</script>

<div class="data-card {className}">
	{#if icon}
		<div class="data-icon">{icon}</div>
	{/if}
	<div class="data-value" class:mono style="color: {valueColor}">
		{value}
	</div>
	<div class="data-label">{label}</div>
</div>

<style>
	.data-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		padding: var(--spacing-6);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur) var(--glass-saturate);
		-webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-glass);
		transition: all var(--transition-base);
		text-align: center;
	}

	.data-card:hover {
		border-color: var(--glass-border-hover);
		box-shadow: var(--shadow-glass-hover);
		transform: translateY(-2px);
	}

	.data-icon {
		font-size: var(--text-2xl);
		opacity: 0.8;
	}

	.data-value {
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-display);
		line-height: var(--line-height-display);
		text-shadow: 0 0 20px currentColor;
	}

	.data-value.mono {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-mono);
	}

	.data-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-weight: var(--font-weight-body-medium);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Accessibility: Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.data-card:hover {
			transform: none;
		}
	}
</style>
