<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Bets — NFL board</title>
	<meta name="description" content="NFL board: ESPN facts, AI forecasts on the server." />
</svelte:head>

<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
	<header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
		<a href="/" class="group flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 shadow-lg shadow-gold/20 transition group-hover:shadow-gold/40">
				<svg class="h-6 w-6 text-field" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</div>
			<div>
				<span class="text-gold block text-xl font-bold tracking-tight">Bets</span>
				<span class="block text-xs text-white/50">NFL Prediction Board</span>
			</div>
		</a>
		<nav class="flex gap-2">
			<a
				class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
				href="/"
			>
				Teams
			</a>
			<a
				class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
				href="/games"
			>
				Games
			</a>
		</nav>
	</header>
	<main class="flex-1">{@render children()}</main>
	<footer class="mt-12 space-y-3 border-t border-white/10 pt-6">
		<div class="flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
			<p>Facts via ESPN API · AI Forecasts powered by Claude · Server-side only</p>
			<div class="flex items-center gap-2">
				<span class="flex h-2 w-2 rounded-full bg-green-400/60 shadow-lg shadow-green-400/50"></span>
				<span class="text-xs text-white/50">System Online</span>
			</div>
		</div>
		<div class="rounded-lg border border-amber-400/20 bg-amber-950/20 px-3 py-2 text-xs text-amber-200/70">
			⚠️ <strong>Disclaimer:</strong> All predictions are informational only. Not betting advice. Sports betting carries risk.
		</div>
	</footer>
</div>
