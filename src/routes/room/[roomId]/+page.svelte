<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { joinRoom, vote as submitVote, leaveRoom, deleteRoom, setupHostDisconnectHandler, setupPlayerDisconnectHandler } from '$lib/room-service';
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
	import IssuePanel from '$lib/components/IssuePanel.svelte';
	import RevealAnimation from '$lib/components/RevealAnimation.svelte';

	const roomId: string = $derived($page.params.roomId ?? '');
	let joinName = $state('');
	let hasJoined = $state(false);
	let unsubscribe: (() => void) | null = null;
	let showRevealAnimation = $state(false);
	let prevStatus = $state('voting');
	let copyLabel = $state('URLをコピー');

	let hasReceivedData = $state(false);
	let cancelDisconnectHandler: (() => void) | null = null;

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

		const onBeforeUnload = () => {
			if ($isHost) {
				deleteRoom(roomId);
				sessionStorage.removeItem(`player_${roomId}`);
				sessionStorage.removeItem(`playerName_${roomId}`);
			}
		};
		window.addEventListener('beforeunload', onBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', onBeforeUnload);
		};
	});

	// ホスト切断時にルーム自動削除
	$effect(() => {
		if (!browser || !roomId) return;
		if ($isHost) {
			cancelDisconnectHandler = setupHostDisconnectHandler(roomId);
			return () => {
				cancelDisconnectHandler?.();
				cancelDisconnectHandler = null;
			};
		}
	});

	// プレイヤー切断時にプレイヤーエントリ自動削除
	$effect(() => {
		if (!browser || !roomId) return;
		const pid = $currentPlayerId;
		if (pid && hasJoined) {
			const cancel = setupPlayerDisconnectHandler(roomId, pid);
			return () => { cancel(); };
		}
	});

	// Firebaseからデータを受信したことを追跡
	$effect(() => {
		if ($roomData !== null) {
			hasReceivedData = true;
		}
	});

	// ルームが削除されたら他プレイヤーをトップに遷移
	$effect(() => {
		if (hasReceivedData && $roomData === null) {
			sessionStorage.removeItem(`player_${roomId}`);
			sessionStorage.removeItem(`playerName_${roomId}`);
			goto('/');
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
			cancelDisconnectHandler?.();
			cancelDisconnectHandler = null;
			if ($isHost) {
				deleteRoom(roomId);
			} else {
				leaveRoom(roomId, pid);
			}
			sessionStorage.removeItem(`player_${roomId}`);
			sessionStorage.removeItem(`playerName_${roomId}`);
		}
		goto('/');
	}

	const playerList = $derived(Object.values($players));
	const allVoted = $derived(playerList.length > 0 && playerList.every((p) => p.vote != null));
	const myVote = $derived($currentPlayer?.vote ?? null);
	const isRevealed = $derived($roomInfo?.status === 'revealed');

	$effect(() => {
		if ($roomInfo?.status === 'revealed' && prevStatus === 'voting') {
			showRevealAnimation = true;
			setTimeout(() => {
				showRevealAnimation = false;
			}, 2500);
		}
		prevStatus = $roomInfo?.status ?? 'voting';
	});
</script>

<svelte:head>
	<title>Room {roomId} - Story Point Porker</title>
</svelte:head>

{#if !hasJoined}
	<div class="join-container">
		<div class="xp-window join-wrapper">
			<div class="xp-titlebar"><span class="neon-text-blue">ルームに参加</span></div>
			<div class="xp-window-body">
				<div class="form-card">
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
		</div>
	</div>
{:else if $roomInfo}
	<RevealAnimation show={showRevealAnimation} />
	<div class="room-layout">
		<header class="room-header">
			<div class="room-meta">
				<span class="room-id-badge">Room: {roomId}</span>
				<button
					class="btn-copy"
					onclick={() => {
						navigator.clipboard.writeText(window.location.href);
						copyLabel = 'コピーしました!';
						setTimeout(() => { copyLabel = 'URLをコピー'; }, 2000);
					}}
				>
					{copyLabel}
				</button>
				<button class="btn-leave" onclick={handleLeave}>退出</button>
			</div>
		</header>

		<div class="room-body">
		<main class="room-main">
			{#snippet playerCard(player: import('$lib/types').Player)}
				<div
					class="player-slot"
					class:voted={player.vote != null}
					class:not-voted={player.vote == null && !isRevealed}
					class:is-me={player.id === $currentPlayerId}
				>
					<div class="player-card" class:animate-reveal={isRevealed && player.vote != null}>
						{#if isRevealed && player.vote != null}
							<span class="card-value">{player.vote}</span>
						{:else if player.vote != null}
							<span class="card-back">&#10003;</span>
						{:else}
							<span class="card-empty">?</span>
						{/if}
					</div>
					<span class="player-name" class:host-badge={player.isHost}>
						{player.name}
						{#if player.isHost}(Host){/if}
					</span>
					{#if !isRevealed}
						<span class="vote-label" class:done={player.vote != null}>
							{player.vote != null ? '選択済み' : '未選択'}
						</span>
					{/if}
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
		<IssuePanel
			{roomId}
			issues={$issues}
			currentIndex={$roomInfo?.currentIssueIndex ?? 0}
			isHost={$isHost}
		/>
		</div>
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

	.join-wrapper {
		width: 100%;
		max-width: 400px;
	}

	.form-card {
		background: var(--color-bg-secondary);
		border: 2px solid var(--color-surface);
		border-radius: var(--radius);
		padding: 2rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: center;
	}

	:global([data-theme='xp']) .form-card {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 0;
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

	:global([data-theme='xp']) .room-header {
		background: var(--color-button-face);
		border-bottom: 1px solid var(--color-button-shadow);
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

	:global([data-theme='xp']) .room-id-badge {
		background: var(--color-window);
		border: 1px solid var(--color-button-shadow);
		box-shadow: inset 1px 1px 0 var(--color-button-shadow);
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

	:global([data-theme='xp']) .btn-leave,
	:global([data-theme='xp']) .btn-copy {
		background: linear-gradient(180deg, #ffffff 0%, #ece9d8 90%, #d6d2c2 100%);
		border: 1px solid var(--color-button-dk-shadow);
		color: var(--color-text);
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .btn-leave:hover,
	:global([data-theme='xp']) .btn-copy:hover {
		background: linear-gradient(180deg, #fff4cf 0%, #ffd870 100%);
		border-color: var(--color-button-dk-shadow);
		color: var(--color-text);
	}

	.room-body {
		flex: 1;
		display: flex;
		gap: 1rem;
		padding: 1rem 2rem;
	}

	.room-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
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
		transition: opacity 0.3s ease;
	}

	.not-voted {
		opacity: 0.5;
	}

	.not-voted .player-card {
		border-style: dashed;
	}

	:global([data-theme='xp']) .not-voted .player-card {
		border-color: var(--color-button-shadow);
		background: #f5f5f0;
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

	:global([data-theme='xp']) .player-card {
		background: var(--color-window);
		border: 2px solid var(--color-button-dk-shadow);
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	.voted .player-card {
		border-color: var(--color-neon-green);
		box-shadow: var(--glow-green);
	}

	:global([data-theme='xp']) .voted .player-card {
		border-color: var(--color-neon-green);
		background: #e8f5e8;
		box-shadow: none;
	}

	.is-me .player-card {
		border-color: var(--color-neon-blue);
	}

	:global([data-theme='xp']) .is-me .player-card {
		border-color: var(--color-neon-pink);
		border-width: 3px;
	}

	.card-value {
		color: var(--color-neon-yellow);
		font-size: 2rem;
		text-shadow: var(--glow-gold);
	}

	:global([data-theme='xp']) .card-value {
		color: var(--color-neon-pink);
		text-shadow: none;
	}

	.card-back {
		color: var(--color-neon-green);
	}

	.card-empty {
		color: var(--color-text-muted);
		opacity: 0.3;
	}

	:global([data-theme='xp']) .card-empty {
		color: var(--color-button-shadow);
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

	.vote-label {
		font-size: 0.7rem;
		color: var(--color-neon-orange);
	}

	.vote-label.done {
		color: var(--color-neon-green);
	}

	.voted .player-name {
		color: var(--color-text);
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

	:global([data-theme='xp']) .poker-card {
		background: linear-gradient(180deg, #ffffff 0%, #f5f3eb 100%);
		border: 2px solid var(--color-button-dk-shadow);
		border-radius: 4px;
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .poker-card:hover {
		border-color: var(--color-neon-pink);
		box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
		transform: translateY(-4px);
	}

	:global([data-theme='xp']) .poker-card.selected {
		background: linear-gradient(180deg, #4e98ff 0%, #0054e3 100%);
		color: #ffffff;
		border-color: #003cad;
		box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.3);
		transform: translateY(-6px);
	}

	.btn-copy {
		background: none;
		border: 1px solid var(--color-neon-blue);
		color: var(--color-neon-blue);
		padding: 0.4rem 1rem;
		border-radius: var(--radius);
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s ease;
	}

	.btn-copy:hover {
		background: var(--color-neon-blue);
		color: var(--color-bg);
	}

	.loading {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}

	:global([data-theme='xp']) .loading {
		color: #ffffff;
	}

	@media (max-width: 768px) {
		.room-header {
			flex-direction: column;
			gap: 0.5rem;
			padding: 0.75rem 1rem;
		}

		.room-body {
			flex-direction: column;
			padding: 0.5rem 1rem;
		}

		.poker-card {
			width: 52px;
			height: 78px;
			font-size: 1.2rem;
		}

		.cards-row {
			gap: 0.5rem;
		}

		.players-circle {
			gap: 1rem;
		}
	}
</style>
