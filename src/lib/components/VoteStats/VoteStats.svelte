<script lang="ts">
	import { calculateStats } from '$lib/stats';
	import type { Player } from '$lib/types';

	interface Props {
		players: Record<string, Player>;
	}

	let { players }: Props = $props();

	const stats = $derived(() => {
		const votes: Record<string, string | null> = {};
		for (const [id, p] of Object.entries(players)) {
			votes[id] = p.vote;
		}
		return calculateStats(votes);
	});
</script>

<div class="xp-window stats-wrapper">
	<div class="xp-titlebar"><span class="neon-text">投票結果</span></div>
	<div class="xp-window-body">
		<div class="stats-panel">
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-label">平均</span>
					<span class="stat-value neon-text-blue">{stats().average}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">中央値</span>
					<span class="stat-value neon-text-blue">{stats().median}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">投票数</span>
					<span class="stat-value">{stats().totalVotes}</span>
				</div>
			</div>
			<div class="distribution">
				<h4 class="dist-title">分布</h4>
				<div class="dist-bars">
					{#each Object.entries(stats().distribution) as [value, count]}
						<div class="dist-bar-item">
							<span class="dist-label">{value}</span>
							<div class="dist-bar">
								<div class="dist-fill" style="width: {(count / stats().totalVotes) * 100}%"></div>
							</div>
							<span class="dist-count">{count}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.stats-wrapper {
		width: 100%;
		max-width: 500px;
	}

	.stats-panel {
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 1.5rem;
	}

	:global([data-theme='xp']) .stats-panel {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
	}

	.stats-grid {
		display: flex;
		justify-content: space-around;
		margin-bottom: 1.5rem;
	}

	.stat-item {
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-bottom: 0.3rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
	}

	:global([data-theme='xp']) .stat-value {
		text-shadow: none;
	}

	.dist-title {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	.distribution {
		border-top: 1px solid var(--color-surface);
		padding-top: 1rem;
	}

	.dist-bars {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.dist-bar-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.dist-label {
		width: 2rem;
		text-align: right;
		font-size: 0.9rem;
		color: var(--color-neon-yellow);
	}

	:global([data-theme='xp']) .dist-label {
		color: var(--color-neon-pink);
	}

	.dist-bar {
		flex: 1;
		height: 20px;
		background: var(--color-surface);
		border-radius: 4px;
		overflow: hidden;
	}

	:global([data-theme='xp']) .dist-bar {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
		border-radius: 0;
	}

	.dist-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-neon-pink), var(--color-neon-purple));
		border-radius: 4px;
		transition: width 0.5s ease;
	}

	:global([data-theme='xp']) .dist-fill {
		background: linear-gradient(90deg, #0054e3, #4e98ff);
		border-radius: 0;
	}

	.dist-count {
		width: 1.5rem;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	:global([data-theme='xp']) .dist-count {
		color: var(--color-text);
	}
</style>
