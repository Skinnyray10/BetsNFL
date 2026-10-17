import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isClaudeError, generateFallbackPrediction } from './fallback.js';
import type { GameInput } from './predict.js';
import type { TeamFacts } from './facts.js';
import { isFinalStatus } from './ids.js';

describe('isClaudeError', () => {
	it('detects insufficient funds error', () => {
		const error = new Error('Insufficient funds') as Error & { status?: number };
		assert.equal(isClaudeError(error), true);
	});

	it('detects quota error', () => {
		const error = new Error('quota exceeded') as Error & { status?: number };
		assert.equal(isClaudeError(error), true);
	});

	it('detects 402 status', () => {
		const error = new Error('Payment required') as Error & { status?: number };
		error.status = 402;
		assert.equal(isClaudeError(error), true);
	});

	it('detects 429 status', () => {
		const error = new Error('Too many requests') as Error & { status?: number };
		error.status = 429;
		assert.equal(isClaudeError(error), true);
	});

	it('does not flag other errors', () => {
		const error = new Error('Network error') as Error & { status?: number };
		assert.equal(isClaudeError(error), false);
	});

	it('handles null error', () => {
		assert.equal(isClaudeError(null), false);
	});
});

describe('generateFallbackPrediction', () => {
	const game: GameInput = {
		id: '401547353',
		name: 'Chiefs at Raiders',
		date: '2026-10-18T00:00Z',
		status: 'Scheduled',
		home: { id: '13', name: 'Raiders' },
		away: { id: '12', name: 'Chiefs' }
	};

	const teamFacts = new Map<string, TeamFacts>([
		[
			'12',
			{
				id: '12',
				name: 'Chiefs',
				records: [
					{
						summary: '5-1',
						stats: [
							{ name: 'avgPointsFor', displayValue: '28.5' },
							{ name: 'avgPointsAgainst', displayValue: '21.3' }
						]
					}
				],
				injuries: ['Patrick Mahomes (questionable)']
			}
		],
		[
			'13',
			{
				id: '13',
				name: 'Raiders',
				records: [
					{
						summary: '3-3',
						stats: [
							{ name: 'avgPointsFor', displayValue: '22.1' },
							{ name: 'avgPointsAgainst', displayValue: '24.5' }
						]
					}
				],
				injuries: []
			}
		]
	]);

	it('generates prediction from team facts', () => {
		const prediction = generateFallbackPrediction(game, teamFacts);

		assert.equal(prediction.gameId, '401547353');
		assert.equal(prediction.kind, 'forecast');
		assert.ok(prediction.winnerId === '12' || prediction.winnerId === '13');
		assert.ok(prediction.awayScore > 0);
		assert.ok(prediction.homeScore > 0);
		assert.equal(prediction.awayWinProb + prediction.homeWinProb, 1);
		assert.ok(prediction.confidence >= 0.5 && prediction.confidence <= 0.85);
		assert.ok(prediction.stake >= 1 && prediction.stake <= 10);
		assert.ok(prediction.minOdds >= 1.01);
	});

	it('favors team with better record', () => {
		const prediction = generateFallbackPrediction(game, teamFacts);
		// Chiefs have 5-1 vs Raiders 3-3, so Chiefs should be favored
		assert.equal(prediction.winnerId, '12');
		assert.equal(prediction.winnerName, 'Chiefs');
	});

	it('includes injury information in key factors', () => {
		const prediction = generateFallbackPrediction(game, teamFacts);
		assert.ok(prediction.keyFactors.some((f) => f.includes('lesiones')));
	});

	it('marks prediction as fallback in rationale', () => {
		const prediction = generateFallbackPrediction(game, teamFacts);
		assert.ok(prediction.rationale.includes('[FALLBACK - Sistema local]'));
	});

	it('includes fallback warning', () => {
		const prediction = generateFallbackPrediction(game, teamFacts);
		assert.ok(prediction.warning.includes('Predicción generada por sistema local'));
	});

	it('handles missing team facts', () => {
		const emptyFacts = new Map<string, TeamFacts>();
		const prediction = generateFallbackPrediction(game, emptyFacts);

		assert.equal(prediction.gameId, '401547353');
		assert.ok(prediction.confidence >= 0.5);
		assert.ok(prediction.stake >= 1);
	});

	it('handles final games', () => {
		const finalGame: GameInput = {
			...game,
			status: 'Final',
			home: { id: '13', name: 'Raiders', score: '24' },
			away: { id: '12', name: 'Chiefs', score: '21' }
		};

		const prediction = generateFallbackPrediction(finalGame, teamFacts);
		assert.equal(prediction.kind, 'result_analysis');
		assert.ok(isFinalStatus(finalGame.status));
	});

	it('clamps probabilities to realistic range (5-95%)', () => {
		const prediction = generateFallbackPrediction(game, teamFacts);

		// Ensure probabilities are never 0% or 100%
		assert.ok(prediction.awayWinProb >= 0.05, 'Away win prob should be at least 5%');
		assert.ok(prediction.awayWinProb <= 0.95, 'Away win prob should be at most 95%');
		assert.ok(prediction.homeWinProb >= 0.05, 'Home win prob should be at least 5%');
		assert.ok(prediction.homeWinProb <= 0.95, 'Home win prob should be at most 95%');

		// Ensure they sum to 1
		assert.ok(Math.abs(prediction.awayWinProb + prediction.homeWinProb - 1) < 0.01);
	});
});
