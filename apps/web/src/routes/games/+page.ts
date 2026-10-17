import type { NflGame } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await apiGet<{ games: NflGame[] }>('/api/games', fetch);
		return { games: data.games, error: null as string | null };
	} catch (error) {
		return { games: [] as NflGame[], error: error instanceof Error ? error.message : 'Unable to load games' };
	}
};
