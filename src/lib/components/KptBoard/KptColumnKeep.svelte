<script lang="ts">
	import type { KptKeep, KptStatus } from '$lib/types';
	import KptItemCard from './KptItemCard.svelte';

	interface Props {
		keeps: KptKeep[];
		status: KptStatus;
		currentPlayerId: string | null;
		onadd: (text: string) => void;
		ondelete: (keepId: string) => void;
	}

	let { keeps, status, currentPlayerId, onadd, ondelete }: Props = $props();

	let inputText = $state('');

	function handleSubmit() {
		const text = inputText.trim();
		if (!text) return;
		onadd(text);
		inputText = '';
	}
</script>

<div class="kpt-column keep-column">
	<h3 class="column-title keep-title">
		<span class="column-icon">&#9733;</span>
		Keep
		<span class="column-count">{keeps.length}</span>
	</h3>
	<div class="column-items">
		{#each keeps as keep (keep.id)}
			<KptItemCard
				item={keep}
				type="keep"
				canDelete={keep.authorId === currentPlayerId && status === 'posting'}
				ondelete={() => ondelete(keep.id)}
			/>
		{/each}
		{#if keeps.length === 0}
			<p class="empty-hint">まだKeepがありません</p>
		{/if}
	</div>
	{#if status === 'posting'}
		<form class="add-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<input
				class="input-neon"
				type="text"
				placeholder="良かったことを入力..."
				bind:value={inputText}
				maxlength="200"
			/>
			<button class="btn-neon btn-neon--green add-btn" type="submit" disabled={!inputText.trim()}>
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

	.keep-title {
		color: var(--color-neon-green);
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
