import { writable, derived } from 'svelte/store';
import { subscribeToRoom } from '$lib/room-service';
import type { Room, Player, Issue } from '$lib/types';

export const roomData = writable<Record<string, unknown> | null>(null);
export const currentPlayerId = writable<string | null>(null);

export const roomInfo = derived(roomData, ($data) => {
	if (!$data) return null;
	return {
		id: $data.id,
		hostId: $data.hostId,
		currentIssueIndex: $data.currentIssueIndex ?? 0,
		status: $data.status ?? 'voting'
	} as Room;
});

export const players = derived(roomData, ($data) => {
	if (!$data?.players) return {} as Record<string, Player>;
	return $data.players as Record<string, Player>;
});

export const issues = derived(roomData, ($data) => {
	if (!$data?.issues) return [] as Issue[];
	const issuesObj = $data.issues as Record<string, Issue>;
	return Object.values(issuesObj);
});

export const isHost = derived([roomInfo, currentPlayerId], ([$room, $playerId]) => {
	if (!$room || !$playerId) return false;
	return $room.hostId === $playerId;
});

export const currentPlayer = derived([players, currentPlayerId], ([$players, $playerId]) => {
	if (!$playerId || !$players[$playerId]) return null;
	return $players[$playerId];
});

export function initRoomSubscription(roomId: string) {
	return subscribeToRoom(roomId, (data) => {
		roomData.set(data);
	});
}
