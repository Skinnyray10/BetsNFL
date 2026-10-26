/**
 * LLM Provider Abstraction Layer
 * Supports multiple LLM providers: Anthropic, Groq, Ollama
 */

export type LLMMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export type LLMResponse = {
	content: string;
	provider: string;
	model: string;
};

export interface LLMProvider {
	name: string;
	generateJSON(params: {
		system: string;
		messages: LLMMessage[];
		schema: unknown;
		temperature?: number;
		maxTokens?: number;
	}): Promise<LLMResponse>;
}

export type ProviderConfig = {
	type: 'anthropic' | 'groq' | 'ollama';
	apiKey?: string;
	baseURL?: string;
	model?: string;
};

export function detectProvider(): ProviderConfig {
	// Check for Groq first (since user has it configured)
	const groqKey = process.env.GROQ_API_KEY ||
		(process.env.CLAUDE_API_KEY?.startsWith('gsk_') ? process.env.CLAUDE_API_KEY : undefined);

	if (groqKey) {
		return {
			type: 'groq',
			apiKey: groqKey,
			model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
		};
	}

	// Check for Anthropic
	const anthropicKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
	if (anthropicKey && anthropicKey.startsWith('sk-ant-')) {
		return {
			type: 'anthropic',
			apiKey: anthropicKey,
			model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929'
		};
	}

	// Check for Ollama
	const ollamaBaseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
	const ollamaModel = process.env.OLLAMA_MODEL;

	if (ollamaModel) {
		return {
			type: 'ollama',
			baseURL: ollamaBaseURL,
			model: ollamaModel
		};
	}

	// Fallback: if we have any key, try to detect by prefix
	const anyKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY;

	if (!anyKey) {
		const err = new Error('No LLM API key found. Set one of: GROQ_API_KEY, CLAUDE_API_KEY, ANTHROPIC_API_KEY, or OLLAMA_MODEL') as Error & { status: number };
		err.status = 503;
		throw err;
	}

	// Default to Groq if we have a key that looks like Groq
	if (anyKey.startsWith('gsk_')) {
		return {
			type: 'groq',
			apiKey: anyKey,
			model: 'openai/gpt-oss-120b'
		};
	}

	throw new Error('Could not detect LLM provider. Please configure GROQ_API_KEY, CLAUDE_API_KEY, or OLLAMA_MODEL');
}

export function createProvider(config?: ProviderConfig): LLMProvider {
	const providerConfig = config || detectProvider();

	switch (providerConfig.type) {
		case 'anthropic':
			return createAnthropicProvider(providerConfig);
		case 'groq':
			return createGroqProvider(providerConfig);
		case 'ollama':
			return createOllamaProvider(providerConfig);
		default:
			throw new Error(`Unknown provider type: ${providerConfig.type}`);
	}
}

// Anthropic Provider
function createAnthropicProvider(config: ProviderConfig): LLMProvider {
	return {
		name: 'anthropic',
		async generateJSON({ system, messages, schema, temperature = 0, maxTokens = 4096 }) {
			const Anthropic = (await import('@anthropic-ai/sdk')).default;
			const { jsonSchemaOutputFormat } = await import('@anthropic-ai/sdk/helpers/json-schema');

			const client = new Anthropic({ apiKey: config.apiKey });

			const response = await client.messages.parse({
				model: config.model || 'claude-sonnet-4-5-20250929',
				max_tokens: maxTokens,
				temperature,
				system,
				messages: messages.map(m => ({
					role: m.role as 'user' | 'assistant',
					content: m.content
				})),
				output_config: {
					effort: 'high',
					format: jsonSchemaOutputFormat(schema as Parameters<typeof jsonSchemaOutputFormat>[0])
				}
			});

			return {
				content: JSON.stringify(response.parsed_output),
				provider: 'anthropic',
				model: config.model || 'claude-sonnet-4-5-20250929'
			};
		}
	};
}

// Groq Provider
function createGroqProvider(config: ProviderConfig): LLMProvider {
	return {
		name: 'groq',
		async generateJSON({ system, messages, schema, temperature = 0, maxTokens = 4096 }) {
			const Groq = (await import('groq-sdk')).default;
			const client = new Groq({ apiKey: config.apiKey });

			// Groq supports JSON mode but not strict schema validation
			// We'll use response_format: json_object and include schema in prompt
			const systemWithSchema = `${system}\n\nYou MUST respond with valid JSON matching this exact schema:\n${JSON.stringify(schema, null, 2)}\n\nIMPORTANT: Your response must be valid JSON only, no additional text.`;

			const response = await client.chat.completions.create({
				model: config.model || 'openai/gpt-oss-120b',
				messages: [
					{ role: 'system', content: systemWithSchema },
					...messages.map(m => ({
						role: m.role as 'system' | 'user' | 'assistant',
						content: m.content
					}))
				],
				temperature,
				max_tokens: maxTokens,
				response_format: { type: 'json_object' }
			});

			const content = response.choices[0]?.message?.content || '{}';

			// Validate it's valid JSON
			try {
				JSON.parse(content);
			} catch (e) {
				throw new Error(`Groq returned invalid JSON: ${content.substring(0, 200)}`);
			}

			return {
				content,
				provider: 'groq',
				model: config.model || 'openai/gpt-oss-120b'
			};
		}
	};
}

// Ollama Provider
function createOllamaProvider(config: ProviderConfig): LLMProvider {
	return {
		name: 'ollama',
		async generateJSON({ system, messages, schema, temperature = 0, maxTokens = 4096 }) {
			const baseURL = config.baseURL || 'http://localhost:11434';

			// Include schema in system prompt
			const systemWithSchema = `${system}\n\nYou MUST respond with valid JSON matching this exact schema:\n${JSON.stringify(schema, null, 2)}\n\nIMPORTANT: Your response must be valid JSON only, no additional text.`;

			const response = await fetch(`${baseURL}/api/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: config.model || 'llama3',
					messages: [
						{ role: 'system', content: systemWithSchema },
						...messages
					],
					stream: false,
					format: 'json',
					options: {
						temperature,
						num_predict: maxTokens
					}
				})
			});

			if (!response.ok) {
				throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json() as { message?: { content?: string } };
			const content = data.message?.content || '{}';

			// Validate it's valid JSON
			try {
				JSON.parse(content);
			} catch (e) {
				throw new Error(`Ollama returned invalid JSON: ${content.substring(0, 200)}`);
			}

			return {
				content,
				provider: 'ollama',
				model: config.model || 'llama3'
			};
		}
	};
}
