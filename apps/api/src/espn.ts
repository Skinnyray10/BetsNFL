/**
 * ESPN Public API Client
 * No API key required - uses public undocumented endpoints
 */

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

export async function espnGet(endpoint: string, params?: Record<string, string>): Promise<unknown> {
	const url = new URL(`${ESPN_BASE_URL}${endpoint}`, ESPN_BASE_URL);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});
	}

	const response = await fetch(url.toString());

	if (!response.ok) {
		const error = new Error(`ESPN API error: ${response.status} ${response.statusText}`) as Error & { status?: number };
		error.status = response.status;
		throw error;
	}

	return response.json();
}

export async function getScoreboard(): Promise<unknown> {
	return espnGet('/scoreboard');
}

export async function getTeams(): Promise<unknown> {
	return espnGet('/teams');
}

export async function getTeam(id: string): Promise<unknown> {
	return espnGet(`/teams/${id}`);
}

export async function getTeamRoster(id: string): Promise<unknown> {
	return espnGet(`/teams/${id}/roster`);
}

export async function getTeamSchedule(id: string, params?: { season?: string }): Promise<unknown> {
	return espnGet(`/teams/${id}/schedule`, params);
}

export async function getGame(gameId: string): Promise<unknown> {
	// ESPN uses a different endpoint for game details
	const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`;
	const response = await fetch(url);
	const data = await response.json();
	return data;
}
