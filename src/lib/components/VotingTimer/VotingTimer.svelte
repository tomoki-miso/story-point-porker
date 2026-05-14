<script lang="ts">
	import {
		startVotingTimer,
		pauseVotingTimer,
		resumeVotingTimer,
		resetVotingTimer
	} from '$lib/room-service';
	import { votingTimer, isHost, currentPlayerId } from '$lib/stores/room-store';
	import {
		calcRemainingMs,
		formatMmSs,
		getColorState,
		validateCustomSeconds
	} from '$lib/timer-utils';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	const PRESETS = [
		{ label: '30秒', ms: 30_000 },
		{ label: '1分', ms: 60_000 },
		{ label: '2分', ms: 120_000 },
		{ label: '5分', ms: 300_000 }
	];

	let nowTick = $state(Date.now());
	let presetSelected: number | 'custom' = $state(60_000);
	let customSecondsInput = $state('');
	let showSettings = $state(false);

	$effect(() => {
		if ($votingTimer?.status !== 'running') return;
		const id = setInterval(() => {
			nowTick = Date.now();
		}, 500);
		return () => clearInterval(id);
	});

	const remainingMs = $derived(calcRemainingMs($votingTimer, nowTick));
	const displayMmSs = $derived(formatMmSs(Math.max(0, remainingMs)));
	const colorState = $derived(getColorState(remainingMs));

	const customValidation = $derived.by(() => {
		if (presetSelected !== 'custom') return null;
		if (customSecondsInput === '') return null;
		return validateCustomSeconds(customSecondsInput);
	});

	const canStart = $derived.by(() => {
		if (presetSelected !== 'custom') return true;
		return customValidation?.ok === true;
	});

	function handleStart() {
		const hostId = $currentPlayerId;
		if (!hostId) return;
		let durationMs: number;
		if (presetSelected === 'custom') {
			const v = validateCustomSeconds(customSecondsInput);
			if (!v.ok) return;
			durationMs = v.value * 1000;
		} else {
			durationMs = presetSelected;
		}
		startVotingTimer(roomId, durationMs, hostId);
		showSettings = false;
	}

	function handlePause() {
		if (!$votingTimer) return;
		pauseVotingTimer(roomId, $votingTimer);
	}

	function handleResume() {
		resumeVotingTimer(roomId);
	}

	function handleReset() {
		resetVotingTimer(roomId);
	}

	function toggleSettings() {
		showSettings = !showSettings;
	}
</script>

