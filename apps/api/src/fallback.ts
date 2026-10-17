/**
 * Fallback prediction system when Claude API is unavailable
 * Uses heuristic rules from promptbot.md
 */

import type { GameInput, Prediction } from './predict.js';
import type { TeamFacts } from './facts.js';
import {
	calculateStake,
	calculateMinOdds,
	generateWarning,
	assessDataQuality,
	DEFAULT_BANKROLL_CONFIG
} from './bankroll.js';
import { isFinalStatus } from './ids.js';

export function isClaudeError(error: unknown): boolean {
	if (!error) return false;
	const err = error as { message?: string; status?: number; type?: string };
	const msg = err.message?.toLowerCase() || '';
	const status = err.status;

	// Check for common Claude error patterns
	return (
		msg.includes('insufficient') ||
		msg.includes('quota') ||
		msg.includes('credit') ||
		msg.includes('balance') ||
		msg.includes('funds') ||
		msg.includes('402') ||
		status === 402 ||
		status === 429
	);
}

/**
 * Generate heuristic prediction based on team facts
 */
export function generateFallbackPrediction(
	game: GameInput,
	teamFacts: Map<string, TeamFacts>
): Prediction {
	const homeTeam = teamFacts.get(game.home?.id || '');
	const awayTeam = teamFacts.get(game.away?.id || '');

	// Extract records
	const homeRecord = parseRecord(homeTeam?.records[0]?.summary || '0-0');
	const awayRecord = parseRecord(awayTeam?.records[0]?.summary || '0-0');

	// Calculate win percentages
	const homeWinPct = homeRecord.wins / (homeRecord.wins + homeRecord.losses || 1);
	const awayWinPct = awayRecord.wins / (awayRecord.wins + awayRecord.losses || 1);

	// Home field advantage adjustment (typically +3-5% in NFL)
	const homeAdvantage = 0.04;

	// Adjust probabilities
	let homeWinProb = (homeWinPct + homeAdvantage) / (homeWinPct + awayWinPct + homeAdvantage);
	let awayWinProb = 1 - homeWinProb;

	// Normalize
	const probTotal = homeWinProb + awayWinProb;
	homeWinProb /= probTotal;
	awayWinProb /= probTotal;

	// Ensure realistic probabilities (no 0% or 100%)
	// Clamp to 5% - 95% range to reflect sports uncertainty
	homeWinProb = Math.max(0.05, Math.min(0.95, homeWinProb));
	awayWinProb = 1 - homeWinProb;

	// Determine winner
	const winnerId = homeWinProb > awayWinProb ? game.home?.id : game.away?.id;
	const winnerName = homeWinProb > awayWinProb ? game.home?.name : game.away?.name;

	// Predict scores based on recent performance
	const homeAvgPoints = extractStat(homeTeam?.records[0]?.stats, 'avgPointsFor') || 20;
	const awayAvgPoints = extractStat(awayTeam?.records[0]?.stats, 'avgPointsFor') || 20;

	const homeScore = Math.round(homeAvgPoints * (0.8 + Math.random() * 0.4));
	const awayScore = Math.round(awayAvgPoints * (0.8 + Math.random() * 0.4));

	// Calculate spread
	const spreadHome = homeScore - awayScore;

	// Calculate total
	const total = homeScore + awayScore;

	// Calculate confidence based on data quality
	const dataQuality = assessDataQuality(
		(homeTeam?.injuries.length || 0) > 0 || (awayTeam?.injuries.length || 0) > 0,
		(homeTeam?.records.length || 0) > 0 || (awayTeam?.records.length || 0) > 0,
		false,
		(homeTeam?.records.length || 0) > 0 || (awayTeam?.records.length || 0) > 0
	);

	let confidence = 0.5;
	if (dataQuality === 'high') confidence = 0.65;
	if (dataQuality === 'medium') confidence = 0.55;

	// Adjust confidence based on win probability difference
	const probDiff = Math.abs(homeWinProb - awayWinProb);
	confidence = Math.min(0.85, confidence + probDiff * 0.5);

	// Generate key factors
	const keyFactors: string[] = [];

	if (homeRecord.wins > awayRecord.wins) {
		keyFactors.push(`${game.home?.name} tiene mejor récord (${homeRecord.wins}-${homeRecord.losses})`);
	}
	if (awayRecord.wins > homeRecord.wins) {
		keyFactors.push(`${game.away?.name} tiene mejor récord (${awayRecord.wins}-${awayRecord.losses})`);
	}
	if (homeTeam?.injuries.length) {
		keyFactors.push(`${game.home?.name} con ${homeTeam.injuries.length} lesiones`);
	}
	if (awayTeam?.injuries.length) {
		keyFactors.push(`${game.away?.name} con ${awayTeam.injuries.length} lesiones`);
	}
	if (keyFactors.length === 0) {
		keyFactors.push('Análisis basado en récord y rendimiento reciente');
	}

	// Calculate stake
	const winProb = winnerId === game.home?.id ? homeWinProb : awayWinProb;
	const minOdds = calculateMinOdds(winProb, 0.05);
	const stake = calculateStake(confidence, winProb, minOdds, DEFAULT_BANKROLL_CONFIG);

	// Generate rationale
	const rationale = `Predicción basada en análisis de récord (${homeRecord.wins}-${homeRecord.losses} vs ${awayRecord.wins}-${awayRecord.losses}) y rendimiento reciente. ${winnerName} tiene ventaja en este enfrentamiento.`;

	// Generate value explanation
	const value = `Análisis estadístico sugiere ventaja para ${winnerName} basado en récord y rendimiento reciente.`;

	// Generate warning
	const warning = generateWarning(stake, confidence, dataQuality);

	return {
		gameId: game.id,
		kind: isFinalStatus(game.status) ? 'result_analysis' : 'forecast',
		winnerId: winnerId || '',
		winnerName: winnerName || '',
		awayScore,
		homeScore,
		awayWinProb: Math.round(awayWinProb * 1000) / 1000,
		homeWinProb: Math.round(homeWinProb * 1000) / 1000,
		spreadHome: Math.round(spreadHome * 10) / 10,
		total,
		confidence: Math.round(confidence * 1000) / 1000,
		keyFactors: keyFactors.slice(0, 5),
		rationale: `[FALLBACK - Sistema local] ${rationale}`,
		stake,
		minOdds,
		value,
		warning: `${warning} (Predicción generada por sistema local)`
	};
}

function parseRecord(summary: string): { wins: number; losses: number } {
	const match = summary.match(/(\d+)-(\d+)/);
	if (match) {
		return { wins: parseInt(match[1], 10), losses: parseInt(match[2], 10) };
	}
	return { wins: 0, losses: 0 };
}

function extractStat(stats: Array<{ name?: string; displayValue?: string }> | undefined, statName: string): number | undefined {
	if (!stats) return undefined;
	const stat = stats.find((s) => s.name === statName);
	if (stat?.displayValue) {
		return parseFloat(stat.displayValue);
	}
	return undefined;
}

/**
 * Generate predictions for multiple games using fallback
 */
export function generateFallbackPredictions(
	games: GameInput[],
	teamFacts: Map<string, TeamFacts>
): Prediction[] {
	return games.map((game) => generateFallbackPrediction(game, teamFacts));
}
