import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parsePredictions, type GameInput } from './predict.js';
import {
	calculateStake,
	validateBet,
	generateWarning,
	calculateMinOdds,
	assessDataQuality,
	DEFAULT_BANKROLL_CONFIG
} from './bankroll.js';

describe('Bankroll Integration Tests', () => {
	const game: GameInput = {
		id: '401547353',
		name: 'Chiefs at Raiders',
		date: '2026-10-18T00:00Z',
		status: 'Scheduled',
		home: { id: '13', name: 'Raiders' },
		away: { id: '12', name: 'Chiefs' }
	};

	it('processes prediction with bankroll fields', () => {
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
						awayWinProb: 0.6,
						homeWinProb: 0.4,
						spreadHome: -3.5,
						total: 47.5,
						confidence: 0.75,
						keyFactors: ['Chiefs 5-1 in last 6', 'Mahomes healthy', 'Raiders defense ranked 28th'],
						rationale: 'Chiefs have superior offense and healthier roster',
						stake: 6,
						minOdds: 1.85,
						value: 'Edge based on Chiefs recent form and Raiders defensive struggles',
						warning: 'Las apuestas deportivas conllevan riesgos. Apuesta responsablemente.'
					}
				]
			},
			[game]
		);

		assert.equal(parsed.length, 1);
		const pred = parsed[0]!;
		assert.equal(pred.stake, 6);
		assert.equal(pred.minOdds, 1.85);
		assert.ok(pred.value.length > 0);
		assert.ok(pred.warning.includes('Apuesta responsablemente'));
	});

	it('validates high stake prediction', () => {
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
						awayWinProb: 0.65,
						homeWinProb: 0.35,
						spreadHome: -4,
						total: 48,
						confidence: 0.85,
						keyFactors: ['Strong form'],
						rationale: 'x',
						stake: 8,
						minOdds: 1.90,
						value: 'High confidence with good odds',
						warning: 'Las apuestas deportivas conllevan riesgos. Apuesta responsablemente.'
					}
				]
			},
			[game]
		);

		const pred = parsed[0]!;
		const validation = validateBet(pred.stake, 1000);
		assert.equal(validation.valid, true);

		const warning = generateWarning(pred.stake, pred.confidence, 'high');
		assert.ok(warning.includes('Stake alto'));
	});

	it('calculates appropriate stake for moderate confidence', () => {
		const winProb = 0.55;
		const odds = 1.90;
		const confidence = 0.6;

		const stake = calculateStake(confidence, winProb, odds, DEFAULT_BANKROLL_CONFIG);

		assert.ok(stake >= 1 && stake <= 10);
		assert.ok(stake <= 5, 'Moderate confidence should not result in high stake');
	});

	it('generates warning for low data quality', () => {
		const warning = generateWarning(3, 0.7, 'low');
		assert.ok(warning.includes('Información limitada'));
		assert.ok(warning.includes('Apuesta responsablemente'));
	});

	it('calculates minimum odds ensuring positive EV', () => {
		const winProb = 0.6;
		const minOdds = calculateMinOdds(winProb, 0.05);

		const fairOdds = 1 / winProb;
		assert.ok(minOdds > fairOdds, 'Min odds should include margin');
		assert.ok(minOdds >= 1.01, 'Min odds should be above floor');
	});

	it('assesses data quality correctly', () => {
		const highQuality = assessDataQuality(true, true, true, true);
		assert.equal(highQuality, 'high');

		const mediumQuality = assessDataQuality(true, true, false, false);
		assert.equal(mediumQuality, 'medium');

		const lowQuality = assessDataQuality(false, false, false, true);
		assert.equal(lowQuality, 'low');
	});

	it('defaults missing bankroll fields safely', () => {
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
						awayWinProb: 0.6,
						homeWinProb: 0.4,
						spreadHome: -3.5,
						total: 47.5,
						confidence: 0.75,
						keyFactors: ['Form'],
						rationale: 'x',
						stake: 0,
						minOdds: 0,
						value: '',
						warning: ''
					}
				]
			},
			[game]
		);

		const pred = parsed[0]!;
		assert.equal(pred.stake, 1, 'Should default to 1');
		assert.ok(pred.minOdds >= 1.01, 'Should default to safe minimum');
		assert.ok(pred.value.length > 0, 'Should have default value text');
		assert.ok(pred.warning.includes('Apuesta responsablemente'), 'Should have default warning');
	});

	it('ensures stake limits are respected', () => {
		const validation = validateBet(10, 100);
		assert.equal(validation.valid, true, '10/10 stake should be valid with 100 bankroll (5% = 5 units)');

		// Test that validation checks stake range
		const highStakeValidation = validateBet(11, 100);
		assert.equal(highStakeValidation.valid, false, 'Stake above 10 should be invalid');

		const lowStakeValidation = validateBet(0, 100);
		assert.equal(lowStakeValidation.valid, false, 'Stake below 1 should be invalid');
	});
});