{#if $votingTimer === null}
	{#if $isHost}
		<div class="timer-floating timer-idle">
			{#if showSettings}
				<div class="settings-panel">
					<div class="settings-title">投票タイマー</div>
					<div class="preset-grid">
						{#each PRESETS as preset}
							<button
								type="button"
								class="preset-btn"
								class:selected={presetSelected === preset.ms}
								onclick={() => (presetSelected = preset.ms)}
							>
								{preset.label}
							</button>
						{/each}
						<button
							type="button"
							class="preset-btn"
							class:selected={presetSelected === 'custom'}
							onclick={() => (presetSelected = 'custom')}
						>
							カスタム
						</button>
					</div>
					{#if presetSelected === 'custom'}
						<div class="custom-input-row">
							<input
								class="custom-input"
								type="text"
								inputmode="numeric"
								placeholder="秒 (1〜3600)"
								bind:value={customSecondsInput}
							/>
							{#if customValidation && !customValidation.ok}
								<span class="validation-error">{customValidation.error}</span>
							{/if}
						</div>
					{/if}
					<div class="settings-actions">
						<button type="button" class="action-btn cancel" onclick={() => (showSettings = false)}>
							閉じる
						</button>
						<button
							type="button"
							class="action-btn start"
							onclick={handleStart}
							disabled={!canStart}
						>
							開始
						</button>
					</div>
				</div>
			{:else}
				<button type="button" class="trigger-btn" onclick={toggleSettings} aria-label="投票タイマーを設定">
					<span class="trigger-icon">⏱</span>
					<span class="trigger-label">タイマー</span>
				</button>
			{/if}
		</div>
	{/if}
{:else}
	<div
		class="timer-floating timer-active"
		class:state-normal={colorState === 'normal'}
		class:state-warning={colorState === 'warning'}
		class:state-danger={colorState === 'danger'}
		class:state-expired={colorState === 'expired'}
	>
		<div class="status-line">
			{#if $votingTimer.status === 'paused'}
				<span class="status-icon">⏸</span>
				<span class="status-text">一時停止中</span>
			{:else if colorState === 'expired'}
				<span class="status-icon">⏰</span>
				<span class="status-text">時間切れ</span>
			{:else}
				<span class="status-icon">⏱</span>
				<span class="status-text">投票タイマー</span>
			{/if}
		</div>
		<div
			class="countdown"
			class:animate-timer-pulse={colorState === 'danger'}
			class:animate-timer-shake={colorState === 'expired'}
			role="timer"
			aria-live="off"
		>
			{displayMmSs}
		</div>
		{#if colorState === 'expired'}
			<div class="expired-note">投票は引き続き可能です</div>
		{/if}
		{#if $isHost}
			<div class="host-actions">
				{#if colorState === 'expired'}
					<button type="button" class="action-btn reset" onclick={handleReset}>リセット</button>
				{:else if $votingTimer.status === 'running'}
					<button type="button" class="action-btn pause" onclick={handlePause}>一時停止</button>
					<button type="button" class="action-btn reset" onclick={handleReset}>リセット</button>
				{:else}
					<button type="button" class="action-btn resume" onclick={handleResume}>再開</button>
					<button type="button" class="action-btn reset" onclick={handleReset}>リセット</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.timer-floating {
		position: fixed;
		top: 140px;
		left: 20px;
		z-index: 850;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-neon-purple);
		border-radius: var(--radius);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		min-width: 160px;
		color: var(--color-text);
	}

	:global([data-theme='xp']) .timer-floating {
		background: var(--color-button-face);
		border: 1px solid var(--color-button-dk-shadow);
		border-radius: var(--radius-window);
		box-shadow: var(--shadow-window);
	}

	.trigger-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: none;
		border: none;
		color: var(--color-text);
		cursor: pointer;
		font-size: 0.9rem;
		padding: 0.25rem 0.5rem;
	}

	.trigger-icon {
		font-size: 1.4rem;
	}

	.trigger-btn:hover {
		color: var(--color-neon-blue);
	}

	.settings-panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 220px;
	}

	.settings-title {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.preset-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.4rem;
	}

	.preset-btn {
		padding: 0.4rem 0.5rem;
		font-size: 0.8rem;
		background: var(--color-surface);
		border: 1px solid var(--color-surface-hover);
		border-radius: var(--radius);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.preset-btn:hover {
		border-color: var(--color-neon-blue);
	}

	.preset-btn.selected {
		background: var(--color-neon-purple);
		color: var(--color-bg);
		border-color: var(--color-neon-purple);
	}

	:global([data-theme='xp']) .preset-btn {
		background: linear-gradient(180deg, #ffffff 0%, #ece9d8 90%);
		border: 1px solid var(--color-button-dk-shadow);
		color: var(--color-text);
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .preset-btn.selected {
		background: linear-gradient(180deg, #4e98ff 0%, #0054e3 100%);
		color: #ffffff;
	}

	.custom-input-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.custom-input {
		padding: 0.35rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-surface-hover);
		border-radius: var(--radius);
		color: var(--color-text);
		font-size: 0.85rem;
		font-family: var(--font-main);
	}

	.custom-input:focus {
		outline: none;
		border-color: var(--color-neon-blue);
	}

	:global([data-theme='xp']) .custom-input {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
		color: var(--color-text);
	}

	.validation-error {
		color: var(--color-neon-pink);
		font-size: 0.7rem;
	}

	.settings-actions {
		display: flex;
		gap: 0.4rem;
		justify-content: flex-end;
	}

	.action-btn {
		padding: 0.35rem 0.75rem;
		font-size: 0.8rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-surface-hover);
		background: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.action-btn:hover:not(:disabled) {
		border-color: var(--color-neon-blue);
	}

	.action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.action-btn.start {
		background: var(--color-neon-green);
		color: var(--color-bg);
		border-color: var(--color-neon-green);
	}

	.action-btn.pause {
		background: var(--color-neon-yellow);
		color: var(--color-bg);
		border-color: var(--color-neon-yellow);
	}

	.action-btn.resume {
		background: var(--color-neon-green);
		color: var(--color-bg);
		border-color: var(--color-neon-green);
	}

	.action-btn.reset {
		background: none;
	}

	:global([data-theme='xp']) .action-btn {
		background: linear-gradient(180deg, #ffffff 0%, #ece9d8 90%);
		border: 1px solid var(--color-button-dk-shadow);
		color: var(--color-text);
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .action-btn.start,
	:global([data-theme='xp']) .action-btn.resume {
		background: linear-gradient(180deg, #79e07a 0%, #37b337 100%);
		color: #ffffff;
	}

	.status-line {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.status-icon {
		font-size: 0.95rem;
	}

	.countdown {
		font-family: var(--font-display);
		font-size: 2.4rem;
		font-weight: bold;
		letter-spacing: 0.05em;
		color: var(--color-neon-green);
		text-shadow: var(--glow-green);
		line-height: 1.1;
	}

	.state-warning .countdown {
		color: var(--color-neon-yellow);
		text-shadow: 0 0 10px var(--color-neon-yellow), 0 0 20px var(--color-neon-yellow);
	}

	.state-danger .countdown {
		color: var(--color-neon-pink);
		text-shadow: var(--glow-pink);
	}

	.state-expired .countdown {
		color: var(--color-neon-pink);
		text-shadow: var(--glow-pink);
	}

	.state-expired {
		border-color: var(--color-neon-pink);
	}

	:global([data-theme='xp']) .countdown {
		color: var(--color-neon-green);
		text-shadow: none;
	}

	:global([data-theme='xp']) .state-warning .countdown {
		color: var(--color-neon-orange);
		text-shadow: none;
	}

	:global([data-theme='xp']) .state-danger .countdown,
	:global([data-theme='xp']) .state-expired .countdown {
		color: #c00000;
		text-shadow: none;
	}

	:global([data-theme='xp']) .state-expired {
		border-color: #c00000;
	}

	.expired-note {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.host-actions {
		display: flex;
		gap: 0.4rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.timer-floating {
			top: 220px;
			left: 16px;
			min-width: 130px;
			padding: 0.5rem 0.75rem;
		}

		.countdown {
			font-size: 1.6rem;
		}

		.settings-panel {
			min-width: 180px;
		}
	}
</style>
