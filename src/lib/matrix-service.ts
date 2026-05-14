import { ref, get, set, update, remove } from 'firebase/database';
import { db } from './firebase';
import { DEFAULT_MATRIX_CONFIG } from './constants';
import type { MatrixAxis, MatrixConfig, Player } from './types';

export async function switchToMatrix(roomId: string): Promise<void> {
	const existing = await get(ref(db, `rooms/${roomId}/matrix`));
	const updates: Record<string, unknown> = {
		[`rooms/${roomId}/mode`]: 'matrix',
		[`rooms/${roomId}/status`]: 'voting'
	};
	if (!existing.exists()) {
		updates[`rooms/${roomId}/matrix`] = DEFAULT_MATRIX_CONFIG;
	}
	await update(ref(db), updates);
}

export function voteMatrix(roomId: string, playerId: string, x: string, y: string): void {
	update(ref(db, `rooms/${roomId}/players/${playerId}`), { matrixVote: { x, y } });
}

export function updateMatrixAxis(
	roomId: string,
	axis: 'x' | 'y',
	config: MatrixAxis,
	currentMatrix: MatrixConfig
): void {
	const xLen = axis === 'x' ? config.values.length : currentMatrix.xAxis.values.length;
	const yLen = axis === 'y' ? config.values.length : currentMatrix.yAxis.values.length;
	const newCells: Record<string, string> = {};
	for (let x = 0; x < xLen; x++) {
		for (let y = 0; y < yLen; y++) {
			newCells[`${x},${y}`] = currentMatrix.cells?.[`${x},${y}`] ?? '';
		}
	}
	const axisKey = axis === 'x' ? 'xAxis' : 'yAxis';
	update(ref(db, `rooms/${roomId}/matrix`), {
		[axisKey]: config,
		cells: newCells
	});
}

export function updateMatrixCell(roomId: string, xIdx: number, yIdx: number, value: string): void {
	set(ref(db, `rooms/${roomId}/matrix/cells/${xIdx},${yIdx}`), value);
}

export function resetMatrixVotes(roomId: string, players: Record<string, Player>): void {
	const updates: Record<string, unknown> = {
		[`rooms/${roomId}/status`]: 'voting'
	};
	for (const pid of Object.keys(players)) {
		updates[`rooms/${roomId}/players/${pid}/matrixVote`] = null;
	}
	update(ref(db), updates);
}

export function revealMatrix(roomId: string): void {
	update(ref(db, `rooms/${roomId}`), { status: 'revealed' });
}

export function nextMatrixIssue(
	roomId: string,
	nextIndex: number,
	players: Record<string, Player>
): void {
	const updates: Record<string, unknown> = {
		[`rooms/${roomId}/currentIssueIndex`]: nextIndex,
		[`rooms/${roomId}/status`]: 'voting'
	};
	for (const pid of Object.keys(players)) {
		updates[`rooms/${roomId}/players/${pid}/matrixVote`] = null;
	}
	update(ref(db), updates);
}

export function clearMatrix(roomId: string): void {
	remove(ref(db, `rooms/${roomId}/matrix`));
}
