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
		justify-content: center;
		padding: 1rem;
	}

	.revealed-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
