export function readSecret(...names: string[]): string | undefined {
	const wanted = new Set(names);
	for (const [rawName, rawValue] of Object.entries(process.env)) {
		if (!wanted.has(rawName.trim())) continue;
		const value = rawValue?.trim();
		if (value) return value;
	}
	return undefined;
}

export function claudeApiKey(): string {
	const key = readSecret('CLAUDE_API_KEY', 'ANTHROPIC_API_KEY');
	if (!key) {
		const err = new Error('CLAUDE_API_KEY is not set') as Error & { status: number };
		err.status = 503;
		throw err;
	}
	return key;
}

export function claudeModel(): string {
	return readSecret('CLAUDE_MODEL') || 'claude-sonnet-4-5';
}
