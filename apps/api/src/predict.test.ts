import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseId } from './ids.ts';
import { parsePredictions, type GameInput } from './predict.ts';

const game: GameInput = {
	id: '401547353',
	name: 'Chiefs at Raiders',
	date: '2026-10-18T00:00Z',
	status: 'Scheduled',
	home: { id: '13', name: 'Raiders' },
	away: { id: '12', name: 'Chiefs' }
};

describe('parseId', () => {
	it('accepts espn-style ids', () => {
		assert.equal(parseId('401547353'), '401547353');
	});
	it('rejects urls', () => {
		assert.equal(parseId('https://evil.example'), null);
		assert.equal(parseId('../secret'), null);
	});
});

describe('parsePredictions', () => {
	it('keeps only known games and renormalizes probabilities', () => {
		const parsed = parsePredictions(
			{
				predictions: [
					{
						gameId: '401547353',
						kind: 'forecast',
						winnerId: '12',
						winnerName: 'Chiefs',
						awayScore: 27,
						homeScore: 20,
						awayWinProb: 2,
						homeWinProb: 1,
						spreadHome: 6.5,
						total: 47,
						confidence: 1.4,
						keyFactors: ['record'],
						rationale: 'Chiefs offense',
						stake: 5,
						minOdds: 1.85,
						value: 'Value based on recent form',
						warning: 'Las apuestas deportivas conllevan riesgos. Apuesta responsablemente.'
					},
					{ gameId: 'unknown' }
				]
			},
			[game]
		);
		assert.equal(parsed.length, 1);
		assert.equal(parsed[0]?.awayWinProb, 0.667);
		assert.equal(parsed[0]?.homeWinProb, 0.333);
		assert.equal(parsed[0]?.confidence, 1);
		assert.equal(parsed[0]?.stake, 5);
		assert.equal(parsed[0]?.minOdds, 1.85);
	});

	it('locks final scores to ESPN facts', () => {
		const finalGame: GameInput = {
			...game,
			status: 'Final',
			away: { id: '12', name: 'Chiefs', score: '24' },
			home: { id: '13', name: 'Raiders', score: '17' }
		};
		const parsed = parsePredictions(
			{
				predictions: [
					{
						gameId: '401547353',
						kind: 'forecast',
						winnerId: '12',
						winnerName: 'Chiefs',
						awayScore: 99,
						homeScore: 0,
						awayWinProb: 0.6,
						homeWinProb: 0.4,
						spreadHome: 3,
						total: 40,
						confidence: 0.5,
						keyFactors: [],
						rationale: 'x',
						stake: 3,
						minOdds: 1.75,
						value: 'Historical analysis',
						warning: 'Las apuestas deportivas conllevan riesgos. Apuesta responsablemente.'
					}
				]
			},
			[finalGame]
		);
		assert.equal(parsed[0]?.kind, 'result_analysis');
		assert.equal(parsed[0]?.awayScore, 24);
		assert.equal(parsed[0]?.homeScore, 17);
	});
});
