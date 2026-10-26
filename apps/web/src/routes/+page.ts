import type { GameWithPrediction, NflGame, NflPrediction } from '@bets/shared';
import { apiGet } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [gamesData, predData] = await Promise.all([
			apiGet<{ games: NflGame[] }>('/api/games', fetch),
			apiGet<{ predictions: NflPrediction[] }>('/api/predictions', fetch).catch(() => ({ predictions: [] as NflPrediction[] }))
		]);

		const games: GameWithPrediction[] = gamesData.games
			.filter((game) => game.away && game.home)
			.map((game) => ({ ...game, prediction: predData.predictions.find((p) => p.gameId === game.id) }));

		const forecasts = games.filter((g) => g.prediction?.kind === 'forecast');
		const highConfidenceGames = forecasts.filter((g) => (g.prediction?.confidence ?? 0) >= 0.7);
		const avgConfidence = forecasts.length > 0
			? (forecasts.reduce((acc, g) => acc + (g.prediction?.confidence ?? 0), 0) / forecasts.length) * 100
			: 0;

		const featuredGames = forecasts
			.sort((a, b) => (b.prediction?.confidence ?? 0) - (a.prediction?.confidence ?? 0))
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
			error: error instanceof Error ? error.message : 'Unable to load games'
		};
	}
};
