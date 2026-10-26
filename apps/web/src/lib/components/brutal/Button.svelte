<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/**
		 * Button variant
		 * - primary: Neon gold background, brutal shadow
		 * - secondary: Glass background, white border
		 * - ghost: Transparent, border-only
		 */
		variant?: 'primary' | 'secondary' | 'ghost';
		/**
		 * Button size
		 */
		size?: 'sm' | 'md' | 'lg';
		/**
		 * Disabled state
		 */
		disabled?: boolean;
		/**
		 * Additional CSS classes
		 */
		class?: string;
		/**
		 * Click handler
		 */
		onclick?: () => void;
		/**
		 * Link href (renders as <a> instead of <button>)
		 */
		href?: string;
		/**
		 * Content snippet
		 */
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		class: className = '',
		onclick,
		href,
		children
	}: Props = $props();

	const baseClasses = 'btn';
	const variantClass = `btn-${variant}`;
	const sizeClass = `btn-${size}`;
</script>

{#if href}
	<a
		{href}
		class="{baseClasses} {variantClass} {sizeClass} {className}"
		role="button"
		tabindex="0"
	>
		{@render children()}
	</a>
{:else}
	<button
		type="button"
		{disabled}
		{onclick}
		class="{baseClasses} {variantClass} {sizeClass} {className}"
	>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		letter-spacing: var(--letter-spacing-display);
		border-radius: var(--border-radius-base);
		transition: all var(--transition-base);
		cursor: pointer;
		text-decoration: none;
		border: none;
		outline: none;
		position: relative;
	}

	.btn:focus-visible {
		outline: 2px solid var(--neon-gold);
		outline-offset: 2px;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Sizes */
	.btn-sm {
		font-size: var(--text-sm);
		padding: var(--spacing-2) var(--spacing-4);
	}

	.btn-md {
		font-size: var(--text-base);
		padding: var(--spacing-3) var(--spacing-6);
	}

	.btn-lg {
		font-size: var(--text-lg);
		padding: var(--spacing-4) var(--spacing-8);
	}

	/* Primary - Neon gold with brutal shadow */
	.btn-primary {
		background: var(--neon-gold);
		color: var(--base-950);
		box-shadow: var(--shadow-brutal);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.9), 6px 6px 0 2px var(--neon-gold);
	}

	.btn-primary:active:not(:disabled) {
		transform: translate(4px, 4px);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.9), 4px 4px 0 2px var(--neon-gold);
	}

	/* Secondary - Glass with white border */
	.btn-secondary {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		color: var(--text-primary);
		border: 1px solid var(--glass-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
		box-shadow: 0 0 20px var(--glass-glow);
	}

	/* Ghost - Transparent, border-only */
	.btn-ghost {
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--glass-border);
	}

	.btn-ghost:hover:not(:disabled) {
		color: var(--text-primary);
		border-color: var(--neon-gold);
		background: rgba(255, 213, 0, 0.05);
	}

	/* Accessibility: Remove transforms on reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.btn-primary:hover:not(:disabled),
		.btn-primary:active:not(:disabled) {
			transform: none;
		}
	}
</style>
