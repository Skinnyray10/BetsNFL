import Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema';
import { claudeApiKey, claudeModel } from './secrets.js';
import { isFinalStatus } from './ids.js';
import { isClaudeError, generateFallbackPredictions } from './fallback.js';
import type { TeamFacts } from './facts.js';

export type GameInput = {
	id: string;
	name: string;
	date: string;
	status: string;
	home: { id: string; name: string; score?: string } | null;
	away: { id: string; name: string; score?: string } | null;
};

export type Prediction = {
	gameId: string;
	kind: 'forecast' | 'result_analysis';
	winnerId: string;
	winnerName: string;
	awayScore: number;
	homeScore: number;
	awayWinProb: number;
	homeWinProb: number;
	spreadHome: number;
	total: number;
	confidence: number;
	keyFactors: string[];
	rationale: string;
	stake: number;
	minOdds: number;
	value: string;
	warning: string;
};

const schema = {
	type: 'object',
	additionalProperties: false,
	required: ['predictions'],
	properties: {
		predictions: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: [
					'gameId',
					'kind',
					'winnerId',
					'winnerName',
					'awayScore',
					'homeScore',
					'awayWinProb',
					'homeWinProb',
					'spreadHome',
					'total',
					'confidence',
					'keyFactors',
					'rationale',
					'stake',
					'minOdds',
					'value',
					'warning'
				],
				properties: {
					gameId: { type: 'string' },
					kind: { type: 'string', enum: ['forecast', 'result_analysis'] },
					winnerId: { type: 'string' },
					winnerName: { type: 'string' },
					awayScore: { type: 'number' },
					homeScore: { type: 'number' },
					awayWinProb: { type: 'number' },
					homeWinProb: { type: 'number' },
					spreadHome: { type: 'number' },
					total: { type: 'number' },
					confidence: { type: 'number' },
					keyFactors: { type: 'array', items: { type: 'string' } },
					rationale: { type: 'string' },
					stake: { type: 'number' },
					minOdds: { type: 'number' },
					value: { type: 'string' },
					warning: { type: 'string' }
				}
			}
		}
	}
} as const;

const SYSTEM = `You are a calibrated NFL forecasting model with responsible betting guidance.

## Core Rules
Use ONLY the facts in the user message (RapidAPI/ESPN-derived). Do not invent injuries, weather, coaching news, or stats.

## Game Status Handling
If a game status is final, kind must be result_analysis: copy the official scores from the facts, do not invent a different result, and explain why it unfolded that way.
If a game is not final, kind must be forecast: predicted scores, win probabilities, home spread (negative means home favored), and total.

## Probability Calibration (MANDATORY)
awayWinProb + homeWinProb must equal 1 (within 0.01).
**NEVER use 0% or 100% probabilities** - sports have inherent uncertainty.
- Minimum probability: 5% (no lower, ever)
- Maximum probability: 95% (no higher, ever)
- For well-matched teams (record difference ≤ 2 games): keep probabilities between 40-60%
- For clear favorites: maximum 85% (even perfect teams lose)
- Be calibrated: avoid 90%+ unless the facts are extremely lopsided
confidence is 0-1 for how well the supplied facts support the call.

## Bankroll Management (MANDATORY)
- stake: Recommended stake on a 1-10 scale. Only recommend 5+ when there is clear value. Default to 1-3 for uncertain predictions.
- minOdds: Minimum acceptable decimal odds (e.g., 1.90, 2.10). Below this, the bet has no value.
- value: Brief explanation of why this bet offers value (edge over implied probability). Be specific about the edge.
- warning: Always include "Las apuestas deportivas conllevan riesgos. Apuesta responsablemente." or a more specific risk warning.

## Transparency
- Clearly indicate when data is insufficient or uncertain
- Never guarantee results - sports are unpredictable
- Provide rationale grounded in the supplied facts only

## Key Factors
keyFactors: 2-5 short bullets grounded in the facts (injuries, records, trends, head-to-head, home/away performance).

## Output
Return one prediction per gameId you were given with all required fields including stake, minOdds, value, and warning.`;

export function normalizeProbabilities(item: Prediction): Prediction {
	let away = item.awayWinProb;
	let home = item.homeWinProb;
	if (!Number.isFinite(away)) away = 0.5;
	if (!Number.isFinite(home)) home = 0.5;
	const sum = away + home;
	if (sum <= 0) {
		away = 0.5;
		home = 0.5;
	} else {
		away /= sum;
		home /= sum;
	}

	// Clamp probabilities to realistic range (5% - 95%)
	// Sports never have 0% or 100% certainty
	away = Math.max(0.05, Math.min(0.95, away));
	home = 1 - away;

	return {
		...item,
		awayWinProb: Math.round(away * 1000) / 1000,
		homeWinProb: Math.round(home * 1000) / 1000,
		confidence: Math.min(1, Math.max(0, item.confidence)),
		keyFactors: item.keyFactors.slice(0, 6).map((factor) => factor.slice(0, 180)),
		rationale: item.rationale.slice(0, 1200),
		stake: Math.min(10, Math.max(1, item.stake)),
		minOdds: Math.max(1.01, item.minOdds),
		value: item.value.slice(0, 500),
		warning: item.warning.slice(0, 300)
	};
}

