export function readSecret(...names: string[]): string | undefined {
	const wanted = new Set(names);
	for (const [rawName, rawValue] of Object.entries(process.env)) {
		if (!wanted.has(rawName.trim())) continue;
		const value = rawValue?.trim();
		if (value) return value;
	}
	return undefined;
}

/**
 * @deprecated Use detectProvider() from llm-provider.ts instead
 */
export function claudeApiKey(): string {
	const key = readSecret('CLAUDE_API_KEY', 'ANTHROPIC_API_KEY', 'GROQ_API_KEY');
	if (!key) {
		const err = new Error('No LLM API key found. Set GROQ_API_KEY, CLAUDE_API_KEY, or ANTHROPIC_API_KEY') as Error & { status: number };
		err.status = 503;
		throw err;
	}
	return key;
}

/**
 * @deprecated Use detectProvider() from llm-provider.ts instead
 */
export function claudeModel(): string {
	return readSecret('CLAUDE_MODEL', 'GROQ_MODEL') || 'claude-sonnet-4-5';
}

export function getLLMApiKey(): string | undefined {
	return readSecret('GROQ_API_KEY', 'CLAUDE_API_KEY', 'ANTHROPIC_API_KEY');
}

export function getProviderType(): 'groq' | 'anthropic' | 'ollama' | undefined {
	const groqKey = readSecret('GROQ_API_KEY');
	if (groqKey) return 'groq';

	const claudeKey = readSecret('CLAUDE_API_KEY', 'ANTHROPIC_API_KEY');
	if (claudeKey?.startsWith('gsk_')) return 'groq';
	if (claudeKey?.startsWith('sk-ant-')) return 'anthropic';

	const ollamaModel = readSecret('OLLAMA_MODEL');
	if (ollamaModel) return 'ollama';

	return undefined;
}
