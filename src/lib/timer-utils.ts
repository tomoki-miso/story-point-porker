import type { VotingTimer } from './types';

const MIN_CUSTOM_SECONDS = 1;
const MAX_CUSTOM_SECONDS = 3600;

export function calcRemainingMs(timer: VotingTimer | null, now: number): number {
	if (!timer) return 0;
	if (timer.status === 'paused') {
		return timer.durationMs - timer.elapsedBeforePauseMs;
	}
	return timer.durationMs - timer.elapsedBeforePauseMs - (now - timer.startedAt);
}

export function formatMmSs(ms: number): string {
	if (ms <= 0) return '00:00';
	const totalSeconds = Math.ceil(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export type TimerColorState = 'normal' | 'warning' | 'danger' | 'expired';

export function getColorState(remainingMs: number): TimerColorState {
	if (remainingMs <= 0) return 'expired';
	if (remainingMs <= 10_000) return 'danger';
	if (remainingMs <= 30_000) return 'warning';
	return 'normal';
}

export type ValidateResult =
	| { ok: true; value: number }
	| { ok: false; error: string };

export function validateCustomSeconds(input: string): ValidateResult {
	const trimmed = input.trim();
	if (trimmed === '') return { ok: false, error: '秒数を入力してください' };
	if (!/^\d+$/.test(trimmed)) return { ok: false, error: '整数を入力してください' };
	const value = Number(trimmed);
	if (!Number.isFinite(value)) return { ok: false, error: '無効な数値です' };
	if (value < MIN_CUSTOM_SECONDS) {
		return { ok: false, error: `${MIN_CUSTOM_SECONDS} 秒以上を指定してください` };
	}
	if (value > MAX_CUSTOM_SECONDS) {
		return { ok: false, error: `${MAX_CUSTOM_SECONDS} 秒以下を指定してください` };
	}
	return { ok: true, value };
}
