import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeGames, normalizePlayers, normalizeTeams } from './normalize.ts';

describe('normalizeTeams', () => {
	it('reads ESPN-style team listing', () => {
		const teams = normalizeTeams({
			sports: [
				{
					leagues: [
						{
							teams: [
								{
									team: {
										id: '22',
										displayName: 'Arizona Cardinals',
										abbreviation: 'ARI',
										location: 'Arizona',
										color: '97233F',
										logos: [{ href: 'https://example.com/ari.png' }]
									}
								}
							]
						}
					]
				}
			]
		});
		assert.equal(teams.length, 1);
		assert.equal(teams[0]?.id, '22');
		assert.equal(teams[0]?.abbreviation, 'ARI');
		assert.equal(teams[0]?.logo, 'https://example.com/ari.png');
	});
});

describe('normalizePlayers', () => {
	it('reads athlete objects', () => {
		const players = normalizePlayers({
			athletes: [
				{
					id: '4360644',
					displayName: 'Justin Jefferson',
					fullName: 'Justin Jefferson',
					jersey: '18',
					position: { abbreviation: 'WR' },
					headshot: { href: 'https://example.com/jj.png' }
				}
			]
		});
		assert.equal(players[0]?.id, '4360644');
		assert.equal(players[0]?.position, 'WR');
	});
});

describe('normalizeGames', () => {
	it('reads event competitions', () => {
		const games = normalizeGames({
			events: [
				{
					id: '401547353',
					name: 'Kansas City Chiefs at Las Vegas Raiders',
					date: '2026-10-18T00:00Z',
					competitions: [
						{
							competitors: [
								{ homeAway: 'home', score: '17', team: { id: '13', displayName: 'Raiders' } },
								{ homeAway: 'away', score: '24', team: { id: '12', displayName: 'Chiefs' } }
							],
							status: { type: { description: 'Final' } }
						}
					]
				}
			]
		});
		assert.equal(games[0]?.home?.name, 'Raiders');
		assert.equal(games[0]?.away?.score, '24');
	});

	it('skips games without both teams', () => {
		const games = normalizeGames({
			events: [{ id: '1', name: 'TBD', competitions: [{ competitors: [] }] }]
		});
		assert.equal(games.length, 0);
	});
});
