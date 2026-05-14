import { describe, it, expect } from 'vitest';
import { calculateMatrixStats } from './matrix-stats';
import { DEFAULT_MATRIX_CONFIG } from './constants';

describe('calculateMatrixStats', () => {
	it('全員一致時、平均・中央値ともそのセル値', () => {
		const votes = [
			{ x: '3', y: '3' },
			{ x: '3', y: '3' },
			{ x: '3', y: '3' }
		];
		const stats = calculateMatrixStats(votes, DEFAULT_MATRIX_CONFIG);
		expect(stats.count).toBe(3);
		expect(stats.xAvgIdx).toBe(2);
		expect(stats.yAvgIdx).toBe(2);
		expect(stats.averageCell).toBe('5');
		expect(stats.medianCell).toBe('5');
	});

	it('票が空のとき null を返す', () => {
		const stats = calculateMatrixStats([], DEFAULT_MATRIX_CONFIG);
		expect(stats.count).toBe(0);
		expect(stats.averageCell).toBeNull();
		expect(stats.medianCell).toBeNull();
		expect(stats.xAvgIdx).toBeNull();
	});

	it('axis values に無い値は除外', () => {
		const votes = [
			{ x: '3', y: '3' },
			{ x: '999', y: 'xxx' }
		];
		const stats = calculateMatrixStats(votes, DEFAULT_MATRIX_CONFIG);
		expect(stats.count).toBe(1);
		expect(stats.xAvgIdx).toBe(2);
	});

	it('インデックスベースで平均を計算し丸める', () => {
		// y は idx=0(=1) と idx=2(=3) → 平均 idx=1 → y=2
		// x は idx=0(=1) と idx=4(=8) → 平均 idx=2 → x=3
		const votes = [
			{ x: '1', y: '1' },
			{ x: '8', y: '3' }
		];
		const stats = calculateMatrixStats(votes, DEFAULT_MATRIX_CONFIG);
		expect(stats.xAvgIdx).toBe(2);
		expect(stats.yAvgIdx).toBe(1);
		// cells["2,1"] = '5'
		expect(stats.averageCell).toBe('5');
	});

	it('中央値を計算する', () => {
		// x idx: [0, 2, 5] → median idx 2 (=3)
		// y idx: [0, 1, 3] → median idx 1 (=2)
		const votes = [
			{ x: '1', y: '1' },
			{ x: '3', y: '2' },
			{ x: '13', y: '5' }
		];
		const stats = calculateMatrixStats(votes, DEFAULT_MATRIX_CONFIG);
		expect(stats.xMedianIdx).toBe(2);
		expect(stats.yMedianIdx).toBe(1);
		// cells["2,1"] = '5'
		expect(stats.medianCell).toBe('5');
	});
});
