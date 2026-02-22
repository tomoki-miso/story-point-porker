<script lang="ts">
	import type { KptKeep, KptProblem } from '$lib/types';

	interface Props {
		item: KptKeep | KptProblem;
		type: 'keep' | 'problem';
		canDelete: boolean;
		ondelete?: () => void;
		showVotes?: boolean;
		totalVotes?: number;
		voted?: boolean;
		canVote?: boolean;
		ontogglevote?: () => void;
		isResult?: boolean;
	}

	let {
		item,
		type,
		canDelete,
		ondelete,
		showVotes = false,
		totalVotes = 0,
		voted = false,
		canVote = false,
		ontogglevote,
		isResult = false
	}: Props = $props();
</script>

<div
	class="kpt-card"
	class:keep={type === 'keep'}
	class:problem={type === 'problem'}
	class:voted-card={showVotes && voted}
>
	{#if showVotes}
		<label class="vote-checkbox" class:disabled={!voted && !canVote}>
			<input
				type="checkbox"
				checked={voted}
				disabled={!voted && !canVote}
				onchange={ontogglevote}
			/>
			<span class="checkmark"></span>
		</label>
	{/if}
	<div class="card-body">
		<p class="card-text">{item.text}</p>
		<span class="card-author">{item.authorName}</span>
	</div>
	<div class="card-actions">
		{#if showVotes && totalVotes > 0}
			<span class="vote-count">{totalVotes}票</span>
		{/if}
		{#if canDelete}
			<button class="delete-btn" onclick={ondelete} title="削除">×</button>
		{/if}
	</div>
</div>

<style>
	.kpt-card {
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.2s ease;
	}

	.kpt-card.keep {
		border-left: 4px solid var(--color-neon-green);
	}

	.kpt-card.problem {
		border-left: 4px solid var(--color-neon-orange);
	}

	.kpt-card.voted-card {
		border-color: var(--color-neon-pink);
		box-shadow: 0 0 6px rgba(255, 45, 146, 0.15);
	}

	:global([data-theme='xp']) .kpt-card {
		background: var(--color-window);
		border: 1px solid var(--color-button-shadow);
		border-radius: 0;
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .kpt-card.keep {
		border-left: 4px solid var(--color-neon-green);
	}

	:global([data-theme='xp']) .kpt-card.problem {
		border-left: 4px solid var(--color-neon-orange);
	}

	:global([data-theme='xp']) .kpt-card.voted-card {
		background: #fff0f5;
		border-color: var(--color-neon-pink);
		box-shadow: none;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-text {
		margin: 0 0 0.25rem;
		word-break: break-word;
		color: var(--color-text);
	}

	.card-author {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.card-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* --- Checkbox vote --- */
	.vote-checkbox {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		user-select: none;
	}

	.vote-checkbox.disabled {
		cursor: not-allowed;
		opacity: 0.35;
	}

	.vote-checkbox input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.checkmark {
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-surface);
		border-radius: 3px;
		background: var(--color-bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.checkmark::after {
		content: '';
		display: none;
		width: 5px;
		height: 10px;
		border: solid var(--color-bg);
		border-width: 0 2.5px 2.5px 0;
		transform: rotate(45deg);
		margin-top: -2px;
	}

	.vote-checkbox input:checked ~ .checkmark {
		background: var(--color-neon-pink);
		border-color: var(--color-neon-pink);
		box-shadow: var(--glow-pink);
	}

	.vote-checkbox input:checked ~ .checkmark::after {
		display: block;
	}

	.vote-checkbox:not(.disabled):hover .checkmark {
		border-color: var(--color-neon-pink);
	}

	:global([data-theme='xp']) .checkmark {
		background: var(--color-window);
		border: 1px solid var(--color-input-border);
		border-radius: 0;
		box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.15);
	}

	:global([data-theme='xp']) .vote-checkbox input:checked ~ .checkmark {
		background: var(--color-window);
		border-color: var(--color-input-border);
		box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.15);
	}

	:global([data-theme='xp']) .checkmark::after {
		border-color: #0054e3;
	}

	:global([data-theme='xp']) .vote-checkbox:not(.disabled):hover .checkmark {
		border-color: var(--color-neon-pink);
	}

	.vote-count {
		font-weight: bold;
		font-size: 0.85rem;
		color: var(--color-neon-yellow);
		min-width: 1rem;
		text-align: center;
	}

	:global([data-theme='xp']) .vote-count {
		color: var(--color-neon-pink);
	}

	/* --- Delete button --- */
	.delete-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 1.1rem;
		cursor: pointer;
		padding: 0 0.25rem;
		line-height: 1;
	}

	.delete-btn:hover {
		color: var(--color-neon-orange);
	}
</style>
