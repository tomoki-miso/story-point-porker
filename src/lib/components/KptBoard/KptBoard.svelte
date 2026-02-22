<script lang="ts">
	import { addKeep, deleteKeep, addProblem, deleteProblem, voteProblem } from '$lib/kpt-service';
	import {
		kptStatus,
		kptMaxVotes,
		kptKeeps,
		kptProblems,
		kptProblemsSorted,
		myRemainingVotes,
		isHost,
		currentPlayerId,
		players,
		kptPlayerVoteCounts
	} from '$lib/stores/room-store';
	import KptColumnKeep from './KptColumnKeep.svelte';
	import KptColumnProblem from './KptColumnProblem.svelte';
	import KptHostControls from './KptHostControls.svelte';
	import KptVoteResults from './KptVoteResults.svelte';

	interface Props {
		roomId: string;
	}

	let { roomId }: Props = $props();

	function handleAddKeep(text: string) {
		const pid = $currentPlayerId;
		if (!pid) return;
		addKeep(roomId, text, pid, sessionStorage.getItem(`playerName_${roomId}`) ?? 'Unknown');
	}

	function handleAddProblem(text: string) {
		const pid = $currentPlayerId;
		if (!pid) return;
		addProblem(roomId, text, pid, sessionStorage.getItem(`playerName_${roomId}`) ?? 'Unknown');
	}

	function handleToggleVote(problemId: string, currentlyVoted: boolean) {
		const pid = $currentPlayerId;
		if (!pid) return;
		const delta = currentlyVoted ? -1 : 1;
		const currentVotes = currentlyVoted ? 1 : 0;
		voteProblem(roomId, problemId, pid, delta, currentVotes);
	}

	const displayProblems = $derived($kptStatus === 'result' ? $kptProblemsSorted : $kptProblems);
	const playerList = $derived(Object.values($players));
	const allDoneVoting = $derived(
		playerList.length > 0 &&
		playerList.every((p) => ($kptPlayerVoteCounts[p.id] ?? 0) >= $kptMaxVotes)
	);
</script>

<div class="kpt-board">
	{#if $kptStatus === 'voting'}
		<div class="vote-progress">
			<h4 class="progress-title">投票状況</h4>
			<div class="progress-players">
				{#each playerList as player (player.id)}
					{@const used = $kptPlayerVoteCounts[player.id] ?? 0}
					{@const done = used >= $kptMaxVotes}
					<span class="progress-chip" class:done class:is-me={player.id === $currentPlayerId}>
						{player.name}
						<span class="progress-count">{used}/{$kptMaxVotes}</span>
					</span>
				{/each}
			</div>
		</div>
	{/if}

	{#if $kptStatus === 'result'}
		<KptVoteResults problems={$kptProblemsSorted} keeps={$kptKeeps} />
	{:else}
		<div class="kpt-columns">
			<KptColumnKeep
				keeps={$kptKeeps}
				status={$kptStatus}
				currentPlayerId={$currentPlayerId}
				onadd={handleAddKeep}
				ondelete={(id) => deleteKeep(roomId, id)}
			/>
			<KptColumnProblem
				problems={displayProblems}
				status={$kptStatus}
				currentPlayerId={$currentPlayerId}
				remainingVotes={$myRemainingVotes}
				onadd={handleAddProblem}
				ondelete={(id) => deleteProblem(roomId, id)}
				ontogglevote={handleToggleVote}
			/>
		</div>
	{/if}

	{#if $isHost}
		<KptHostControls
			{roomId}
			status={$kptStatus}
			maxVotes={$kptMaxVotes}
			problemCount={$kptProblems.length}
		/>
	{/if}
</div>

<style>
	.kpt-board {
		width: 100%;
		max-width: 900px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.kpt-columns {
		display: flex;
		gap: 1.5rem;
	}

	/* --- Vote progress --- */
	.vote-progress {
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
		transition: all 0.2s ease;
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

	:global([data-theme='xp']) .progress-chip.is-me {
		border-color: var(--color-neon-pink);
		font-weight: bold;
	}

	.progress-count {
		font-weight: bold;
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.kpt-columns {
			flex-direction: column;
		}
	}
</style>
