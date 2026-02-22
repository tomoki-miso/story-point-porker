<script lang="ts">
	import type { KptProblem, KptStatus } from '$lib/types';
	import KptItemCard from './KptItemCard.svelte';

	interface Props {
		problems: KptProblem[];
		status: KptStatus;
		currentPlayerId: string | null;
		remainingVotes: number;
		onadd: (text: string) => void;
		ondelete: (problemId: string) => void;
		ontogglevote: (problemId: string, currentlyVoted: boolean) => void;
	}

	let { problems, status, currentPlayerId, remainingVotes, onadd, ondelete, ontogglevote }: Props = $props();

	let inputText = $state('');

	function handleSubmit() {
		const text = inputText.trim();
		if (!text) return;
		onadd(text);
		inputText = '';
	}

	function getTotalVotes(problem: KptProblem): number {
		if (!problem.votes) return 0;
		return Object.values(problem.votes).reduce((s, v) => s + v, 0);
	}

	function hasMyVote(problem: KptProblem): boolean {
		if (!currentPlayerId || !problem.votes) return false;
		return (problem.votes[currentPlayerId] ?? 0) > 0;
	}
</script>

<div class="kpt-column problem-column">
	<h3 class="column-title problem-title">
		<span class="column-icon">&#9888;</span>
		Problem
		<span class="column-count">{problems.length}</span>
	</h3>
	{#if status === 'voting'}
		<div class="remaining-votes" class:exhausted={remainingVotes <= 0}>
			残り投票数: <span class="vote-num">{remainingVotes}</span>
		</div>
	{/if}
	<div class="column-items">
		{#each problems as problem (problem.id)}
			{@const voted = hasMyVote(problem)}
			<KptItemCard
				item={problem}
				type="problem"
				canDelete={problem.authorId === currentPlayerId && status === 'posting'}
				ondelete={() => ondelete(problem.id)}
				showVotes={status === 'voting' || status === 'result'}
				totalVotes={getTotalVotes(problem)}
				{voted}
				canVote={status === 'voting' && (voted || remainingVotes > 0)}
				ontogglevote={() => ontogglevote(problem.id, voted)}
				isResult={status === 'result'}
			/>
		{/each}
		{#if problems.length === 0}
			<p class="empty-hint">まだProblemがありません</p>
		{/if}
	</div>
	{#if status === 'posting'}
		<form class="add-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<input
				class="input-neon"
				type="text"
				placeholder="問題点を入力..."
				bind:value={inputText}
				maxlength="200"
			/>
			<button class="btn-neon btn-neon--orange add-btn" type="submit" disabled={!inputText.trim()}>
				追加
			</button>
		</form>
	{/if}
</div>

<style>
	.kpt-column {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.column-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.1rem;
		margin: 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--color-surface);
	}

	.problem-title {
		color: var(--color-neon-orange);
	}

	:global([data-theme='xp']) .column-title {
		border-bottom: 1px solid var(--color-button-shadow);
	}

	.column-icon {
		font-size: 1.2rem;
	}

	.column-count {
		font-size: 0.75rem;
		background: var(--color-surface);
		padding: 0.1rem 0.5rem;
		border-radius: 10px;
		color: var(--color-text-muted);
	}

	:global([data-theme='xp']) .column-count {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
	}

	.remaining-votes {
		text-align: center;
		font-size: 0.85rem;
		color: var(--color-neon-blue);
		padding: 0.4rem;
		background: var(--color-surface);
		border-radius: var(--radius);
	}

	.remaining-votes.exhausted {
		color: var(--color-text-muted);
	}

	:global([data-theme='xp']) .remaining-votes {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
	}

	.vote-num {
		font-weight: bold;
	}

	.column-items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		overflow-y: auto;
	}

	.empty-hint {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		text-align: center;
		padding: 1rem;
	}

	.add-form {
		display: flex;
		gap: 0.5rem;
	}

	.add-form .input-neon {
		flex: 1;
	}

	.add-btn {
		flex-shrink: 0;
		padding: 0.5rem 1rem;
	}
</style>
