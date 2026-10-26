import { apiGet } from '#lib/api.js';
import type { Team } from '@bets/shared';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	try {
		// Get all teams
		const teamsData = await apiGet<{ teams: Team[] }>('/api/teams', fetch);

		// Get selected team IDs from query params
		const teamAId = url.searchParams.get('a');
		const teamBId = url.searchParams.get('b');

		// If both teams are selected, fetch their detailed data
		let teamA: Team | null = null;
		let teamB: Team | null = null;

		if (teamAId) {
			try {
				teamA = await apiGet<Team>(`/api/teams/${teamAId}`, fetch);
			} catch (error) {
				console.error('Error loading team A:', error);
			}
		}

		if (teamBId) {
			try {
				teamB = await apiGet<Team>(`/api/teams/${teamBId}`, fetch);
			} catch (error) {
				console.error('Error loading team B:', error);
			}
		}

		return {
			allTeams: teamsData.teams,
			teamA,
			teamB,
			selectedAId: teamAId,
			selectedBId: teamBId
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Failed to load teams',
			allTeams: [],
			teamA: null,
			teamB: null,
			selectedAId: null,
			selectedBId: null
		};
	}
};
