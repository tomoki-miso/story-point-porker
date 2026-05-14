<script lang="ts">
	import type { MatrixConfig, Player } from '$lib/types';
	import type { MatrixStats } from '$lib/matrix-stats';
	import { MATRIX_COLOR_THRESHOLDS } from '$lib/constants';
	import { setIssueResult } from '$lib/room-service';

	interface MatrixVoteWithPlayer {
		playerId: string;
		playerName: string;
		x: string;
		y: string;
	}

	interface Props {
		roomId: string;
		config: MatrixConfig;
		votes: MatrixVoteWithPlayer[];
		stats: MatrixStats | null;
		currentIssueId: string | null;
		currentResult: string | null;
		isHost: boolean;
	}

	let { roomId, config, votes, stats, currentIssueId, currentResult, isHost }: Props = $props();

	function cellKey(x: number, y: number): string {
		return `${x},${y}`;
	}

	function cellColor(value: string): string {
		const n = Number(value);
		if (isNaN(n)) return 'cell-neutral';
		if (n <= MATRIX_COLOR_THRESHOLDS.low) return 'cell-low';
		if (n <= MATRIX_COLOR_THRESHOLDS.mid) return 'cell-mid';
		return 'cell-high';
	}

	function votersInCell(xIdx: number, yIdx: number): MatrixVoteWithPlayer[] {
		const xVal = config.xAxis.values[xIdx];
		const yVal = config.yAxis.values[yIdx];
		return votes.filter((v) => v.x === xVal && v.y === yVal);
	}

	function initials(name: string): string {
		return name.trim().charAt(0).toUpperCase() || '?';
	}

	function confirmCell(value: string) {
		if (!currentIssueId) return;
		setIssueResult(roomId, currentIssueId, value);
	}

	const yRows = $derived([...config.yAxis.values].map((_, i) => config.yAxis.values.length - 1 - i));
</script>

