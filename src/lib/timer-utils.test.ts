import { describe, it, expect } from 'vitest';
import {
	calcRemainingMs,
	formatMmSs,
	getColorState,
	validateCustomSeconds
} from './timer-utils';
import type { VotingTimer } from './types';

describe('calcRemainingMs', () => {
	it('running 中の残り時間を返す', () => {
		const timer: VotingTimer = {
			status: 'running',
			durationMs: 60_000,
			startedAt: 1_000_000,
			elapsedBeforePauseMs: 0,
			startedBy: 'h'
		};
		expect(calcRemainingMs(timer, 1_010_000)).toBe(50_000);
	});

	it('paused 中は elapsedBeforePauseMs に基づき固定値を返す', () => {
		const timer: VotingTimer = {
			status: 'paused',
			durationMs: 60_000,
			startedAt: 1_000_000,
			elapsedBeforePauseMs: 20_000,
			startedBy: 'h'
		};
		expect(calcRemainingMs(timer, 9_999_999)).toBe(40_000);
	});

	it('過去に一時停止経験ありの running を正しく計算する', () => {
		const timer: VotingTimer = {
			status: 'running',
			durationMs: 60_000,
			startedAt: 2_000_000,
			elapsedBeforePauseMs: 20_000,
			startedBy: 'h'
		};
		expect(calcRemainingMs(timer, 2_005_000)).toBe(35_000);
	});

	it('timer が null なら 0 を返す', () => {
		expect(calcRemainingMs(null, 1_000_000)).toBe(0);
	});

	it('時間切れの場合は負の値を返す', () => {
		const timer: VotingTimer = {
			status: 'running',
			durationMs: 10_000,
			startedAt: 1_000_000,
			elapsedBeforePauseMs: 0,
			startedBy: 'h'
		};
		expect(calcRemainingMs(timer, 1_015_000)).toBe(-5_000);
	});
});

describe('formatMmSs', () => {
	it('60000ms を "01:00" にフォーマット', () => {
		expect(formatMmSs(60_000)).toBe('01:00');
	});

	it('5500ms を切り上げて "00:06" にフォーマット', () => {
		expect(formatMmSs(5_500)).toBe('00:06');
	});

	it('0ms を "00:00"', () => {
		expect(formatMmSs(0)).toBe('00:00');
	});

	it('3600000ms を "60:00"', () => {
		expect(formatMmSs(3_600_000)).toBe('60:00');
	});

	it('負の値は "00:00" を返す', () => {
		expect(formatMmSs(-1)).toBe('00:00');
	});
});

describe('getColorState', () => {
	it('60秒残りは normal', () => {
		expect(getColorState(60_000)).toBe('normal');
	});

	it('30秒ちょうどは warning', () => {
		expect(getColorState(30_000)).toBe('warning');
	});

	it('25秒残りは warning', () => {
		expect(getColorState(25_000)).toBe('warning');
	});

	it('10秒ちょうどは danger', () => {
		expect(getColorState(10_000)).toBe('danger');
	});

	it('8秒残りは danger', () => {
		expect(getColorState(8_000)).toBe('danger');
	});

	it('0ms は expired', () => {
		expect(getColorState(0)).toBe('expired');
	});

	it('負の値は expired', () => {
		expect(getColorState(-5_000)).toBe('expired');
	});
});

describe('validateCustomSeconds', () => {
	it('"30" を 30 として受け入れる', () => {
		const result = validateCustomSeconds('30');
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value).toBe(30);
	});

	it('空文字はエラー', () => {
		expect(validateCustomSeconds('').ok).toBe(false);
	});

	it('非数値はエラー', () => {
		expect(validateCustomSeconds('abc').ok).toBe(false);
	});

	it('0 は最小値未満でエラー', () => {
		expect(validateCustomSeconds('0').ok).toBe(false);
	});

	it('3601 は最大値超でエラー', () => {
		expect(validateCustomSeconds('3601').ok).toBe(false);
	});

	it('3600 は受け入れる', () => {
		const result = validateCustomSeconds('3600');
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value).toBe(3600);
	});

	it('小数はエラー', () => {
		expect(validateCustomSeconds('30.5').ok).toBe(false);
	});

	it('負の値はエラー', () => {
		expect(validateCustomSeconds('-10').ok).toBe(false);
	});
});
