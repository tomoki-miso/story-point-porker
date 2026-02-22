<script lang="ts">
	import type { KptStatus } from '$lib/types';
	import { startKptVoting, showKptResults, resetKpt, setMaxVotes, switchToPoker } from '$lib/kpt-service';

	interface Props {
		roomId: string;
		status: KptStatus;
		maxVotes: number;
		problemCount: number;
	}

	let { roomId, status, maxVotes, problemCount }: Props = $props();

	function handleMaxVotesChange(e: Event) {
		const value = parseInt((e.target as HTMLSelectElement).value);
		setMaxVotes(roomId, value);
	}
</script>

<div class="kpt-host-controls">
	{#if status === 'posting'}
		<div class="controls-row">
			<label class="max-votes-label">
				投票権数:
				<select class="max-votes-select" value={String(maxVotes)} onchange={handleMaxVotesChange}>
					<option value="1">1</option>
					<option value="3">3</option>
					<option value="5">5</option>
				</select>
			</label>
			<button
				class="btn-neon btn-neon--blue"
				onclick={() => startKptVoting(roomId)}
				disabled={problemCount === 0}
			>
				投票を開始
			</button>
		</div>
		{#if problemCount === 0}
			<p class="hint">Problemが投稿されると投票を開始できます</p>
		{/if}
	{:else if status === 'voting'}
		<button class="btn-neon btn-neon--green" onclick={() => showKptResults(roomId)}>
			結果を表示
		</button>
	{:else if status === 'result'}
		<div class="controls-row">
			<button class="btn-neon" onclick={() => resetKpt(roomId)}>
				リセット
			</button>
			<button class="btn-neon btn-neon--blue" onclick={() => switchToPoker(roomId)}>
				ポーカーに戻る
			</button>
		</div>
	{/if}
</div>

<style>
	.kpt-host-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border-top: 1px solid var(--color-surface);
	}

	:global([data-theme='xp']) .kpt-host-controls {
		border-top: 1px solid var(--color-button-shadow);
	}

	.controls-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.max-votes-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.max-votes-select {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-surface);
		border-radius: var(--radius);
		color: var(--color-text);
		padding: 0.3rem 0.5rem;
		font-size: 0.9rem;
	}

	:global([data-theme='xp']) .max-votes-select {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
		border-radius: 0;
		color: var(--color-text);
	}

	.hint {
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}
</style>
