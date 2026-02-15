<script lang="ts">
	import { addIssue } from '$lib/room-service';
	import type { Issue } from '$lib/types';

	interface Props {
		roomId: string;
		issues: Issue[];
		currentIndex: number;
		isHost: boolean;
	}

	let { roomId, issues, currentIndex, isHost }: Props = $props();
	let newIssueTitle = $state('');

	function escapeHtml(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function linkify(text: string): string {
		const urlPattern = /(https?:\/\/[^\s<>"']+)/g;
		const parts = text.split(urlPattern);
		return parts.map((part, i) =>
			i % 2 === 1
				? `<a href="${escapeHtml(part)}" target="_blank" rel="noopener noreferrer">${escapeHtml(part)}</a>`
				: escapeHtml(part)
		).join('');
	}

	function handleAdd() {
		if (!newIssueTitle.trim()) return;
		addIssue(roomId, newIssueTitle.trim());
		newIssueTitle = '';
	}
</script>

<aside class="xp-window issue-wrapper">
	<div class="xp-titlebar"><span class="neon-text-blue">議題リスト</span></div>
	<div class="xp-window-body">
		<div class="issue-panel">
			{#if isHost}
				<form
					class="add-form"
					onsubmit={(e) => {
						e.preventDefault();
						handleAdd();
					}}
				>
					<input
						class="input-neon"
						type="text"
						placeholder="議題を追加..."
						bind:value={newIssueTitle}
						maxlength="100"
					/>
					<button class="btn-neon btn-neon--blue" type="submit" disabled={!newIssueTitle.trim()}>
						追加
					</button>
				</form>
			{/if}

			<ul class="issue-list">
				{#each issues as issue, i (issue.id)}
					<li class="issue-item" class:active={i === currentIndex} class:done={issue.result !== null}>
						<span class="issue-index">{i + 1}.</span>
						<span class="issue-title">{@html linkify(issue.title)}</span>
						{#if issue.result !== null}
							<span class="issue-result">{issue.result}pt</span>
						{/if}
					</li>
				{/each}
			</ul>

			{#if issues.length === 0}
				<p class="empty-msg">議題がまだありません</p>
			{/if}
		</div>
	</div>
</aside>

<style>
	.issue-wrapper {
		width: 100%;
		max-width: 350px;
	}

	.issue-panel {
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 1.5rem;
	}

	:global([data-theme='xp']) .issue-panel {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
	}

	.add-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-form .input-neon {
		flex: 1;
		padding: 8px 12px;
		font-size: 0.9rem;
	}

	.add-form :global(.btn-neon) {
		padding: 8px 16px;
		font-size: 0.8rem;
	}

	.issue-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.issue-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.8rem;
		border-radius: 8px;
		background: var(--color-surface);
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	:global([data-theme='xp']) .issue-item {
		background: var(--color-window);
		border: 1px solid var(--color-button-shadow);
		border-radius: 0;
	}

	.issue-item.active {
		border: 2px solid var(--color-neon-pink);
		box-shadow: var(--glow-pink);
		background: rgba(255, 45, 149, 0.1);
	}

	:global([data-theme='xp']) .issue-item.active {
		border: 2px solid var(--color-neon-pink);
		background: #e0ecff;
		box-shadow: none;
	}

	.issue-item.done {
		opacity: 0.6;
	}

	:global([data-theme='xp']) .issue-item.done {
		background: #f0f0e8;
	}

	.issue-index {
		color: var(--color-text-muted);
		font-size: 0.8rem;
		min-width: 1.5rem;
	}

	.issue-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.issue-title :global(a) {
		color: var(--color-neon-blue, #00d4ff);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	:global([data-theme='xp']) .issue-title :global(a) {
		color: #0066cc;
	}

	.issue-title :global(a:hover) {
		opacity: 0.8;
	}

	.issue-result {
		color: var(--color-neon-green);
		font-weight: bold;
		font-size: 0.85rem;
	}

	.empty-msg {
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.85rem;
		padding: 1rem;
	}
</style>
