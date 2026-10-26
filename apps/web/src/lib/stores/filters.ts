import { writable } from 'svelte/store';

export type GameStatus = 'all' | 'upcoming' | 'live' | 'completed';
export type Conference = 'all' | 'AFC' | 'NFC';
export type SortBy = 'date' | 'confidence' | 'edge' | 'alphabetical';

export interface GameFilters {
	status: GameStatus;
	conference: Conference;
	confidenceMin: number;
	edgeMin: number;
	sortBy: SortBy;
}

const defaultFilters: GameFilters = {
	status: 'all',
	conference: 'all',
	confidenceMin: 0,
	edgeMin: 0,
	sortBy: 'date'
};

export const gameFilters = writable<GameFilters>(defaultFilters);

export function resetFilters() {
	gameFilters.set(defaultFilters);
}
