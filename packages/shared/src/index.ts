export type NflTeam = {
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

export type NflPlayer = {
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

export type NflCompetitor = {
	id: string;
	name: string;
	abbreviation?: string;
	score?: string;
	logo: string | null;
	homeAway?: string;
};

export type NflGame = {
	id: string;
	name: string;
	date: string;
	status: string;
	home: NflCompetitor | null;
	away: NflCompetitor | null;
};

export type ApiErrorBody = {
	error: string;
	detail?: string;
};

export type NflPrediction = {
	gameId: string;
	kind: 'forecast' | 'result_analysis';
	winnerId: string;
	winnerName: string;
	awayScore: number;
	homeScore: number;
	awayWinProb: number;
	homeWinProb: number;
	spreadHome: number;
	total: number;
	confidence: number;
	keyFactors: string[];
	rationale: string;
	stake: number;
	minOdds: number;
	value: string;
	warning: string;
};
