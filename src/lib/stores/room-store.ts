import { writable, derived } from 'svelte/store';
import { subscribeToRoom } from '$lib/room-service';
import type { Room, Player, Issue, KptData, KptKeep, KptProblem, RoomMode } from '$lib/types';

export const roomData = writable<Record<string, unknown> | null>(null);
export const currentPlayerId = writable<string | null>(null);

export const roomInfo = derived(roomData, ($data) => {
	if (!$data) return null;
	return {
		id: $data.id,
		hostId: $data.hostId,
		currentIssueIndex: $data.currentIssueIndex ?? 0,
		status: $data.status ?? 'voting',
		mode: ($data.mode as RoomMode) ?? 'poker'
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

export const kptData = derived(roomData, ($data) => {
	if (!$data?.kpt) return null;
	return $data.kpt as KptData;
});

export const kptStatus = derived(kptData, ($kpt) => $kpt?.status ?? 'posting');

export const kptMaxVotes = derived(kptData, ($kpt) => $kpt?.maxVotes ?? 3);

export const kptKeeps = derived(kptData, ($kpt) => {
	if (!$kpt?.keeps) return [] as KptKeep[];
	return Object.values($kpt.keeps as Record<string, KptKeep>).sort((a, b) => a.createdAt - b.createdAt);
});

export const kptProblems = derived(kptData, ($kpt) => {
	if (!$kpt?.problems) return [] as KptProblem[];
	return Object.values($kpt.problems as Record<string, KptProblem>).sort((a, b) => a.createdAt - b.createdAt);
});

export const kptProblemsSorted = derived(kptProblems, ($problems) => {
	return [...$problems].sort((a, b) => {
		const aTotal = a.votes ? Object.values(a.votes).reduce((s, v) => s + v, 0) : 0;
		const bTotal = b.votes ? Object.values(b.votes).reduce((s, v) => s + v, 0) : 0;
		return bTotal - aTotal;
	});
});

export const myTotalVotes = derived([kptProblems, currentPlayerId], ([$problems, $playerId]) => {
	if (!$playerId) return 0;
	return $problems.reduce((total, p) => {
		return total + (p.votes?.[($playerId)] ?? 0);
	}, 0);
});

export const myRemainingVotes = derived([kptMaxVotes, myTotalVotes], ([$max, $used]) => $max - $used);

export const kptPlayerVoteCounts = derived([kptProblems, players], ([$problems, $players]) => {
	const counts: Record<string, number> = {};
	for (const pid of Object.keys($players)) {
		counts[pid] = $problems.reduce((total, p) => total + (p.votes?.[pid] ?? 0), 0);
	}
	return counts;
});

export function initRoomSubscription(roomId: string) {
	return subscribeToRoom(roomId, (data) => {
		roomData.set(data);
	});
}
