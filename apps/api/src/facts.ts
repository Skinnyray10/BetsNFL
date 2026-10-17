function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
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

export type TeamFacts = {
	id: string;
	name?: string;
	records: Array<{ summary?: string; name?: string; stats?: Array<{ name?: string; displayValue?: string }> }>;
	injuries: string[];
};

export function teamFacts(id: string, payload: unknown): TeamFacts {
	const records: TeamFacts['records'] = [];
	const injuries: string[] = [];
	walk(payload, (node) => {
		if (typeof node.summary === 'string' && records.length < 6) {
			const stats = Array.isArray(node.stats)
				? node.stats
						.filter(isRecord)
						.slice(0, 10)
						.map((stat) => ({
							name: typeof stat.name === 'string' ? stat.name : undefined,
							displayValue: typeof stat.displayValue === 'string' ? stat.displayValue : undefined
						}))
				: undefined;
			const typeName = isRecord(node.type)
				? typeof node.type.displayName === 'string'
					? node.type.displayName
					: undefined
				: typeof node.name === 'string'
					? node.name
					: undefined;
			records.push({ summary: node.summary, name: typeName, stats });
		}
		if ((node.status === 'injured' || node.injury === true || isRecord(node.injury)) && injuries.length < 12) {
			const name = typeof node.displayName === 'string' ? node.displayName : typeof node.fullName === 'string' ? node.fullName : undefined;
			if (name) injuries.push(name);
		}
	});
	return { id, records, injuries };
}

