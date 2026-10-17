const cache = new Map<string, { expires: number; body: unknown }>();
const TTL_MS = 60_000;

function requiredEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) {
		const err = new Error(`${name} is not set`) as Error & { status: number };
		err.status = 503;
		throw err;
	}
	return value;
}

export async function rapidGet(pathname: string, query: Record<string, string> = {}): Promise<unknown> {
	const key = requiredEnv('RAPIDAPI_KEY');
	const host = process.env.RAPIDAPI_HOST?.trim() || 'nfl-football-api.p.rapidapi.com';
	const url = new URL(`https://${host}${pathname.startsWith('/') ? pathname : `/${pathname}`}`);
	for (const [name, value] of Object.entries(query)) {
		url.searchParams.set(name, value);
	}

	const cacheKey = url.toString();
	const hit = cache.get(cacheKey);
	if (hit && hit.expires > Date.now()) {
		return hit.body;
	}

	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			'x-rapidapi-key': key,
			'x-rapidapi-host': host
		}
	});

	const text = await response.text();
	let body: unknown = text;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = { raw: text };
	}

	if (!response.ok) {
		const err = new Error(`RapidAPI ${response.status} for ${pathname}`);
		(err as Error & { status: number; body: unknown }).status = response.status;
		(err as Error & { status: number; body: unknown }).body = body;
		throw err;
	}

	cache.set(cacheKey, { expires: Date.now() + TTL_MS, body });
	return body;
}