export function parsePredictions(payload: unknown, games: GameInput[]): Prediction[] {
	const list =
		payload && typeof payload === 'object' && Array.isArray((payload as { predictions?: unknown }).predictions)
			? ((payload as { predictions: unknown[] }).predictions)
			: [];
	const byId = new Map(games.map((game) => [game.id, game]));
	const result: Prediction[] = [];
	for (const row of list) {
		if (!row || typeof row !== 'object') continue;
		const item = row as Record<string, unknown>;
		const gameId = typeof item.gameId === 'string' ? item.gameId : '';
		const game = byId.get(gameId);
		if (!game) continue;
		const prediction = normalizeProbabilities({
			gameId,
			kind: item.kind === 'result_analysis' || isFinalStatus(game.status) ? 'result_analysis' : 'forecast',
			winnerId: String(item.winnerId ?? ''),
			winnerName: String(item.winnerName ?? ''),
			awayScore: Number(item.awayScore),
			homeScore: Number(item.homeScore),
			awayWinProb: Number(item.awayWinProb),
			homeWinProb: Number(item.homeWinProb),
			spreadHome: Number(item.spreadHome),
			total: Number(item.total),
			confidence: Number(item.confidence),
			keyFactors: Array.isArray(item.keyFactors) ? item.keyFactors.filter((f) => typeof f === 'string') : [],
			rationale: typeof item.rationale === 'string' ? item.rationale : '',
			stake: Number(item.stake) || 1,
			minOdds: Number(item.minOdds) || 1.50,
			value: typeof item.value === 'string' && item.value.trim() ? item.value : 'Análisis basado en estadísticas disponibles',
			warning: typeof item.warning === 'string' && item.warning.trim() ? item.warning : 'Las apuestas deportivas conllevan riesgos. Apuesta responsablemente.'
		});
		if (prediction.kind === 'result_analysis' && game.away?.score && game.home?.score) {
			prediction.awayScore = Number(game.away.score);
			prediction.homeScore = Number(game.home.score);
		}
		result.push(prediction);
	}
	return result;
}

export async function runClaudePredictions(games: GameInput[], extraFacts: unknown): Promise<Prediction[]> {
	try {
		const client = new Anthropic({ apiKey: claudeApiKey() });
		const message = await client.messages.parse({
			model: claudeModel(),
			max_tokens: 4096,
			temperature: 0,
			system: SYSTEM,
			messages: [
				{
					role: 'user',
					content: JSON.stringify(
						{
							asOf: new Date().toISOString(),
							timezone: 'America/Mexico_City',
							games,
							extraFacts
						},
						null,
						2
					)
				}
			],
			output_config: {
				effort: 'high',
				format: jsonSchemaOutputFormat(schema)
			}
		});
		return parsePredictions(message.parsed_output, games);
	} catch (error) {
		if (isClaudeError(error)) {
			console.warn('Claude API error, using fallback predictions:', error);
			// Use fallback system
			const teamFactsMap = new Map<string, TeamFacts>();
			if (extraFacts && typeof extraFacts === 'object' && 'teams' in extraFacts && Array.isArray((extraFacts as { teams: unknown }).teams)) {
				const teams = (extraFacts as { teams: unknown[] }).teams;
				teams.forEach((team) => {
					if (team && typeof team === 'object' && 'id' in team) {
						teamFactsMap.set(String(team.id), team as TeamFacts);
					}
				});
			}
			return generateFallbackPredictions(games, teamFactsMap);
		}
		throw error;
	}
}

const cache = new Map<string, { expires: number; predictions: Prediction[] }>();
const TTL_MS = 15 * 60 * 1000;

export function cacheKey(games: GameInput[]): string {
	return games
		.map((game) => `${game.id}:${game.status}:${game.away?.score ?? ''}:${game.home?.score ?? ''}`)
		.sort()
		.join('|');
}

export function getCached(key: string): Prediction[] | null {
	const hit = cache.get(key);
	if (!hit || hit.expires <= Date.now()) return null;
	return hit.predictions;
}

export function setCached(key: string, predictions: Prediction[]): void {
	cache.set(key, { expires: Date.now() + TTL_MS, predictions });
}
