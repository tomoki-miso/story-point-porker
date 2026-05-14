import type { MatrixConfig, MatrixVote } from './types';

export interface MatrixStats {
	count: number;
	xAvgIdx: number | null;
	yAvgIdx: number | null;
	xMedianIdx: number | null;
	yMedianIdx: number | null;
	averageCell: string | null;
	medianCell: string | null;
}

function indexOfValue(values: string[], v: string): number {
	return values.indexOf(v);
}

function median(nums: number[]): number {
	const sorted = [...nums].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[mid - 1] + sorted[mid]) / 2;
	}
	return sorted[mid];
}

export function calculateMatrixStats(votes: MatrixVote[], config: MatrixConfig): MatrixStats {
	const empty: MatrixStats = {
		count: 0,
		xAvgIdx: null,
		yAvgIdx: null,
		xMedianIdx: null,
		yMedianIdx: null,
		averageCell: null,
		medianCell: null
	};

	const xIndices: number[] = [];
	const yIndices: number[] = [];
	for (const v of votes) {
		const xi = indexOfValue(config.xAxis.values, v.x);
		const yi = indexOfValue(config.yAxis.values, v.y);
		if (xi >= 0 && yi >= 0) {
			xIndices.push(xi);
			yIndices.push(yi);
		}
	}

	if (xIndices.length === 0) return empty;

	const xAvgRaw = xIndices.reduce((s, v) => s + v, 0) / xIndices.length;
	const yAvgRaw = yIndices.reduce((s, v) => s + v, 0) / yIndices.length;
	const xAvgIdx = Math.round(xAvgRaw);
	const yAvgIdx = Math.round(yAvgRaw);
	const xMedianIdx = Math.round(median(xIndices));
	const yMedianIdx = Math.round(median(yIndices));

	const averageCell = config.cells?.[`${xAvgIdx},${yAvgIdx}`] ?? null;
	const medianCell = config.cells?.[`${xMedianIdx},${yMedianIdx}`] ?? null;

	return {
		count: xIndices.length,
		xAvgIdx,
		yAvgIdx,
		xMedianIdx,
		yMedianIdx,
		averageCell,
		medianCell
	};
}
