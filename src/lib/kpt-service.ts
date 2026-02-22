import { ref, set, update, remove } from 'firebase/database';
import { db } from './firebase';
import type { KptKeep, KptProblem, KptData } from './types';

export function switchToKpt(roomId: string): void {
	const kptData: KptData = {
		status: 'posting',
		maxVotes: 3
	};
	update(ref(db), {
		[`rooms/${roomId}/mode`]: 'kpt',
		[`rooms/${roomId}/kpt/status`]: kptData.status,
		[`rooms/${roomId}/kpt/maxVotes`]: kptData.maxVotes
	});
}

export function switchToPoker(roomId: string): void {
	update(ref(db, `rooms/${roomId}`), { mode: 'poker' });
}

export function addKeep(roomId: string, text: string, authorId: string, authorName: string): void {
	const keepId = crypto.randomUUID();
	const keep: KptKeep = {
		id: keepId,
		text,
		authorId,
		authorName,
		createdAt: Date.now()
	};
	set(ref(db, `rooms/${roomId}/kpt/keeps/${keepId}`), keep);
}

export function deleteKeep(roomId: string, keepId: string): void {
	remove(ref(db, `rooms/${roomId}/kpt/keeps/${keepId}`));
}

export function addProblem(roomId: string, text: string, authorId: string, authorName: string): void {
	const problemId = crypto.randomUUID();
	const problem: KptProblem = {
		id: problemId,
		text,
		authorId,
		authorName,
		createdAt: Date.now()
	};
	set(ref(db, `rooms/${roomId}/kpt/problems/${problemId}`), problem);
}

export function deleteProblem(roomId: string, problemId: string): void {
	remove(ref(db, `rooms/${roomId}/kpt/problems/${problemId}`));
}

export function startKptVoting(roomId: string): void {
	update(ref(db, `rooms/${roomId}/kpt`), { status: 'voting' });
}

export function showKptResults(roomId: string): void {
	update(ref(db, `rooms/${roomId}/kpt`), { status: 'result' });
}

export function resetKpt(roomId: string): void {
	const kptData: KptData = {
		status: 'posting',
		maxVotes: 3
	};
	set(ref(db, `rooms/${roomId}/kpt`), kptData);
}

export function voteProblem(roomId: string, problemId: string, playerId: string, delta: number, currentVotes: number): void {
	const newVotes = Math.max(0, currentVotes + delta);
	if (newVotes === 0) {
		remove(ref(db, `rooms/${roomId}/kpt/problems/${problemId}/votes/${playerId}`));
	} else {
		set(ref(db, `rooms/${roomId}/kpt/problems/${problemId}/votes/${playerId}`), newVotes);
	}
}

export function setMaxVotes(roomId: string, maxVotes: number): void {
	update(ref(db, `rooms/${roomId}/kpt`), { maxVotes });
}

export function clearKpt(roomId: string): void {
	remove(ref(db, `rooms/${roomId}/kpt`));
}
