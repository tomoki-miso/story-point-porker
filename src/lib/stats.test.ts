import { describe, it, expect } from 'vitest';
import { calculateStats } from './stats';

describe('calculateStats', () => {
	it('数値投票の平均値と中央値を計算する', () => {
		const votes = { a: '3', b: '5', c: '8' };
		const stats = calculateStats(votes);
		expect(stats.average).toBeCloseTo(5.33, 1);
		expect(stats.median).toBe(5);
		expect(stats.totalVotes).toBe(3);
	});

	it('?を含む投票では?を除外して計算する', () => {
		const votes = { a: '3', b: '5', c: '?' };
		const stats = calculateStats(votes);
		expect(stats.average).toBe(4);
		expect(stats.median).toBe(4);
		expect(stats.totalVotes).toBe(3);
	});

	it('分布を正しく計算する', () => {
		const votes = { a: '3', b: '3', c: '5' };
		const stats = calculateStats(votes);
		expect(stats.distribution).toEqual({ '3': 2, '5': 1 });
	});

	it('全員?の場合、平均・中央値は0', () => {
		const votes = { a: '?', b: '?' };
		const stats = calculateStats(votes);
		expect(stats.average).toBe(0);
		expect(stats.median).toBe(0);
	});

	it('投票が空の場合', () => {
		const stats = calculateStats({});
		expect(stats.average).toBe(0);
		expect(stats.median).toBe(0);
		expect(stats.totalVotes).toBe(0);
	});
});
