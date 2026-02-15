import type { VoteStats } from './types';

export function calculateStats(votes: Record<string, string | null>): VoteStats {
	const allValues = Object.values(votes).filter((v): v is string => v !== null);
	const numericValues = allValues
		.filter((v) => v !== '?')
		.map(Number)
		.filter((n) => !isNaN(n));

	const distribution: Record<string, number> = {};
	for (const v of allValues) {
		distribution[v] = (distribution[v] || 0) + 1;
	}

	if (numericValues.length === 0) {
		return { average: 0, median: 0, distribution, totalVotes: allValues.length };
	}

	const sorted = [...numericValues].sort((a, b) => a - b);
	const sum = sorted.reduce((acc, val) => acc + val, 0);
	const average = sum / sorted.length;

	const mid = Math.floor(sorted.length / 2);
	const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

	return {
		average: Math.round(average * 100) / 100,
		median,
		distribution,
		totalVotes: allValues.length
	};
}
