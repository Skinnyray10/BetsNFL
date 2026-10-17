import type { NflPlayer, NflTeam } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const [teamResult, playersResult] = await Promise.allSettled([
		apiGet<{ team: NflTeam | null }>(`/api/teams/${params.id}`, fetch),
		apiGet<{ players: NflPlayer[] }>(`/api/teams/${params.id}/players`, fetch)
	]);

	return {
		team: teamResult.status === 'fulfilled' ? teamResult.value.team : null,
		players: playersResult.status === 'fulfilled' ? playersResult.value.players : [],
		error:
			teamResult.status === 'rejected'
				? teamResult.reason instanceof Error
					? teamResult.reason.message
					: 'Unable to load team'
				: null
	};
};
