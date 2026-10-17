<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#if data.error || !data.player}
	<p class="text-red-100">{data.error ?? 'Player not found.'}</p>
{:else}
	{@const player = data.player}
	<section class="flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-turf/60 p-6 sm:flex-row">
		{#if player.headshot}
			<img src={player.headshot} alt="" class="h-36 w-36 rounded-2xl object-cover" />
		{/if}
		<div>
			<p class="text-gold text-sm">{player.position || 'NFL'}</p>
			<h1 class="text-3xl font-semibold">{player.displayName}</h1>
			<p class="mt-1 text-white/60">{player.fullName}</p>
			<dl class="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
				{#if player.jersey}
					<div><dt class="text-white/40">Jersey</dt><dd>#{player.jersey}</dd></div>
				{/if}
				{#if player.teamName}
					<div>
						<dt class="text-white/40">Team</dt>
						<dd>
							{#if player.teamId}
								<a class="text-gold hover:underline" href="/teams/{player.teamId}">{player.teamName}</a>
							{:else}
								{player.teamName}
							{/if}
						</dd>
					</div>
				{/if}
				{#if player.height}
					<div><dt class="text-white/40">Height</dt><dd>{player.height}</dd></div>
				{/if}
				{#if player.weight}
					<div><dt class="text-white/40">Weight</dt><dd>{player.weight}</dd></div>
				{/if}
			</dl>
		</div>
	</section>
{/if}