<div class="matrix-result">
	<div class="matrix-grid-wrapper">
		<div
			class="matrix-grid"
			style="grid-template-columns: auto repeat({config.xAxis.values.length}, minmax(60px, 1fr));"
		>
			<div class="corner-cell"></div>
			{#each config.xAxis.values as xv (xv)}
				<div class="axis-header axis-x">{xv}</div>
			{/each}

			{#each yRows as yIdx (yIdx)}
				<div class="axis-header axis-y">{config.yAxis.values[yIdx]}</div>
				{#each config.xAxis.values as _xv, xIdx (xIdx)}
					{@const value = config.cells?.[cellKey(xIdx, yIdx)] ?? ''}
					{@const voters = votersInCell(xIdx, yIdx)}
					{@const isAvg = stats && stats.xAvgIdx === xIdx && stats.yAvgIdx === yIdx}
					{@const isMed = stats && stats.xMedianIdx === xIdx && stats.yMedianIdx === yIdx}
					{@const isResult = currentResult === value && voters.length > 0}
					<div
						class="cell {cellColor(value)}"
						class:has-votes={voters.length > 0}
						class:is-avg={isAvg}
						class:is-median={isMed}
					>
						<span class="cell-value">{value}</span>
						{#if voters.length > 0}
							<div class="voters">
								{#each voters as v (v.playerId)}
									<span class="voter-chip" title={v.playerName}>{initials(v.playerName)}</span>
								{/each}
							</div>
						{/if}
						{#if isHost && currentIssueId && value}
							<button
								class="confirm-btn"
								class:active={isResult}
								onclick={() => confirmCell(value)}
								title="このセル ({value}pt) で確定"
							>
								{isResult ? '確定済' : '確定'}
							</button>
						{/if}
					</div>
				{/each}
			{/each}

			<div class="corner-cell"></div>
			<div class="axis-label-x" style="grid-column: 2 / span {config.xAxis.values.length};">
				{config.xAxis.label}
			</div>
		</div>
		<div class="axis-label-y">{config.yAxis.label}</div>
	</div>

	<div class="summary">
		{#if stats && stats.count > 0}
			<div class="summary-row">
				<span class="summary-label">投票数:</span>
				<span class="summary-value">{stats.count}</span>
			</div>
			{#if stats.averageCell != null}
				<div class="summary-row avg">
					<span class="summary-label">平均(参考):</span>
					<span class="summary-value">{stats.averageCell}pt</span>
				</div>
			{/if}
			{#if stats.medianCell != null}
				<div class="summary-row median">
					<span class="summary-label">中央値(参考):</span>
					<span class="summary-value">{stats.medianCell}pt</span>
				</div>
			{/if}
			{#if currentResult}
				<div class="summary-row final">
					<span class="summary-label">最終ポイント:</span>
					<span class="summary-value">{currentResult}pt</span>
				</div>
			{/if}
		{:else}
			<p class="empty-msg">投票がありません</p>
		{/if}
	</div>
</div>

<style>
	.matrix-result {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.matrix-grid-wrapper {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
	}

	.matrix-grid {
		display: grid;
		gap: 4px;
		background: var(--color-surface);
		padding: 4px;
		border-radius: var(--radius);
	}

	:global([data-theme='xp']) .matrix-grid {
		background: var(--color-button-shadow);
		border-radius: 0;
	}

	.corner-cell {
		background: transparent;
	}

	.axis-header {
		background: var(--color-bg-secondary);
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.85rem;
		padding: 0.25rem;
	}

	.axis-x {
		min-height: 28px;
	}

	.axis-y {
		min-width: 32px;
	}

	.cell {
		min-height: 72px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 0.25rem;
		gap: 0.2rem;
		position: relative;
		font-weight: bold;
		font-size: 0.9rem;
	}

	.cell-low {
		background: #a3e6a3;
		color: #1a4a1a;
	}

	.cell-mid {
		background: #ffe27a;
		color: #6b4f00;
	}

	.cell-high {
		background: #f08a8a;
		color: #5a1414;
	}

	.cell-neutral {
		background: var(--color-bg-secondary);
		color: var(--color-text-muted);
	}

	.cell.is-avg {
		outline: 3px solid var(--color-neon-blue);
		outline-offset: -3px;
	}

	.cell.is-median {
		outline: 3px dashed var(--color-neon-pink);
		outline-offset: -6px;
	}

	.cell-value {
		font-size: 1.1rem;
	}

	.voters {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		justify-content: center;
	}

	.voter-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-bg);
		color: var(--color-text);
		font-size: 0.7rem;
		font-weight: bold;
	}

	.confirm-btn {
		font-size: 0.65rem;
		padding: 1px 4px;
		background: var(--color-bg);
		color: var(--color-text);
		border: 1px solid var(--color-surface);
		border-radius: 3px;
		cursor: pointer;
		margin-top: auto;
	}

	.confirm-btn:hover {
		border-color: var(--color-neon-green);
		color: var(--color-neon-green);
	}

	.confirm-btn.active {
		background: var(--color-neon-green);
		color: var(--color-bg);
		border-color: var(--color-neon-green);
	}

	.axis-label-x {
		text-align: center;
		font-weight: bold;
		font-size: 0.9rem;
		color: var(--color-text);
		padding: 0.25rem;
	}

	.axis-label-y {
		writing-mode: vertical-rl;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.9rem;
		color: var(--color-text);
		padding: 0.25rem;
		order: -1;
	}

	.summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-surface);
		border-radius: var(--radius);
		justify-content: center;
	}

	:global([data-theme='xp']) .summary {
		background: var(--color-window);
		border: 1px solid var(--color-button-shadow);
		border-radius: 0;
	}

	.summary-row {
		display: flex;
		gap: 0.4rem;
		align-items: baseline;
		font-size: 0.9rem;
	}

	.summary-label {
		color: var(--color-text-muted);
	}

	.summary-value {
		font-weight: bold;
		color: var(--color-text);
	}

	.summary-row.avg .summary-value {
		color: var(--color-neon-blue);
	}

	.summary-row.median .summary-value {
		color: var(--color-neon-pink);
	}

	.summary-row.final .summary-value {
		color: var(--color-neon-green);
		font-size: 1.1rem;
	}

	.empty-msg {
		color: var(--color-text-muted);
	}

	@media (max-width: 768px) {
		.cell {
			min-height: 56px;
			font-size: 0.75rem;
		}

		.cell-value {
			font-size: 0.85rem;
		}

		.voter-chip {
			width: 14px;
			height: 14px;
			font-size: 0.6rem;
		}
	}
</style>
