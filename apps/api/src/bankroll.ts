/**
 * Bankroll Management Rules from promptbot.md
 * Implements responsible betting guidance and stake calculation
 */

export type BankrollConfig = {
	maxStakePercent: number; // Maximum percentage of bankroll per bet (2-5%)
	defaultStake: number; // Default stake on 1-10 scale
};

export const DEFAULT_BANKROLL_CONFIG: BankrollConfig = {
	maxStakePercent: 0.05, // 5% maximum
	defaultStake: 2 // Conservative default
};

/**
 * Calculate recommended stake based on prediction confidence and value
 * Returns stake on 1-10 scale
 */
export function calculateStake(
	confidence: number,
	winProb: number,
	odds: number,
	config: BankrollConfig = DEFAULT_BANKROLL_CONFIG
): number {
	// Calculate expected value
	const impliedProb = 1 / odds;
	const edge = winProb - impliedProb;

	// No value if edge is negative or too small
	if (edge < 0.01) return 1;

	// Base stake from confidence (0-1) scaled to 1-10
	const baseStake = 1 + confidence * 9;

	// Adjust based on edge (value)
	const edgeMultiplier = Math.min(2, Math.max(0.5, edge * 10));

	// Adjust based on odds (higher odds = lower stake for same edge)
	const oddsAdjustment = odds < 1.5 ? 0.8 : odds > 2.5 ? 0.7 : 1;

	let finalStake = baseStake * edgeMultiplier * oddsAdjustment;

	// Clamp to 1-10 range
	return Math.min(10, Math.max(1, Math.round(finalStake)));
}

/**
 * Validate if a bet meets bankroll management rules
 */
export function validateBet(stake: number, bankroll: number, config: BankrollConfig = DEFAULT_BANKROLL_CONFIG): {
	valid: boolean;
	reason?: string;
} {
	const stakePercent = (stake / 10) * config.maxStakePercent;

	if (stakePercent > config.maxStakePercent) {
		return {
			valid: false,
			reason: `Stake ${stake}/10 exceeds ${config.maxStakePercent * 100}% of bankroll limit`
		};
	}

	if (stake < 1 || stake > 10) {
		return {
			valid: false,
			reason: 'Stake must be between 1 and 10'
		};
	}

	return { valid: true };
}

/**
 * Generate warning message based on prediction characteristics
 */
export function generateWarning(stake: number, confidence: number, dataQuality: 'high' | 'medium' | 'low'): string {
	const warnings: string[] = [];

	// Always include responsible gambling warning
	warnings.push('Las apuestas deportivas conllevan riesgos. Apuesta responsablemente.');

	if (stake >= 7) {
		warnings.push('Stake alto: asegúrate de que el bankroll lo permita.');
	}

	if (confidence < 0.5) {
		warnings.push('Baja confianza en los datos disponibles.');
	}

	if (dataQuality === 'low') {
		warnings.push('Información limitada: considera reducir el stake.');
	}

	return warnings.join(' ');
}

/**
 * Calculate minimum acceptable odds based on win probability
 * Ensures positive expected value
 */
export function calculateMinOdds(winProb: number, margin: number = 0.05): number {
	const fairOdds = 1 / winProb;
	const minOdds = fairOdds * (1 + margin);
	return Math.max(1.01, Math.round(minOdds * 100) / 100);
}

/**
 * Assess data quality based on available information
 */
export function assessDataQuality(
	hasInjuries: boolean,
	hasRecords: boolean,
	hasHeadToHead: boolean,
	hasRecentForm: boolean
): 'high' | 'medium' | 'low' {
	const score = [hasInjuries, hasRecords, hasHeadToHead, hasRecentForm].filter(Boolean).length;

	if (score >= 3) return 'high';
	if (score >= 2) return 'medium';
	return 'low';
}
