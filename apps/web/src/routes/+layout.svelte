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
	<header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
		<a href="/" class="flex items-baseline gap-2">
			<span class="text-gold text-xl font-semibold tracking-tight">Bets</span>
			<span class="text-sm text-white/50">NFL board</span>
		</a>
		<nav class="flex gap-5 text-sm text-white/70">
			<a class="hover:text-gold" href="/">Teams</a>
			<a class="hover:text-gold" href="/games">Games</a>
		</nav>
	</header>
	<main class="flex-1">{@render children()}</main>
	<footer class="mt-12 border-t border-white/10 pt-4 text-xs text-white/40">
		Facts via ESPN. Forecasts via AI on the server. Keys stay on the server. Not betting advice.
	</footer>
</div>
