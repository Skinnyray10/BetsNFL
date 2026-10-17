const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export function parseId(id: string | undefined): string | null {
	if (!id || !ID_RE.test(id)) return null;
	return id;
}

export function isFinalStatus(status: string): boolean {
	const value = status.toLowerCase();
	return value.includes('final') || value.includes('end of game') || value === 'ft';
}
