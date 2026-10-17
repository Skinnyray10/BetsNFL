export function hexColor(value: string | undefined, fallback: string): string {
	if (!value) return fallback;
	return value.startsWith('#') ? value : `#${value}`;
}

export function percent(value: number): string {
	return `${Math.round(value * 100)}%`;
}

export function formatDate(value: string | undefined): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Mexico_City',
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}
