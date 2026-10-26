<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// Navigation items
	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/games', label: 'Games', icon: '🏈' },
		{ href: '/teams', label: 'Teams', icon: '🏆' }
	];

	// Determine active nav item
	const isActive = (href: string) => {
		if (href === '/') {
			return data.pathname === '/';
		}
		return data.pathname.startsWith(href);
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Bets — NFL Quantum Glass</title>
	<meta name="description" content="NFL predictions powered by AI. Data-driven insights with integrated bankroll management." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800&family=JetBrains+Mono:wght@500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="layout-container">
	<!-- Glass Header -->
	<header class="glass-header">
		<div class="header-content">
			<!-- Logo -->
			<a href="/" class="logo-link">
				<div class="logo-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div class="logo-text">
					<span class="logo-title">Bets</span>
					<span class="logo-subtitle">NFL Quantum Glass</span>
				</div>
			</a>

			<!-- Navigation -->
			<nav class="nav">
				{#each navItems as item}
					<a
						href={item.href}
						class="nav-item"
						class:active={isActive(item.href)}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						<span class="nav-icon">{item.icon}</span>
						<span class="nav-label">{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main-content">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-info">
			<p class="footer-text">
				Data via ESPN API · AI Predictions powered by Groq · Server-side only
			</p>
			<div class="status-indicator">
				<span class="status-dot"></span>
				<span class="status-text">System Online</span>
			</div>
		</div>

		<!-- Responsible Gambling Disclaimer -->
		<div class="disclaimer">
			<span class="disclaimer-icon">⚠️</span>
			<div class="disclaimer-content">
				<strong>Responsible Gambling:</strong> All predictions are for informational and entertainment purposes only. This is not betting advice. Sports betting carries financial risk. Only bet what you can afford to lose. If you have a gambling problem, seek help at 1-800-GAMBLER.
			</div>
		</div>
	</footer>
</div>

<style>
	.layout-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--spacing-4);
	}

	/* ========================================
	   GLASS HEADER
	   ======================================== */
	.glass-header {
		position: sticky;
		top: 0;
		z-index: 100;
		margin: var(--spacing-6) calc(-1 * var(--spacing-4)) var(--spacing-8);
		padding: var(--spacing-4) var(--spacing-4);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur) var(--glass-saturate);
		-webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
		border-bottom: 1px solid var(--glass-border);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-4);
		flex-wrap: wrap;
	}

	/* Logo */
	.logo-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		text-decoration: none;
		transition: all var(--transition-base);
	}

	.logo-link:hover .logo-icon {
		box-shadow: 0 0 30px rgba(255, 213, 0, 0.5);
		transform: scale(1.05);
	}

	.logo-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--neon-gold);
		border-radius: var(--border-radius-base);
		box-shadow: var(--shadow-brutal-sm);
		transition: all var(--transition-base);
	}

	.logo-icon .icon {
		width: 24px;
		height: 24px;
		color: var(--base-950);
		stroke-width: 2.5;
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.logo-title {
		font-family: var(--font-display);
		font-weight: var(--font-weight-display);
		font-size: var(--text-xl);
		color: var(--neon-gold);
		letter-spacing: var(--letter-spacing-display);
		line-height: 1;
	}

	.logo-subtitle {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-weight: var(--font-weight-body);
	}

	/* Navigation */
	.nav {
		display: flex;
		gap: var(--spacing-2);
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--border-radius-base);
		border: 1px solid var(--glass-border);
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-body-medium);
		text-decoration: none;
		transition: all var(--transition-base);
		position: relative;
	}

	.nav-item:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
		color: var(--text-primary);
	}

	.nav-item.active {
		background: var(--glass-bg-hover);
		border-bottom: 3px solid var(--neon-gold);
		color: var(--neon-gold);
		padding-bottom: calc(var(--spacing-2) - 2px);
	}

	.nav-icon {
		font-size: var(--text-base);
		line-height: 1;
	}

	.nav-label {
		line-height: 1;
	}

	/* ========================================
	   MAIN CONTENT
	   ======================================== */
	.main-content {
		flex: 1;
		margin-bottom: var(--gap-section);
	}

	/* ========================================
	   FOOTER
	   ======================================== */
	.footer {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-4);
		padding-top: var(--spacing-6);
		border-top: 1px solid var(--glass-border);
		margin-top: auto;
		margin-bottom: var(--spacing-6);
	}

	.footer-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-4);
		flex-wrap: wrap;
	}

	.footer-text {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin: 0;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--neon-green);
		box-shadow: 0 0 12px var(--neon-green);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.status-text {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	/* Disclaimer */
	.disclaimer {
		display: flex;
		gap: var(--spacing-3);
		padding: var(--spacing-4);
		background: rgba(255, 51, 102, 0.08);
		border: 1px solid rgba(255, 51, 102, 0.3);
		border-radius: var(--border-radius-base);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.disclaimer-icon {
		font-size: var(--text-lg);
		flex-shrink: 0;
	}

	.disclaimer-content {
		flex: 1;
	}

	.disclaimer strong {
		color: var(--text-primary);
	}

	/* ========================================
	   RESPONSIVE
	   ======================================== */
	@media (max-width: 768px) {
		.nav {
			width: 100%;
			justify-content: center;
		}

		.nav-item {
			flex: 1;
			justify-content: center;
		}

		.nav-label {
			display: none;
		}

		.nav-icon {
			font-size: var(--text-lg);
		}

		.logo-subtitle {
			display: none;
		}
	}

	/* Accessibility: Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.logo-link:hover .logo-icon,
		.status-dot {
			animation: none;
			transform: none;
		}
	}
</style>
