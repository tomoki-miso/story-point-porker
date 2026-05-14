<script lang="ts">
	import type { MatrixConfig, MatrixVote } from '$lib/types';
	import { voteMatrix } from '$lib/matrix-service';

	interface Props {
		roomId: string;
		playerId: string;
		config: MatrixConfig;
		currentVote: MatrixVote | null;
	}

	let { roomId, playerId, config, currentVote }: Props = $props();

	let selectedX = $state<string | null>(null);
	let selectedY = $state<string | null>(null);

	$effect(() => {
		selectedX = currentVote?.x ?? null;
		selectedY = currentVote?.y ?? null;
	});

	const canSubmit = $derived(selectedX != null && selectedY != null);
	const isUpdate = $derived(currentVote != null);

	function handleSubmit() {
		if (selectedX == null || selectedY == null) return;
		voteMatrix(roomId, playerId, selectedX, selectedY);
	}
</script>

<div class="matrix-vote-selector">
	<div class="axis-block">
		<h3 class="axis-title">{config.yAxis.label}</h3>
		<div class="axis-row">
			{#each config.yAxis.values as value (value)}
				<button
					class="poker-card"
					class:selected={selectedY === value}
					onclick={() => (selectedY = value)}
				>
					{value}
				</button>
			{/each}
		</div>
	</div>

	<div class="axis-block">
		<h3 class="axis-title">{config.xAxis.label}</h3>
		<div class="axis-row">
			{#each config.xAxis.values as value (value)}
				<button
					class="poker-card"
					class:selected={selectedX === value}
					onclick={() => (selectedX = value)}
				>
					{value}
				</button>
			{/each}
		</div>
	</div>

	<button class="btn-neon btn-neon--green submit-btn" disabled={!canSubmit} onclick={handleSubmit}>
		{isUpdate ? '更新する' : '投票する'}
	</button>
</div>

<style>
	.matrix-vote-selector {
		width: 100%;
		max-width: 700px;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		text-align: center;
	}

	.axis-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.axis-title {
		color: var(--color-text-muted);
		font-size: 0.95rem;
		margin: 0;
	}

	.axis-row {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.poker-card {
		width: 56px;
		height: 80px;
		border: 2px solid var(--color-neon-purple);
		border-radius: 8px;
		background: var(--color-bg-secondary);
		color: var(--color-text);
		font-size: 1.25rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.poker-card:hover {
		border-color: var(--color-neon-pink);
		box-shadow: var(--glow-pink);
		transform: translateY(-4px);
	}

	.poker-card.selected {
		background: var(--color-neon-pink);
		color: var(--color-bg);
		border-color: var(--color-neon-pink);
		box-shadow: var(--glow-pink);
		transform: translateY(-6px);
	}

	:global([data-theme='xp']) .poker-card {
		background: linear-gradient(180deg, #ffffff 0%, #f5f3eb 100%);
		border: 2px solid var(--color-button-dk-shadow);
		border-radius: 4px;
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .poker-card.selected {
		background: linear-gradient(180deg, #4e98ff 0%, #0054e3 100%);
		color: #ffffff;
		border-color: #003cad;
		box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.3);
		transform: translateY(-4px);
	}

	.submit-btn {
		align-self: center;
		margin-top: 0.5rem;
	}

	@media (max-width: 768px) {
		.poker-card {
			width: 44px;
			height: 64px;
			font-size: 1rem;
		}
	}
</style>
