export type RoomMode = 'poker' | 'kpt';
export type KptStatus = 'posting' | 'voting' | 'result';

export interface Room {
	id: string;
	hostId: string;
	currentIssueIndex: number;
	status: 'voting' | 'revealed';
	mode?: RoomMode;
	createdAt: number;
}

export interface KptKeep {
	id: string;
	text: string;
	authorId: string;
	authorName: string;
	createdAt: number;
}

export interface KptProblem {
	id: string;
	text: string;
	authorId: string;
	authorName: string;
	createdAt: number;
	votes?: Record<string, number>;
}

export interface KptData {
	status: KptStatus;
	maxVotes: number;
	keeps?: Record<string, KptKeep>;
	problems?: Record<string, KptProblem>;
}

export interface Player {
	id: string;
	name: string;
	vote: string | null;
	isHost: boolean;
	joinedAt: number;
}

export interface Issue {
	id: string;
	title: string;
	result: string | null;
}

export interface VoteStats {
	average: number;
	median: number;
	distribution: Record<string, number>;
	totalVotes: number;
}
