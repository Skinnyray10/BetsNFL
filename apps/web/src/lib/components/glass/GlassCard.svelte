<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/**
		 * Card variant
		 * - default: Standard glass card
		 * - featured: Thicker border + glow
		 * - interactive: Adds hover state
		 */
		variant?: 'default' | 'featured' | 'interactive';
		/**
		 * Additional CSS classes
		 */
		class?: string;
		/**
		 * Content snippet
		 */
		children: Snippet;
	}

	let { variant = 'default', class: className = '', children }: Props = $props();
</script>

<div
	class="glass-card {variant} {className}"
	class:glass-hover={variant === 'interactive'}
>
	{@render children()}
</div>

<style>
	.glass-card {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur) var(--glass-saturate);
		-webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
		border: 1px solid var(--glass-border);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-glass);
		transition: all var(--transition-base);
		position: relative;
	}

	.glass-card.featured {
		border: 2px solid var(--glass-border);
		box-shadow:
			var(--shadow-glass),
			0 0 40px var(--glass-glow);
	}

	.glass-card.interactive {
		cursor: pointer;
	}

	.glass-hover:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
		box-shadow: var(--shadow-glass-hover);
		transform: scale(1.02);
	}

	/* Accessibility: Remove scale on reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.glass-hover:hover {
			transform: none;
		}
	}
</style>
