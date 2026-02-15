<script lang="ts">
	import { revealCards, resetVotes, nextIssue } from '$lib/room-service';
	import type { Player, Issue, Room } from '$lib/types';

	interface Props {
		roomId: string;
		room: Room;
		players: Record<string, Player>;
		issues: Issue[];
		allVoted: boolean;
	}

	let { roomId, room, players, issues, allVoted }: Props = $props();

	const isRevealed = $derived(room.status === 'revealed');
	const playerList = $derived(Object.values(players));
	const votedCount = $derived(playerList.filter((p) => p.vote != null).length);
	const totalCount = $derived(playerList.length);
	const hasNextIssue = $derived(room.currentIssueIndex < issues.length - 1);

	function handleReveal() {
		revealCards(roomId);
	}

	function handleReset() {
		resetVotes(roomId, players);
	}

	function handleNextIssue() {
		nextIssue(roomId, room.currentIssueIndex + 1, players);
	}
</script>

<div class="host-controls">
	{#if !isRevealed}
		<div class="vote-status" class:all-voted={allVoted}>
			{#if allVoted}
				<span class="status-icon">&#10003;</span>
				<span>全員選択済み ({totalCount}/{totalCount})</span>
			{:else}
				<span class="status-icon pending">&#9679;</span>
				<span>{votedCount}/{totalCount} 選択済み</span>
			{/if}
		</div>
		<button class="btn-neon btn-neon--green" onclick={handleReveal} disabled={!allVoted}>
			カードを公開
		</button>
	{:else}
		<div class="revealed-actions">
			<button class="btn-neon" onclick={handleReset}>リセット</button>
			{#if hasNextIssue}
				<button class="btn-neon btn-neon--blue" onclick={handleNextIssue}>次の議題へ</button>
			{/if}
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

	.vote-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		background: var(--color-surface);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		transition: all 0.3s ease;
	}

	.vote-status.all-voted {
		color: var(--color-neon-green);
		border: 1px solid var(--color-neon-green);
		box-shadow: var(--glow-green);
	}

	.status-icon {
		font-size: 1.1rem;
		color: var(--color-neon-green);
	}

	.status-icon.pending {
		color: var(--color-neon-orange);
	}

	.revealed-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
