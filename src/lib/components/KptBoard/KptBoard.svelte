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

	function getTotalVotes(problem: import('$lib/types').KptProblem): number {
		if (!problem.votes) return 0;
		return Object.values(problem.votes).reduce((s, v) => s + v, 0);
	}

	function exportMarkdown() {
		const date = new Date().toISOString().slice(0, 10);
		const problems = $kptProblemsSorted.length > 0 ? $kptProblemsSorted : $kptProblems;

		// Collect unique author names preserving order of appearance
		const authorOrder: string[] = [];
		const seen = new Set<string>();
		for (const item of [...$kptKeeps, ...problems]) {
			if (!seen.has(item.authorName)) {
				seen.add(item.authorName);
				authorOrder.push(item.authorName);
			}
		}

		// Group by author
		const keepsByAuthor = new Map<string, string[]>();
		const problemsByAuthor = new Map<string, string[]>();
		for (const keep of $kptKeeps) {
			const list = keepsByAuthor.get(keep.authorName) ?? [];
			list.push(keep.text);
			keepsByAuthor.set(keep.authorName, list);
		}
		for (const problem of problems) {
			const list = problemsByAuthor.get(problem.authorName) ?? [];
			const votes = getTotalVotes(problem);
			const suffix = votes > 0 ? ` (${votes}票)` : '';
			list.push(problem.text + suffix);
			problemsByAuthor.set(problem.authorName, list);
		}

		const lines: string[] = [];
		lines.push(`# KPT 振り返り (${date})`);
		lines.push('');
		lines.push('| name | Keep | Problem |');
		lines.push('| --- | --- | --- |');

		for (const name of authorOrder) {
			const keeps = (keepsByAuthor.get(name) ?? []).join('<br>');
			const probs = (problemsByAuthor.get(name) ?? []).join('<br>');
			lines.push(`| ${name} | ${keeps} | ${probs} |`);
		}

		lines.push('');

		const md = lines.join('\n');
		const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `kpt-${date}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}
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

	<div class="kpt-footer">
		{#if $isHost}
			<KptHostControls
				{roomId}
				status={$kptStatus}
				maxVotes={$kptMaxVotes}
				problemCount={$kptProblems.length}
			/>
		{/if}
		{#if $kptStatus === 'result'}
			<button class="btn-neon export-btn" onclick={exportMarkdown}>
				MDで書き出し
			</button>
		{/if}
	</div>
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

	.kpt-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.export-btn {
		font-size: 0.85rem;
	}

	@media (max-width: 768px) {
		.kpt-columns {
			flex-direction: column;
		}
	}
</style>
