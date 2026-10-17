import type { NflTeam } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await apiGet<{ teams: NflTeam[] }>('/api/teams', fetch);
		return { teams: data.teams, error: null as string | null };
	} catch (error) {
		return { teams: [] as NflTeam[], error: error instanceof Error ? error.message : 'Unable to load teams' };
	}
};
