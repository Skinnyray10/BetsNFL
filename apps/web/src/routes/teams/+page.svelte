<script lang="ts">
	import { hexColor } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let query = $state('');

	const teams = $derived(
		data.teams.filter((team) => {
			const haystack = `${team.name} ${team.abbreviation} ${team.location}`.toLowerCase();
			return haystack.includes(query.trim().toLowerCase());
		})
	);
</script>

<section class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
	<div>
		<p class="text-gold text-xs font-medium tracking-[0.2em] uppercase">NFL Teams Database</p>
		<h1 class="mt-1 text-3xl font-bold">All Teams</h1>
		<p class="mt-2 text-sm text-white/50">{data.teams.length} teams · Data from ESPN API</p>
	</div>
	<div class="relative sm:w-80">
		<svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			bind:value={query}
			placeholder="Search by name, location, or abbreviation..."
			class="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-white/30 transition focus:border-gold/60 focus:bg-white/10"
		/>
	</div>
</section>

{#if data.error}
	<div class="rounded-lg border border-red-400/30 bg-red-950/40 p-4">
		<div class="flex items-start gap-3">
			<svg class="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div class="flex-1">
				<p class="text-sm font-semibold text-red-100">{data.error}</p>
				<p class="mt-1 text-xs text-red-200/70">
					Set <code class="text-gold rounded bg-red-950/50 px-1.5 py-0.5">RAPIDAPI_KEY</code> in <code class="text-gold rounded bg-red-950/50 px-1.5 py-0.5">.env</code> and restart the API server.
				</p>
			</div>
		</div>
	</div>
{:else if teams.length === 0}
	<div class="flex flex-col items-center justify-center py-12">
		<svg class="h-16 w-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<p class="mt-4 text-sm text-white/50">No teams match "{query}"</p>
	</div>
{:else}
	<div class="mb-4 text-xs text-white/40">
		Showing {teams.length} team{teams.length !== 1 ? 's' : ''}
	</div>
	<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each teams as team (team.id)}
			<li>
				<a
					href="/teams/{team.id}"
					class="group flex items-center gap-4 rounded-xl border border-white/10 bg-turf/70 p-4 transition hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
				>
					<div class="relative">
						{#if team.logo}
							<img src={team.logo} alt={team.name} class="h-14 w-14 object-contain drop-shadow-lg transition group-hover:scale-110" />
						{:else}
							<span class="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-base font-bold">
								{team.abbreviation}
							</span>
						{/if}
						<span
							class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-turf shadow-lg"
							style="background: {hexColor(team.color, '#e4c36a')}"
						></span>
					</div>
					<div class="flex-1 min-w-0">
						<p class="font-semibold truncate group-hover:text-gold transition">{team.name}</p>
						<p class="text-xs text-white/50 truncate">{team.location}</p>
						<div class="mt-1 flex items-center gap-2">
							<span class="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">{team.abbreviation}</span>
							{#if team.conference}
								<span class="text-xs text-white/40">{team.conference}</span>
							{/if}
						</div>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}
