type NflTeam = {
	id: string;
	name: string;
	abbreviation: string;
	location: string;
	color: string;
	alternateColor: string;
	logo: string | null;
	conference?: string;
	division?: string;
};

type NflPlayer = {
	id: string;
	fullName: string;
	displayName: string;
	position: string;
	jersey?: string;
	headshot: string | null;
	teamId?: string;
	teamName?: string;
	height?: string;
	weight?: string;
	age?: number;
};

type NflCompetitor = {
	id: string;
	name: string;
	abbreviation?: string;
	score?: string;
	logo: string | null;
	homeAway?: string;
};

type NflGame = {
	id: string;
	name: string;
	date: string;
	status: string;
	home: NflCompetitor | null;
	away: NflCompetitor | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | undefined {
	if (typeof value === 'string' && value.trim()) return value;
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	return undefined;
}

function firstString(...values: unknown[]): string | undefined {
	for (const value of values) {
		const next = str(value);
		if (next) return next;
	}
	return undefined;
}

function logoFrom(value: unknown): string | null {
	if (typeof value === 'string' && value.startsWith('http')) return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			if (isRecord(item)) {
				const href = firstString(item.href, item.url);
				if (href) return href;
			}
		}
	}
	if (isRecord(value)) {
		return firstString(value.href, value.url) ?? null;
	}
	return null;
}

function walk(value: unknown, visit: (node: Record<string, unknown>) => void, seen = new Set<unknown>()): void {
	if (!value || typeof value !== 'object' || seen.has(value)) return;
	seen.add(value);
	if (Array.isArray(value)) {
		for (const item of value) walk(item, visit, seen);
		return;
	}
	const node = value as Record<string, unknown>;
	visit(node);
	for (const child of Object.values(node)) walk(child, visit, seen);
}

function teamFrom(node: Record<string, unknown>): NflTeam | null {
	const inner = isRecord(node.team) ? node.team : node;
	const id = firstString(inner.id, inner.teamId);
	const name = firstString(inner.displayName, inner.name, inner.nickname);
	if (!id || !name) return null;
	const groups = Array.isArray(inner.groups) ? inner.groups : [];
	const conference = groups
		.map((g) => (isRecord(g) ? firstString(g.name, g.abbreviation) : undefined))
		.find(Boolean);
	return {
		id,
		name,
		abbreviation: firstString(inner.abbreviation, inner.abbrev) ?? '',
		location: firstString(inner.location, inner.city) ?? '',
		color: firstString(inner.color) ?? '111827',
		alternateColor: firstString(inner.alternateColor) ?? 'f8fafc',
		logo: logoFrom(inner.logos) ?? logoFrom(inner.logo),
		conference,
		division: firstString(inner.division, inner.standingSummary)
	};
}

function playerFrom(node: Record<string, unknown>): NflPlayer | null {
	const inner = isRecord(node.athlete) ? node.athlete : isRecord(node.player) ? node.player : node;
	const id = firstString(inner.id, inner.athleteId, inner.playerId);
	const displayName = firstString(inner.displayName, inner.fullName, inner.name);
	if (!id || !displayName) return null;
	const position = isRecord(inner.position)
		? firstString(inner.position.abbreviation, inner.position.displayName, inner.position.name)
		: firstString(inner.position);
	const team = isRecord(inner.team) ? inner.team : undefined;
	return {
		id,
		fullName: firstString(inner.fullName, displayName) ?? displayName,
		displayName,
		position: position ?? '',
		jersey: firstString(inner.jersey, inner.uniform),
		headshot: logoFrom(inner.headshot) ?? logoFrom(inner.images),
		teamId: team ? firstString(team.id) : firstString(inner.teamId),
		teamName: team ? firstString(team.displayName, team.name) : firstString(inner.teamName),
		height: firstString(inner.displayHeight, inner.height),
		weight: firstString(inner.displayWeight, inner.weight),
		age: typeof inner.age === 'number' ? inner.age : undefined
	};
}

function competitorFrom(node: Record<string, unknown>): NflCompetitor | null {
	const teamNode = isRecord(node.team) ? node.team : node;
	const id = firstString(teamNode.id, node.id);
	const name = firstString(teamNode.displayName, teamNode.name, node.displayName);
	if (!id || !name) return null;
	return {
		id,
		name,
		abbreviation: firstString(teamNode.abbreviation),
		score: firstString(node.score, node.points),
		logo: logoFrom(teamNode.logos) ?? logoFrom(teamNode.logo),
		homeAway: firstString(node.homeAway)
	};
}

function gameFrom(node: Record<string, unknown>): NflGame | null {
	const inner = isRecord(node.event) ? node.event : isRecord(node.game) ? node.game : node;
	const id = firstString(inner.id, inner.eventId, inner.gameId);
	const name = firstString(inner.name, inner.shortName, inner.headline);
	if (!id || !name) return null;
	const competitions = Array.isArray(inner.competitions) ? inner.competitions : [];
	const competition = isRecord(competitions[0]) ? competitions[0] : inner;
	const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
	const parsed = competitors
		.filter(isRecord)
		.map(competitorFrom)
		.filter((item): item is NflCompetitor => item !== null);
	const home = parsed.find((c) => c.homeAway === 'home') ?? parsed[0] ?? null;
	const away = parsed.find((c) => c.homeAway === 'away') ?? parsed[1] ?? null;
	const statusNode = isRecord(competition.status)
		? competition.status
		: isRecord(inner.status)
			? inner.status
			: {};
	const type = isRecord(statusNode.type) ? statusNode.type : {};
	return {
		id,
		name,
		date: firstString(inner.date, competition.date) ?? '',
		status: firstString(type.description, type.detail, statusNode.displayClock) ?? '',
		home,
		away
	};
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
	const seen = new Set<string>();
	const result: T[] = [];
	for (const item of items) {
		if (seen.has(item.id)) continue;
		seen.add(item.id);
		result.push(item);
	}
	return result;
}

export function normalizeTeams(payload: unknown): NflTeam[] {
	const teams: NflTeam[] = [];
	walk(payload, (node) => {
		if ('team' in node || 'abbreviation' in node || 'displayName' in node) {
			const team = teamFrom(node);
			if (team) teams.push(team);
		}
	});
	return uniqueById(teams);
}

export function normalizeTeam(payload: unknown, id: string): NflTeam | null {
	return normalizeTeams(payload).find((team) => team.id === id) ?? normalizeTeams(payload)[0] ?? null;
}

export function normalizePlayers(payload: unknown): NflPlayer[] {
	const players: NflPlayer[] = [];
	walk(payload, (node) => {
		if ('athlete' in node || 'player' in node || 'jersey' in node || 'headshot' in node) {
			const player = playerFrom(node);
			if (player) players.push(player);
		}
	});
	return uniqueById(players);
}

export function normalizePlayer(payload: unknown, id: string): NflPlayer | null {
	return (
		normalizePlayers(payload).find((player) => player.id === id) ?? normalizePlayers(payload)[0] ?? null
	);
}

export function normalizeGames(payload: unknown): NflGame[] {
	const games: NflGame[] = [];
	walk(payload, (node) => {
		if ('competitions' in node || 'event' in node || 'shortName' in node) {
			const game = gameFrom(node);
			if (game?.home && game.away) games.push(game);
		}
	});
	return uniqueById(games);
}

export function firstRecord(payload: unknown): Record<string, unknown> | null {
	return isRecord(payload) ? payload : null;
}
