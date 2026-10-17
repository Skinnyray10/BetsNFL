<script lang="ts">
	import { hexColor } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#if data.error || !data.team}
	<p class="text-red-100">{data.error ?? 'Team not found.'}</p>
{:else}
	{@const team = data.team}
	<section
		class="mb-8 overflow-hidden rounded-2xl border border-white/10"
		style="background: linear-gradient(135deg, {hexColor(team.color, '#0f2a1c')} 0%, #07140f 70%)"
	>
		<div class="flex items-center gap-4 p-6">
			{#if team.logo}
				<img src={team.logo} alt="" class="h-20 w-20 object-contain" />
			{/if}
			<div>
				<p class="text-sm text-white/70">{team.location}</p>
				<h1 class="text-3xl font-semibold">{team.name}</h1>
				<p class="mt-1 text-sm text-gold">{team.abbreviation}</p>
			</div>
		</div>
	</section>

	<h2 class="mb-3 text-lg font-medium">Roster</h2>
	{#if data.players.length === 0}
		<p class="text-white/50">No players returned for this team.</p>
	{:else}
		<ul class="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
			{#each data.players as player (player.id)}
				<li>
					<a href="/players/{player.id}" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
						{#if player.headshot}
							<img src={player.headshot} alt="" class="h-10 w-10 rounded-full object-cover" />
						{:else}
							<span class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs">
								{player.jersey ?? '—'}
							</span>
						{/if}
						<div class="flex-1">
							<p class="font-medium">{player.displayName}</p>
							<p class="text-xs text-white/50">{player.position || 'Player'}</p>
						</div>
						{#if player.jersey}
							<span class="text-gold text-sm">#{player.jersey}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
