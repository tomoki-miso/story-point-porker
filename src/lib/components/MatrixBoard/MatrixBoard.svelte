<script lang="ts">
	import {
		matrixConfig,
		matrixVotes,
		matrixResult,
		roomInfo,
		players,
		issues,
		isHost,
		currentPlayerId,
		currentPlayer
	} from '$lib/stores/room-store';
	import MatrixVoteSelector from './MatrixVoteSelector.svelte';
	import MatrixResultDisplay from './MatrixResultDisplay.svelte';
	import MatrixHostControls from './MatrixHostControls.svelte';
	import MatrixEditorModal from './MatrixEditorModal.svelte';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();
	let editorOpen = $state(false);

	const status = $derived($roomInfo?.status ?? 'voting');
	const playerList = $derived(Object.values($players));
	const allVoted = $derived(
		playerList.length > 0 && playerList.every((p) => p.matrixVote != null)
	);
	const currentIssue = $derived($issues[$roomInfo?.currentIssueIndex ?? 0] ?? null);
</script>

<div class="matrix-board">
	{#if !$matrixConfig}
		<p class="loading">マトリクスを準備中...</p>
	{:else if status === 'voting'}
		{#if $currentPlayerId}
			<MatrixVoteSelector
				{roomId}
				playerId={$currentPlayerId}
				config={$matrixConfig}
				currentVote={$currentPlayer?.matrixVote ?? null}
			/>
		{/if}
		<div class="vote-progress">
			<h4 class="progress-title">投票状況</h4>
			<div class="progress-players">
				{#each playerList as player (player.id)}
					<span
						class="progress-chip"
						class:done={player.matrixVote != null}
						class:is-me={player.id === $currentPlayerId}
					>
						{player.name}
						{#if player.matrixVote != null}
							<span class="check">&#10003;</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
	{:else}
		<MatrixResultDisplay
			{roomId}
			config={$matrixConfig}
			votes={$matrixVotes}
			stats={$matrixResult}
			currentIssueId={currentIssue?.id ?? null}
			currentResult={currentIssue?.result ?? null}
			isHost={$isHost}
		/>
	{/if}

	{#if $isHost}
		<MatrixHostControls
			{roomId}
			{status}
			currentIssueIndex={$roomInfo?.currentIssueIndex ?? 0}
			players={$players}
			issues={$issues}
			{allVoted}
			onopenEditor={() => (editorOpen = true)}
		/>
	{/if}

	{#if editorOpen && $matrixConfig}
		<MatrixEditorModal
			{roomId}
			config={$matrixConfig}
			onclose={() => (editorOpen = false)}
		/>
	{/if}
</div>

<style>
	.matrix-board {
		width: 100%;
		max-width: 900px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
	}

	.loading {
		color: var(--color-text-muted);
		padding: 2rem;
	}

	.vote-progress {
		width: 100%;
		max-width: 700px;
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
	}

	:global([data-theme='xp']) .vote-progress {
		background: var(--color-window);
		border: 1px solid var(--color-button-shadow);
		border-radius: 0;
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	.progress-title {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin: 0 0 0.5rem;
	}

	.progress-players {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.progress-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.6rem;
		border-radius: 12px;
		font-size: 0.8rem;
		border: 1px solid var(--color-surface);
		color: var(--color-text-muted);
	}

	.progress-chip.done {
		border-color: var(--color-neon-green);
		color: var(--color-neon-green);
		box-shadow: var(--glow-green);
	}

	.progress-chip.is-me {
		border-color: var(--color-neon-blue);
		color: var(--color-neon-blue);
	}

	.progress-chip.is-me.done {
		border-color: var(--color-neon-green);
		color: var(--color-neon-green);
	}

	.check {
		font-weight: bold;
	}

	:global([data-theme='xp']) .progress-chip {
		border: 1px solid var(--color-button-shadow);
		border-radius: 3px;
		color: var(--color-text);
	}

	:global([data-theme='xp']) .progress-chip.done {
		background: #e8f5e8;
		border-color: var(--color-neon-green);
		color: var(--color-text);
		box-shadow: none;
	}
</style>
