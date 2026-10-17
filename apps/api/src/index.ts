import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { extraFactsFor, gamesFromScoreboard } from './context.js';
import { parseId } from './ids.js';
import {
	normalizeGames,
	normalizePlayers,
	normalizeTeam,
	normalizeTeams
} from './normalize.js';
import { cacheKey, getCached, runClaudePredictions, setCached, type GameInput, type Prediction } from './predict.js';
import { rapidGet } from './rapidapi.js';
import {
	calculateStake,
	calculateMinOdds,
	generateWarning,
	assessDataQuality,
	DEFAULT_BANKROLL_CONFIG
} from './bankroll.js';

config({ path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../.env') });
config();

const app = new Hono();
const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((value) => value.trim()) ?? [
	'http://localhost:5173'
];

app.use(
	'*',
	cors({
		origin: corsOrigin,
		allowMethods: ['GET', 'OPTIONS']
	})
);

app.get('/health', (c) => c.json({ ok: true }));

type ErrorStatus = 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503;

function errorStatus(status: number): ErrorStatus {
	if (
		status === 400 ||
		status === 401 ||
		status === 403 ||
		status === 404 ||
		status === 429 ||
		status === 500 ||
		status === 502 ||
		status === 503
	) {
		return status;
	}
	return 502;
}

function httpError(error: unknown) {
	const err = error as { message?: string; status?: number };
	const status = typeof err.status === 'number' ? err.status : 502;
	return {
		status: errorStatus(status),
		message: err.message ?? 'Upstream error'
	};
}

app.get('/api/teams', async (c) => {
	try {
		const payload = await rapidGet('/nfl-team-list');
		return c.json({ teams: normalizeTeams(payload) });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/teams/:id', async (c) => {
	const id = parseId(c.req.param('id'));
	if (!id) return c.json({ error: 'Invalid id' }, 400);
	try {
		const payload = await rapidGet('/nfl-team-info', { id });
		return c.json({ team: normalizeTeam(payload, id) });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/teams/:id/players', async (c) => {
	const id = parseId(c.req.param('id'));
	if (!id) return c.json({ error: 'Invalid id' }, 400);
	try {
		const payload = await rapidGet('/nfl-team-roster', { id });
		return c.json({ players: normalizePlayers(payload) });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/players/:id', async (c) => {
	return c.json(
		{ error: 'This RapidAPI lists players on team rosters only. Open a team first.' },
		404
	);
});

app.get('/api/season', async (c) => {
	try {
		const payload = await rapidGet('/nfl-season');
		return c.json({ season: payload });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/games', async (c) => {
	try {
		const payload = await rapidGet('/nfl-scoreboard');
		return c.json({ games: normalizeGames(payload) });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/games/:id', async (c) => {
	const id = parseId(c.req.param('id'));
	if (!id) return c.json({ error: 'Invalid id' }, 400);
	try {
		const payload = await rapidGet('/nfl-boxscore', { id });
		const games = normalizeGames(payload);
		return c.json({ game: games.find((game) => game.id === id) ?? games[0] ?? null });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/predictions', async (c) => {
	try {
		const payload = await rapidGet('/nfl-scoreboard');
		const games = gamesFromScoreboard(payload).slice(0, 16);
		const key = cacheKey(games);
		const cached = getCached(key);
		if (cached) return c.json({ predictions: cached, cached: true });
		const extraFacts = await extraFactsFor(games);
		const predictions = await runClaudePredictions(games, extraFacts);

		// Validate and adjust predictions based on bankroll rules
		const validatedPredictions = predictions.map((p) => {
			const dataQuality = assessDataQuality(
				extraFacts?.hasInjuries ?? false,
				extraFacts?.hasRecords ?? false,
				extraFacts?.hasHeadToHead ?? false,
				extraFacts?.hasRecentForm ?? false
			);

			// Recalculate stake if needed based on confidence and probability
			const winProb = p.winnerId === p.gameId ? p.homeWinProb : p.awayWinProb;
			const calculatedStake = calculateStake(p.confidence, winProb, p.minOdds, DEFAULT_BANKROLL_CONFIG);

			// Ensure warning is present
			const warning = p.warning || generateWarning(p.stake, p.confidence, dataQuality);

			return {
				...p,
				stake: Math.min(p.stake, calculatedStake), // Use the lower of Claude's or calculated stake
				warning
			};
		});

		setCached(key, validatedPredictions);
		return c.json({ predictions: validatedPredictions, cached: false });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

app.get('/api/games/:id/prediction', async (c) => {
	const id = parseId(c.req.param('id'));
	if (!id) return c.json({ error: 'Invalid id' }, 400);
	try {
		const [board, box] = await Promise.all([
			rapidGet('/nfl-scoreboard'),
			rapidGet('/nfl-boxscore', { id }).catch(() => null)
		]);
		const boardGames = normalizeGames(board);
		const boxGames = box ? normalizeGames(box) : [];
		const full = boardGames.find((game) => game.id === id) ?? boxGames[0] ?? null;
		if (!full) return c.json({ error: 'Game not found' }, 404);
		const game = {
			id: full.id,
			name: full.name,
			date: full.date,
			status: full.status,
			home: full.home ? { id: full.home.id, name: full.home.name, score: full.home.score } : null,
			away: full.away ? { id: full.away.id, name: full.away.name, score: full.away.score } : null
		};
		const extraFacts = await extraFactsFor([game]);
		const predictions = await runClaudePredictions([game], extraFacts);

		// Validate and adjust prediction based on bankroll rules
		const prediction = predictions[0];
		if (prediction) {
			const dataQuality = assessDataQuality(
				extraFacts.hasInjuries,
				extraFacts.hasRecords,
				extraFacts.hasHeadToHead,
				extraFacts.hasRecentForm
			);

			const winProb = prediction.winnerId === game.home?.id ? prediction.homeWinProb : prediction.awayWinProb;
			const calculatedStake = calculateStake(prediction.confidence, winProb, prediction.minOdds, DEFAULT_BANKROLL_CONFIG);

			prediction.stake = Math.min(prediction.stake, calculatedStake);
			prediction.warning = prediction.warning || generateWarning(prediction.stake, prediction.confidence, dataQuality);
		}

		return c.json({ prediction: prediction ?? null, game: full });
	} catch (error) {
		const { status, message } = httpError(error);
		return c.json({ error: message }, status);
	}
});

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
	console.log(`API listening on http://localhost:${port}`);
});
