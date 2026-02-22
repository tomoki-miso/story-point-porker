<script lang="ts">
	import type { KptProblem, KptKeep } from '$lib/types';

	interface Props {
		problems: KptProblem[];
		keeps: KptKeep[];
	}

	let { problems, keeps }: Props = $props();

	function getTotalVotes(problem: KptProblem): number {
		if (!problem.votes) return 0;
		return Object.values(problem.votes).reduce((s, v) => s + v, 0);
	}

	const maxVoteCount = $derived(Math.max(1, ...problems.map(getTotalVotes)));
</script>

<div class="xp-window results-wrapper">
	<div class="xp-titlebar"><span class="neon-text">KPT 結果</span></div>
	<div class="xp-window-body">
		<div class="results-panel">
			<h4 class="section-title problem-title">Problem (得票順)</h4>
			{#if problems.length === 0}
				<p class="empty">Problemがありません</p>
			{:else}
				<div class="bar-chart">
					{#each problems as problem (problem.id)}
						{@const votes = getTotalVotes(problem)}
						<div class="bar-item">
							<span class="bar-label">{problem.text}</span>
							<div class="bar-track">
								<div
									class="bar-fill"
									style="width: {(votes / maxVoteCount) * 100}%"
								></div>
							</div>
							<span class="bar-count">{votes}</span>
						</div>
					{/each}
				</div>
			{/if}

			<h4 class="section-title keep-title">Keep</h4>
			{#if keeps.length === 0}
				<p class="empty">Keepがありません</p>
			{:else}
				<ul class="keep-list">
					{#each keeps as keep (keep.id)}
						<li class="keep-item">
							<span class="keep-text">{keep.text}</span>
							<span class="keep-author">- {keep.authorName}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>

<style>
	.results-wrapper {
		width: 100%;
		max-width: 700px;
	}

	.results-panel {
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 1.5rem;
	}

	:global([data-theme='xp']) .results-panel {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
	}

	.section-title {
		font-size: 0.95rem;
		margin: 0 0 0.75rem;
	}

	.problem-title {
		color: var(--color-neon-orange);
	}

	.keep-title {
		color: var(--color-neon-green);
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-surface);
	}

	:global([data-theme='xp']) .keep-title {
		border-top: 1px solid var(--color-button-shadow);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.bar-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.bar-label {
		width: 40%;
		min-width: 100px;
		font-size: 0.85rem;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar-track {
		flex: 1;
		height: 22px;
		background: var(--color-surface);
		border-radius: 4px;
		overflow: hidden;
	}

	:global([data-theme='xp']) .bar-track {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
		border-radius: 0;
	}

	.bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-neon-orange), var(--color-neon-pink));
		border-radius: 4px;
		transition: width 0.5s ease;
		min-width: 2px;
	}

	:global([data-theme='xp']) .bar-fill {
		background: linear-gradient(90deg, #ff8c00, #ff4500);
		border-radius: 0;
	}

	.bar-count {
		width: 2rem;
		text-align: right;
		font-weight: bold;
		font-size: 0.9rem;
		color: var(--color-neon-yellow);
	}

	:global([data-theme='xp']) .bar-count {
		color: var(--color-neon-pink);
	}

	.keep-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.keep-item {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.4rem 0;
		font-size: 0.85rem;
	}

	.keep-text {
		color: var(--color-text);
	}

	.keep-author {
		color: var(--color-text-muted);
		font-size: 0.75rem;
		flex-shrink: 0;
	}
</style>
