import type { GameWithPrediction } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await apiGet<{ games: GameWithPrediction[] }>('/api/predictions', fetch);

		// Calculate dashboard stats
		const games = data.games || [];
		const highConfidenceGames = games.filter(g => g.prediction && g.prediction.confidence >= 70);
		const avgConfidence = games.length > 0
			? games.reduce((acc, g) => acc + (g.prediction?.confidence || 0), 0) / games.length
			: 0;

		// Get featured games (upcoming with high confidence)
		const featuredGames = games
			.filter(g => g.status !== 'STATUS_FINAL' && g.prediction)
			.sort((a, b) => (b.prediction?.confidence || 0) - (a.prediction?.confidence || 0))
			.slice(0, 6);

		return {
			games,
			stats: {
				totalGames: games.length,
				highConfidencePicks: highConfidenceGames.length,
				avgConfidence: Math.round(avgConfidence)
			},
			featuredGames,
			error: null as string | null
		};
	} catch (error) {
		return {
			games: [] as GameWithPrediction[],
			stats: { totalGames: 0, highConfidencePicks: 0, avgConfidence: 0 },
			featuredGames: [] as GameWithPrediction[],
			error: error instanceof Error ? error.message : 'Unable to load predictions'
		};
	}
};
