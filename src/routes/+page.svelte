<script lang="ts">
	import { goto } from '$app/navigation';
	import { createRoom, roomExists } from '$lib/room-service';
	import { browser } from '$app/environment';

	let hostName = $state('');
	let joinRoomId = $state('');
	let joinName = $state('');
	let errorMessage = $state('');
	let mode = $state<'home' | 'create' | 'join'>('home');

	function handleCreate() {
		if (!hostName.trim()) return;
		const { roomId, playerId } = createRoom(hostName.trim());
		if (browser) {
			sessionStorage.setItem(`player_${roomId}`, playerId);
			sessionStorage.setItem(`playerName_${roomId}`, hostName.trim());
		}
		goto(`/room/${roomId}`);
	}

	async function handleJoin() {
		if (!joinRoomId.trim() || !joinName.trim()) return;
		errorMessage = '';
		const exists = await roomExists(joinRoomId.trim());
		if (!exists) {
			errorMessage = 'ルームが見つかりません';
			return;
		}
		if (browser) {
			sessionStorage.setItem(`playerName_${joinRoomId.trim()}`, joinName.trim());
		}
		goto(`/room/${joinRoomId.trim()}`);
	}
</script>

<svelte:head>
	<title>Planning Poker - Story Point Porker</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1 class="title neon-text">STORY POINT</h1>
		<h2 class="subtitle neon-text-blue">PORKER</h2>
		<p class="tagline animate-pulse">~ Planning Poker ~</p>
	</header>

	{#if mode === 'home'}
		<div class="actions">
			<button class="btn-neon" onclick={() => (mode = 'create')}>ルームを作成</button>
			<button class="btn-neon btn-neon--blue" onclick={() => (mode = 'join')}>ルームに参加</button>
		</div>
	{:else if mode === 'create'}
		<div class="form-card">
			<h3 class="form-title neon-text">ルーム作成</h3>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreate();
				}}
			>
				<input
					class="input-neon"
					type="text"
					placeholder="あなたの名前"
					bind:value={hostName}
					maxlength="20"
				/>
				<button class="btn-neon btn-neon--green" type="submit" disabled={!hostName.trim()}>
					作成してスタート
				</button>
			</form>
			<button class="btn-back" onclick={() => (mode = 'home')}>戻る</button>
		</div>
	{:else}
		<div class="form-card">
			<h3 class="form-title neon-text-blue">ルーム参加</h3>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleJoin();
				}}
			>
				<input
					class="input-neon"
					type="text"
					placeholder="ルームID"
					bind:value={joinRoomId}
					maxlength="20"
				/>
				<input
					class="input-neon"
					type="text"
					placeholder="あなたの名前"
					bind:value={joinName}
					maxlength="20"
				/>
				{#if errorMessage}
					<p class="error">{errorMessage}</p>
				{/if}
				<button
					class="btn-neon btn-neon--green"
					type="submit"
					disabled={!joinRoomId.trim() || !joinName.trim()}
				>
					参加する
				</button>
			</form>
			<button class="btn-back" onclick={() => (mode = 'home')}>戻る</button>
		</div>
	{/if}
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.title {
		font-family: var(--font-display);
		font-size: 4rem;
		color: var(--color-neon-pink);
		letter-spacing: 8px;
	}

	.subtitle {
		font-family: var(--font-display);
		font-size: 3rem;
		color: var(--color-neon-blue);
		letter-spacing: 12px;
		margin-top: -0.5rem;
	}

	.tagline {
		color: var(--color-neon-yellow);
		margin-top: 1rem;
		font-size: 1.2rem;
		letter-spacing: 4px;
	}

	.actions {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.form-card {
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-title {
		text-align: center;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.error {
		color: var(--color-neon-orange);
		font-size: 0.9rem;
		text-align: center;
	}

	.btn-back {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: 0.9rem;
		text-align: center;
		padding: 0.5rem;
	}

	.btn-back:hover {
		color: var(--color-text);
	}

	@media (max-width: 768px) {
		.title {
			font-size: 2.5rem;
			letter-spacing: 4px;
		}

		.subtitle {
			font-size: 2rem;
			letter-spacing: 6px;
		}

		.actions {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
