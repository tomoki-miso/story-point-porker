<script lang="ts">
	import { untrack } from 'svelte';
	import type { MatrixConfig } from '$lib/types';
	import { updateMatrixAxis, updateMatrixCell } from '$lib/matrix-service';

	interface Props {
		roomId: string;
		config: MatrixConfig;
		onclose: () => void;
	}

	let { roomId, config, onclose }: Props = $props();

	let xLabel = $state(untrack(() => config.xAxis.label));
	let yLabel = $state(untrack(() => config.yAxis.label));
	let xValues = $state(untrack(() => config.xAxis.values.join(',')));
	let yValues = $state(untrack(() => config.yAxis.values.join(',')));

	let cellDraft = $state<Record<string, string>>(untrack(() => ({ ...config.cells })));

	function parseValues(s: string): string[] {
		return s
			.split(',')
			.map((v) => v.trim())
			.filter((v) => v.length > 0);
	}

	function handleSaveAxes() {
		const newX = parseValues(xValues);
		const newY = parseValues(yValues);

		if (xLabel !== config.xAxis.label || newX.join(',') !== config.xAxis.values.join(',')) {
			updateMatrixAxis(roomId, 'x', { label: xLabel, values: newX }, config);
		}
		if (yLabel !== config.yAxis.label || newY.join(',') !== config.yAxis.values.join(',')) {
			updateMatrixAxis(roomId, 'y', { label: yLabel, values: newY }, config);
		}
	}

	function handleCellChange(xIdx: number, yIdx: number, value: string) {
		const key = `${xIdx},${yIdx}`;
		cellDraft[key] = value;
	}

	function handleSaveCells() {
		for (const [key, value] of Object.entries(cellDraft)) {
			if (value !== config.cells?.[key]) {
				const [x, y] = key.split(',').map(Number);
				updateMatrixCell(roomId, x, y, value);
			}
		}
	}

	function handleSaveAll() {
		handleSaveAxes();
		handleSaveCells();
		onclose();
	}

	const yRows = $derived([...config.yAxis.values].map((_, i) => config.yAxis.values.length - 1 - i));
</script>

<div
	class="overlay"
	onclick={(e) => {
		if (e.target === e.currentTarget) onclose();
	}}
	role="presentation"
>
	<div class="modal xp-window">
		<div class="xp-titlebar">
			<span>マトリクス編集</span>
			<button class="close-btn" onclick={onclose}>×</button>
		</div>
		<div class="xp-window-body modal-body">
			<section class="section">
				<h4 class="section-title">軸設定</h4>
				<div class="axis-form">
					<label>
						X軸ラベル
						<input class="input-neon" type="text" bind:value={xLabel} maxlength="20" />
					</label>
					<label>
						X軸の値（カンマ区切り）
						<input class="input-neon" type="text" bind:value={xValues} />
					</label>
					<label>
						Y軸ラベル
						<input class="input-neon" type="text" bind:value={yLabel} maxlength="20" />
					</label>
					<label>
						Y軸の値（カンマ区切り）
						<input class="input-neon" type="text" bind:value={yValues} />
					</label>
				</div>
				<p class="hint">軸の値を変更すると、対応するセルがリサイズされます</p>
			</section>

			<section class="section">
				<h4 class="section-title">セル値編集</h4>
				<div
					class="cell-grid"
					style="grid-template-columns: auto repeat({config.xAxis.values.length}, minmax(50px, 1fr));"
				>
					<div></div>
					{#each config.xAxis.values as xv (xv)}
						<div class="header">{xv}</div>
					{/each}

					{#each yRows as yIdx (yIdx)}
						<div class="header">{config.yAxis.values[yIdx]}</div>
						{#each config.xAxis.values as _xv, xIdx (xIdx)}
							{@const key = `${xIdx},${yIdx}`}
							<input
								class="cell-input"
								type="text"
								value={cellDraft[key] ?? ''}
								oninput={(e) =>
									handleCellChange(xIdx, yIdx, (e.target as HTMLInputElement).value)}
							/>
						{/each}
					{/each}
				</div>
			</section>

			<div class="actions">
				<button class="btn-neon" onclick={onclose}>キャンセル</button>
				<button class="btn-neon btn-neon--green" onclick={handleSaveAll}>保存</button>
			</div>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		width: 100%;
		max-width: 720px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-secondary);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.xp-titlebar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.close-btn {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0 0.5rem;
	}

	.modal-body {
		overflow-y: auto;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 0.95rem;
		color: var(--color-text);
		margin: 0;
	}

	.axis-form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.axis-form label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.cell-grid {
		display: grid;
		gap: 4px;
		background: var(--color-surface);
		padding: 4px;
		border-radius: var(--radius);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-secondary);
		color: var(--color-text-muted);
		font-weight: bold;
		font-size: 0.8rem;
		padding: 0.25rem;
	}

	.cell-input {
		width: 100%;
		min-width: 0;
		padding: 0.4rem;
		text-align: center;
		font-size: 0.85rem;
		font-weight: bold;
		background: var(--color-bg);
		color: var(--color-text);
		border: 1px solid var(--color-surface);
		border-radius: 4px;
	}

	.cell-input:focus {
		outline: 2px solid var(--color-neon-pink);
		outline-offset: -2px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	@media (max-width: 768px) {
		.axis-form {
			grid-template-columns: 1fr;
		}
	}
</style>
