import type { MatrixConfig } from './types';

export const CARD_VALUES = ['1', '2', '3', '5', '8', '13', '21'] as const;

export type CardValue = (typeof CARD_VALUES)[number];

const DEFAULT_AXIS_VALUES = ['1', '2', '3', '5', '8', '13'];

const DEFAULT_MATRIX_CELLS: string[][] = [
	['1', '2', '3', '5', '8', '13'],
	['2', '3', '5', '8', '13', '21'],
	['3', '5', '5', '8', '13', '21'],
	['5', '8', '8', '13', '13', '21'],
	['8', '13', '13', '13', '21', '21'],
	['13', '21', '21', '21', '21', '34']
];

function buildDefaultCells(): Record<string, string> {
	const cells: Record<string, string> = {};
	for (let y = 0; y < DEFAULT_MATRIX_CELLS.length; y++) {
		for (let x = 0; x < DEFAULT_MATRIX_CELLS[y].length; x++) {
			cells[`${x},${y}`] = DEFAULT_MATRIX_CELLS[y][x];
		}
	}
	return cells;
}

export const DEFAULT_MATRIX_CONFIG: MatrixConfig = {
	xAxis: { label: '実装難易度', values: [...DEFAULT_AXIS_VALUES] },
	yAxis: { label: '仕様難易度', values: [...DEFAULT_AXIS_VALUES] },
	cells: buildDefaultCells()
};

export const MATRIX_COLOR_THRESHOLDS = { low: 3, mid: 8 } as const;
