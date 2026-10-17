import { getTeam } from './espn.js';
import { teamFacts, type TeamFacts } from './facts.js';
import type { GameInput } from './predict.js';
import { normalizeGames as parseGames } from './normalize.js';

export type { GameInput };

export function gamesFromScoreboard(payload: unknown) {
	return parseGames(payload).map((game) => ({
		id: game.id,
		name: game.name,
		date: game.date,
		status: game.status,
		home: game.home ? { id: game.home.id, name: game.home.name, score: game.home.score } : null,
		away: game.away ? { id: game.away.id, name: game.away.name, score: game.away.score } : null
	}));
}

export async function extraFactsFor(games: ReturnType<typeof gamesFromScoreboard>): Promise<{
	season: unknown;
	teams: TeamFacts[];
	hasInjuries: boolean;
	hasRecords: boolean;
	hasHeadToHead: boolean;
	hasRecentForm: boolean;
}> {
	const teamIds = [
		...new Set(games.flatMap((game) => [game.home?.id, game.away?.id].filter((id): id is string => Boolean(id))))
	].slice(0, 8);

	const season = null; // ESPN scoreboard includes season info in the response
	const teams: TeamFacts[] = [];
	const results = await Promise.allSettled(teamIds.map((id) => getTeam(id)));
	results.forEach((result, index) => {
		const id = teamIds[index];
		if (!id || result.status !== 'fulfilled') return;
		const facts = teamFacts(id, result.value);
		const gameTeam = games
			.flatMap((game) => [game.home, game.away])
			.find((team) => team?.id === id);
		facts.name = gameTeam?.name;
		teams.push(facts);
	});

	// Assess data quality
	const hasInjuries = teams.some((t) => t.injuries.length > 0);
	const hasRecords = teams.some((t) => t.records.length > 0);
	const hasHeadToHead = false; // Would need additional API call
	const hasRecentForm = hasRecords; // Using records as proxy for recent form

	return {
		season: compactSeason(season),
		teams,
		hasInjuries,
		hasRecords,
		hasHeadToHead,
		hasRecentForm
	};
}

function compactSeason(payload: unknown): unknown {
	if (!payload || typeof payload !== 'object') return payload;
	try {
		const json = JSON.stringify(payload);
		if (json.length <= 4000) return payload;
		return { truncated: true, preview: json.slice(0, 4000) };
	} catch {
		return null;
	}
}

