import type { NflPlayer } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const data = await apiGet<{ player: NflPlayer | null }>(`/api/players/${params.id}`, fetch);
		return { player: data.player, error: null as string | null };
	} catch (error) {
		return {
			player: null,
			error: error instanceof Error ? error.message : 'Unable to load player'
		};
	}
};
