export interface Room {
	id: string;
	hostId: string;
	currentIssueIndex: number;
	status: 'voting' | 'revealed';
	createdAt: number;
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
