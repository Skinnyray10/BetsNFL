import { PUBLIC_API_URL } from '$app/env/public';

export function apiUrl(path: string): string {
	const base = PUBLIC_API_URL.replace(/\/$/, '');
	return `${base}${path}`;
}

export async function apiGet<T>(path: string, fetchFn: typeof fetch = fetch): Promise<T> {
	const response = await fetchFn(apiUrl(path));
	const data = (await response.json()) as T & { error?: string };
	if (!response.ok) {
		throw new Error(data.error ?? `Request failed (${response.status})`);
	}
	return data;
}
