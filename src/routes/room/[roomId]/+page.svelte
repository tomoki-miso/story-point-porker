<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { joinRoom, vote as submitVote, leaveRoom } from '$lib/room-service';
	import {
		roomData,
		roomInfo,
		players,
		issues,
		isHost,
		currentPlayerId,
		currentPlayer,
		initRoomSubscription
	} from '$lib/stores/room-store';
	import { CARD_VALUES } from '$lib/constants';
	import HostControls from '$lib/components/HostControls.svelte';
	import VoteStats from '$lib/components/VoteStats.svelte';

	const roomId = $derived($page.params.roomId);
	let joinName = $state('');
	let hasJoined = $state(false);
	let unsubscribe: (() => void) | null = null;

	$effect(() => {
		if (!browser || !roomId) return;

		unsubscribe = initRoomSubscription(roomId);

		const savedPlayerId = sessionStorage.getItem(`player_${roomId}`);
		if (savedPlayerId) {
			currentPlayerId.set(savedPlayerId);
			hasJoined = true;
		}

		const savedName = sessionStorage.getItem(`playerName_${roomId}`);
		if (savedName) {
			joinName = savedName;
		}
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	function handleJoin() {
		if (!joinName.trim()) return;
		const playerId = joinRoom(roomId, joinName.trim());
		currentPlayerId.set(playerId);
		sessionStorage.setItem(`player_${roomId}`, playerId);
		sessionStorage.setItem(`playerName_${roomId}`, joinName.trim());
		hasJoined = true;
	}

	function handleVote(value: string) {
		const pid = $currentPlayerId;
		if (!pid || $roomInfo?.status === 'revealed') return;
		submitVote(roomId, pid, value);
	}

	function handleLeave() {
		const pid = $currentPlayerId;
		if (pid) {
			leaveRoom(roomId, pid);
			sessionStorage.removeItem(`player_${roomId}`);
			sessionStorage.removeItem(`playerName_${roomId}`);
		}
		goto('/');
	}

	const playerList = $derived(Object.values($players));
	const allVoted = $derived(playerList.length > 0 && playerList.every((p) => p.vote !== null));
	const myVote = $derived($currentPlayer?.vote ?? null);
	const isRevealed = $derived($roomInfo?.status === 'revealed');
</script>

<svelte:head>
	<title>Room {roomId} - Story Point Porker</title>
</svelte:head>

{#if !hasJoined}
	<div class="join-container">
		<div class="form-card">
			<h2 class="neon-text-blue">ルームに参加</h2>
			<p class="room-id">Room: <span class="neon-text">{roomId}</span></p>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleJoin();
				}}
			>
				<input
					class="input-neon"
					type="text"
					placeholder="あなたの名前"
					bind:value={joinName}
					maxlength="20"
				/>
				<button class="btn-neon btn-neon--green" type="submit" disabled={!joinName.trim()}>
					参加する
				</button>
			</form>
		</div>
	</div>
{:else if $roomInfo}
	<div class="room-layout">
		<header class="room-header">
			<h1 class="room-title neon-text">PORKER</h1>
			<div class="room-meta">
				<span class="room-id-badge">Room: {roomId}</span>
				<button class="btn-leave" onclick={handleLeave}>退出</button>
			</div>
		</header>

		<main class="room-main">
			{#snippet playerCard(player: import('$lib/types').Player)}
				<div
					class="player-slot"
					class:voted={player.vote !== null}
					class:is-me={player.id === $currentPlayerId}
				>
					<div class="player-card" class:animate-reveal={isRevealed && player.vote !== null}>
						{#if isRevealed && player.vote !== null}
							<span class="card-value">{player.vote}</span>
						{:else if player.vote !== null}
							<span class="card-back">&#10003;</span>
						{:else}
							<span class="card-empty">?</span>
						{/if}
					</div>
					<span class="player-name" class:host-badge={player.isHost}>
						{player.name}
						{#if player.isHost}(Host){/if}
					</span>
				</div>
			{/snippet}

			<div class="players-circle">
				{#each playerList as player (player.id)}
					{@render playerCard(player)}
				{/each}
			</div>

			{#if !isRevealed}
				<div class="card-selector">
					<h3 class="selector-title">ポイントを選択</h3>
					<div class="cards-row">
						{#each CARD_VALUES as value}
							<button
								class="poker-card"
								class:selected={myVote === value}
								onclick={() => handleVote(value)}
							>
								{value}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if $isHost}
				<HostControls
					{roomId}
					room={$roomInfo}
					players={$players}
					issues={$issues}
					{allVoted}
				/>
			{/if}

			{#if isRevealed}
				<VoteStats players={$players} />
			{/if}
		</main>
	</div>
{:else}
	<div class="loading">
		<p class="neon-text animate-pulse">Loading...</p>
	</div>
{/if}

<style>
	.join-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
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
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.room-id {
		color: var(--color-text-muted);
	}

	.room-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.room-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		border-bottom: 2px solid var(--color-surface);
	}

	.room-title {
		font-family: var(--font-display);
		font-size: 1.8rem;
		color: var(--color-neon-pink);
	}

	.room-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.room-id-badge {
		background: var(--color-surface);
		padding: 0.4rem 1rem;
		border-radius: var(--radius);
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.btn-leave {
		background: none;
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-muted);
		padding: 0.4rem 1rem;
		border-radius: var(--radius);
		cursor: pointer;
		font-size: 0.85rem;
	}

	.btn-leave:hover {
		border-color: var(--color-neon-orange);
		color: var(--color-neon-orange);
	}

	.room-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		gap: 2rem;
	}

	.players-circle {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		justify-content: center;
		max-width: 800px;
	}

	.player-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.player-card {
		width: var(--card-width);
		height: var(--card-height);
		border: 3px solid var(--color-surface);
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-secondary);
		font-size: 1.5rem;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	.voted .player-card {
		border-color: var(--color-neon-green);
		box-shadow: var(--glow-green);
	}

	.is-me .player-card {
		border-color: var(--color-neon-blue);
	}

	.card-value {
		color: var(--color-neon-yellow);
		font-size: 2rem;
		text-shadow: var(--glow-gold);
	}

	.card-back {
		color: var(--color-neon-green);
	}

	.card-empty {
		color: var(--color-text-muted);
		opacity: 0.3;
	}

	.player-name {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		max-width: var(--card-width);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
	}

	.host-badge {
		color: var(--color-gold);
	}

	.card-selector {
		width: 100%;
		max-width: 700px;
		text-align: center;
	}

	.selector-title {
		color: var(--color-text-muted);
		margin-bottom: 1rem;
		font-size: 1rem;
	}

	.cards-row {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.poker-card {
		width: 64px;
		height: 96px;
		border: 2px solid var(--color-neon-purple);
		border-radius: 8px;
		background: var(--color-bg-secondary);
		color: var(--color-text);
		font-size: 1.5rem;
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
		transform: translateY(-6px);
	}

	.poker-card.selected {
		background: var(--color-neon-pink);
		color: var(--color-bg);
		border-color: var(--color-neon-pink);
		box-shadow: var(--glow-pink);
		transform: translateY(-8px);
	}

	.loading {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}
</style>
