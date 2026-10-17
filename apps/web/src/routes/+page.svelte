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

<section class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
	<div>
		<p class="text-gold text-xs font-medium tracking-[0.2em] uppercase">RapidAPI · NFL</p>
		<h1 class="mt-1 text-3xl font-semibold">Teams</h1>
	</div>
	<input
		bind:value={query}
		placeholder="Search teams"
		class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-gold/60 sm:w-72"
	/>
</section>

{#if data.error}
	<p class="rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
		{data.error}. Set <code class="text-gold">RAPIDAPI_KEY</code> in <code class="text-gold">.env</code> and start the API.
	</p>
{:else if teams.length === 0}
	<p class="text-white/50">No teams match that search.</p>
{:else}
	<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each teams as team (team.id)}
			<li>
				<a
					href="/teams/{team.id}"
					class="flex items-center gap-3 rounded-xl border border-white/10 bg-turf/70 p-3 transition hover:border-gold/40"
				>
					<span
						class="h-2.5 w-2.5 shrink-0 rounded-full"
						style="background: {hexColor(team.color, '#e4c36a')}"
					></span>
					{#if team.logo}
						<img src={team.logo} alt="" class="h-12 w-12 object-contain" />
					{:else}
						<span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
							{team.abbreviation}
						</span>
					{/if}
					<div>
						<p class="font-medium">{team.name}</p>
						<p class="text-xs text-white/50">{team.abbreviation}{team.conference ? ` · ${team.conference}` : ''}</p>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}
