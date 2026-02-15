import { ref, set, get, update, remove, onValue, onDisconnect, type Unsubscribe } from 'firebase/database';
import { db } from './firebase';
import { generateRoomId, generatePlayerId } from './id-utils';
import type { Room, Player, Issue } from './types';

export function createRoom(hostName: string): { roomId: string; playerId: string } {
	const roomId = generateRoomId();
	const playerId = generatePlayerId();

	const room: Room = {
		id: roomId,
		hostId: playerId,
		currentIssueIndex: 0,
		status: 'voting',
		createdAt: Date.now()
	};

	const player: Player = {
		id: playerId,
		name: hostName,
		vote: null,
		isHost: true,
		joinedAt: Date.now()
	};

	set(ref(db, `rooms/${roomId}`), room);
	set(ref(db, `rooms/${roomId}/players/${playerId}`), player);

	return { roomId, playerId };
}

export function joinRoom(roomId: string, playerName: string): string {
	const playerId = generatePlayerId();

	const player: Player = {
		id: playerId,
		name: playerName,
		vote: null,
		isHost: false,
		joinedAt: Date.now()
	};

	set(ref(db, `rooms/${roomId}/players/${playerId}`), player);
	return playerId;
}

export async function roomExists(roomId: string): Promise<boolean> {
	const snapshot = await get(ref(db, `rooms/${roomId}/id`));
	return snapshot.exists();
}

export function vote(roomId: string, playerId: string, value: string): void {
	update(ref(db, `rooms/${roomId}/players/${playerId}`), { vote: value });
}

export function revealCards(roomId: string): void {
	update(ref(db, `rooms/${roomId}`), { status: 'revealed' });
}

export function resetVotes(roomId: string, players: Record<string, Player>): void {
	const updates: Record<string, unknown> = {
		[`rooms/${roomId}/status`]: 'voting'
	};
	for (const pid of Object.keys(players)) {
		updates[`rooms/${roomId}/players/${pid}/vote`] = null;
	}
	update(ref(db), updates);
}

export function addIssue(roomId: string, title: string): void {
	const issueId = crypto.randomUUID();
	const issue: Issue = { id: issueId, title, result: null };
	set(ref(db, `rooms/${roomId}/issues/${issueId}`), issue);
}

export function setIssueResult(roomId: string, issueId: string, result: string): void {
	update(ref(db, `rooms/${roomId}/issues/${issueId}`), { result });
}

export function nextIssue(
	roomId: string,
	nextIndex: number,
	players: Record<string, Player>
): void {
	const updates: Record<string, unknown> = {
		[`rooms/${roomId}/currentIssueIndex`]: nextIndex,
		[`rooms/${roomId}/status`]: 'voting'
	};
	for (const pid of Object.keys(players)) {
		updates[`rooms/${roomId}/players/${pid}/vote`] = null;
	}
	update(ref(db), updates);
}

export function subscribeToRoom(
	roomId: string,
	callback: (data: Record<string, unknown> | null) => void
): Unsubscribe {
	return onValue(ref(db, `rooms/${roomId}`), (snapshot) => {
		callback(snapshot.val());
	});
}

export function setupHostDisconnectHandler(roomId: string): () => void {
	const roomRef = ref(db, `rooms/${roomId}`);
	onDisconnect(roomRef).remove();
	return () => { onDisconnect(roomRef).cancel(); };
}

export function setupPlayerDisconnectHandler(roomId: string, playerId: string): () => void {
	const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
	onDisconnect(playerRef).remove();
	return () => { onDisconnect(playerRef).cancel(); };
}

export function leaveRoom(roomId: string, playerId: string): void {
	remove(ref(db, `rooms/${roomId}/players/${playerId}`));
}

export function deleteRoom(roomId: string): void {
	remove(ref(db, `rooms/${roomId}`));
}
