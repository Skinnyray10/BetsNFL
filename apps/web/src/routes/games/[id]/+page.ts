import type { NflGame, NflPrediction } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const data = await apiGet<{ prediction: NflPrediction | null; game: NflGame }>(
			`/api/games/${params.id}/prediction`,
			fetch
		);
		return { game: data.game, prediction: data.prediction, error: null as string | null };
	} catch (error) {
		return {
			game: null,
			prediction: null,
			error: error instanceof Error ? error.message : 'Unable to load forecast'
		};
	}
};
