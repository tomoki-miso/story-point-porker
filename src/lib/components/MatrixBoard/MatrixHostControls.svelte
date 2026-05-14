<script lang="ts">
	import type { Player, Issue } from '$lib/types';
	import { revealMatrix, resetMatrixVotes, nextMatrixIssue } from '$lib/matrix-service';

	interface Props {
		roomId: string;
		status: 'voting' | 'revealed';
		currentIssueIndex: number;
		players: Record<string, Player>;
		issues: Issue[];
		allVoted: boolean;
		onopenEditor: () => void;
	}

	let { roomId, status, currentIssueIndex, players, issues, allVoted, onopenEditor }: Props = $props();

	const isRevealed = $derived(status === 'revealed');
	const playerList = $derived(Object.values(players));
	const votedCount = $derived(playerList.filter((p) => p.matrixVote != null).length);
	const totalCount = $derived(playerList.length);
	const hasNextIssue = $derived(currentIssueIndex < issues.length - 1);
</script>

<div class="host-controls">
	{#if !isRevealed}
		<div class="vote-status" class:all-voted={allVoted}>
			{#if allVoted}
				<span class="status-icon">&#10003;</span>
				<span>全員投票済み ({totalCount}/{totalCount})</span>
			{:else}
				<span class="status-icon pending">&#9679;</span>
				<span>{votedCount}/{totalCount} 投票済み</span>
			{/if}
		</div>
		<div class="row">
			<button
				class="btn-neon btn-neon--green"
				onclick={() => revealMatrix(roomId)}
				disabled={!allVoted}
			>
				カードを公開
			</button>
			<button class="btn-neon" onclick={onopenEditor}>マトリクス編集</button>
		</div>
	{:else}
		<div class="revealed-actions">
			<button class="btn-neon" onclick={() => resetMatrixVotes(roomId, players)}>リセット</button>
			{#if hasNextIssue}
				<button
					class="btn-neon btn-neon--blue"
					onclick={() => nextMatrixIssue(roomId, currentIssueIndex + 1, players)}
				>
					次の議題へ
				</button>
			{/if}
			<button class="btn-neon" onclick={onopenEditor}>マトリクス編集</button>
		</div>
	{/if}
</div>

<style>
	.host-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
	}

	.row,
	.revealed-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.vote-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		background: var(--color-surface);
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.vote-status.all-voted {
		color: var(--color-neon-green);
		border: 1px solid var(--color-neon-green);
		box-shadow: var(--glow-green);
	}

	:global([data-theme='xp']) .vote-status {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
		border-radius: 3px;
	}

	:global([data-theme='xp']) .vote-status.all-voted {
		border-color: var(--color-neon-green);
		background: #e8f5e8;
		box-shadow: none;
	}

	.status-icon {
		font-size: 1.1rem;
		color: var(--color-neon-green);
	}

	.status-icon.pending {
		color: var(--color-neon-orange);
	}
</style>
