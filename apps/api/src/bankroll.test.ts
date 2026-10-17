import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	calculateStake,
	validateBet,
	generateWarning,
	calculateMinOdds,
	assessDataQuality,
	DEFAULT_BANKROLL_CONFIG
} from './bankroll.js';

describe('calculateStake', () => {
	it('returns low stake for low confidence', () => {
		const stake = calculateStake(0.3, 0.55, 1.90);
		assert.ok(stake >= 1 && stake <= 4);
	});

	it('returns higher stake for high confidence with value', () => {
		const stake = calculateStake(0.8, 0.6, 2.10);
		assert.ok(stake >= 5);
	});

	it('clamps stake to 1-10 range', () => {
		const low = calculateStake(0.1, 0.51, 1.90);
		const high = calculateStake(1.0, 0.8, 3.0);
		assert.equal(low, 1);
		assert.equal(high, 10);
	});

	it('returns 1 for negative edge', () => {
		const stake = calculateStake(0.7, 0.4, 1.90);
		assert.equal(stake, 1);
	});
});

describe('validateBet', () => {
	it('validates reasonable stake', () => {
		const result = validateBet(3, 1000);
		assert.equal(result.valid, true);
	});

	it('rejects stake above 10', () => {
		const result = validateBet(11, 1000);
		assert.equal(result.valid, false);
		assert.ok(result.reason?.includes('10'));
	});

	it('rejects stake below 1', () => {
		const result = validateBet(0, 1000);
		assert.equal(result.valid, false);
	});

	it('validates against bankroll percentage limit', () => {
		const result = validateBet(10, 100);
		assert.equal(result.valid, true); // 10/10 * 5% = 5%, which is at the limit
	});
});

describe('generateWarning', () => {
	it('includes responsible gambling warning', () => {
		const warning = generateWarning(3, 0.7, 'high');
		assert.ok(warning.includes('Apuesta responsablemente'));
	});

	it('adds high stake warning', () => {
		const warning = generateWarning(8, 0.7, 'high');
		assert.ok(warning.includes('Stake alto'));
	});

	it('adds low confidence warning', () => {
		const warning = generateWarning(3, 0.3, 'high');
		assert.ok(warning.includes('Baja confianza'));
	});

	it('adds low data quality warning', () => {
		const warning = generateWarning(3, 0.7, 'low');
		assert.ok(warning.includes('Información limitada'));
	});
});

describe('calculateMinOdds', () => {
	it('calculates minimum odds with margin', () => {
		const minOdds = calculateMinOdds(0.5, 0.05);
		assert.ok(minOdds > 2.0);
	});

	it('respects minimum odds floor', () => {
		const minOdds = calculateMinOdds(0.99, 0.05);
		assert.ok(minOdds >= 1.01);
	});

	it('higher probability requires lower odds', () => {
		const lowProb = calculateMinOdds(0.3, 0.05);
		const highProb = calculateMinOdds(0.7, 0.05);
		assert.ok(lowProb > highProb);
	});
});

describe('assessDataQuality', () => {
	it('returns high quality with most data', () => {
		const quality = assessDataQuality(true, true, true, true);
		assert.equal(quality, 'high');
	});

	it('returns medium quality with partial data', () => {
		const quality = assessDataQuality(true, true, false, false);
		assert.equal(quality, 'medium');
	});

	it('returns low quality with minimal data', () => {
		const quality = assessDataQuality(false, false, false, true);
		assert.equal(quality, 'low');
	});
});
