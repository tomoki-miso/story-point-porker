# Planning Poker App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** リアルタイムマルチプレイヤー対応のプランニングポーカーアプリを、パチンコ風の派手なUIで構築する

**Architecture:** SvelteKit (SSR + SPA) をフロントエンドに、Firebase Realtime Database をリアルタイム同期のバックエンドに使用。ルームはURL共有型で、名前入力のみで参加可能。ホスト（ルーム作成者）がカード公開・リセット・議題進行を制御する。

**Tech Stack:** SvelteKit 2, TypeScript, Firebase Realtime Database, Vite, CSS (カスタムプロパティ + アニメーション)

---

## Task 1: プロジェクト初期化

**Files:**
- Create: プロジェクト全体 (SvelteKit scaffold)
- Create: `firebase.json`
- Create: `src/lib/firebase.ts`
- Create: `.env.example`

**Step 1: SvelteKit プロジェクトを作成**

```bash
cd /Users/misoshiru/Development/story-point-porker
npx sv create . --template minimal --types ts
```

対話プロンプトでは:
- Add prettier: Yes
- Add eslint: Yes
- Package manager: npm

**Step 2: Firebase SDK をインストール**

```bash
npm install firebase
```

**Step 3: 環境変数ファイルを作成**

`.env.example`:
```
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Step 4: Firebase クライアント初期化モジュールを作成**

`src/lib/firebase.ts`:
```ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_DATABASE_URL,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: PUBLIC_FIREBASE_DATABASE_URL,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
```

**Step 5: 開発サーバーが起動することを確認**

```bash
npm run dev
```

Expected: `Local: http://localhost:5173/` でアプリが起動

**Step 6: コミット**

```bash
git init
git add -A
git commit -m "chore: initialize SvelteKit project with Firebase"
```

---

## Task 2: 型定義とデータモデル

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/constants.ts`

**Step 1: 型定義を作成**

`src/lib/types.ts`:
```ts
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
```

**Step 2: 定数を作成**

`src/lib/constants.ts`:
```ts
export const CARD_VALUES = ['0', '1', '2', '3', '5', '8', '13', '21', '?'] as const;

export type CardValue = (typeof CARD_VALUES)[number];
```

**Step 3: コミット**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add type definitions and constants"
```

---

## Task 3: ルームサービス (Firebase CRUD)

**Files:**
- Create: `src/lib/room-service.ts`
- Create: `src/lib/id-utils.ts`

**Step 1: ID 生成ユーティリティを作成**

`src/lib/id-utils.ts`:
```ts
export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generatePlayerId(): string {
  return crypto.randomUUID();
}
```

**Step 2: ルームサービスを作成**

`src/lib/room-service.ts`:
```ts
import { ref, set, get, update, remove, onValue, type Unsubscribe } from 'firebase/database';
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

export function nextIssue(roomId: string, nextIndex: number, players: Record<string, Player>): void {
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

export function leaveRoom(roomId: string, playerId: string): void {
  remove(ref(db, `rooms/${roomId}/players/${playerId}`));
}
```

**Step 3: コミット**

```bash
git add src/lib/room-service.ts src/lib/id-utils.ts
git commit -m "feat: add room service with Firebase CRUD operations"
```

---

## Task 4: 統計計算ユーティリティ

**Files:**
- Create: `src/lib/stats.ts`
- Create: `src/lib/stats.test.ts`

**Step 1: テストを作成**

まず vitest をインストール:
```bash
npm install -D vitest
```

`package.json` の `scripts` に追加:
```json
"test": "vitest run",
"test:watch": "vitest"
```

`src/lib/stats.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { calculateStats } from './stats';

describe('calculateStats', () => {
  it('数値投票の平均値と中央値を計算する', () => {
    const votes = { a: '3', b: '5', c: '8' };
    const stats = calculateStats(votes);
    expect(stats.average).toBeCloseTo(5.33, 1);
    expect(stats.median).toBe(5);
    expect(stats.totalVotes).toBe(3);
  });

  it('?を含む投票では?を除外して計算する', () => {
    const votes = { a: '3', b: '5', c: '?' };
    const stats = calculateStats(votes);
    expect(stats.average).toBe(4);
    expect(stats.median).toBe(4);
    expect(stats.totalVotes).toBe(3);
  });

  it('分布を正しく計算する', () => {
    const votes = { a: '3', b: '3', c: '5' };
    const stats = calculateStats(votes);
    expect(stats.distribution).toEqual({ '3': 2, '5': 1 });
  });

  it('全員?の場合、平均・中央値は0', () => {
    const votes = { a: '?', b: '?' };
    const stats = calculateStats(votes);
    expect(stats.average).toBe(0);
    expect(stats.median).toBe(0);
  });

  it('投票が空の場合', () => {
    const stats = calculateStats({});
    expect(stats.average).toBe(0);
    expect(stats.median).toBe(0);
    expect(stats.totalVotes).toBe(0);
  });
});
```

**Step 2: テストが失敗することを確認**

```bash
npx vitest run src/lib/stats.test.ts
```

Expected: FAIL - `calculateStats` が存在しない

**Step 3: 実装を作成**

`src/lib/stats.ts`:
```ts
import type { VoteStats } from './types';

export function calculateStats(votes: Record<string, string | null>): VoteStats {
  const allValues = Object.values(votes).filter((v): v is string => v !== null);
  const numericValues = allValues
    .filter((v) => v !== '?')
    .map(Number)
    .filter((n) => !isNaN(n));

  const distribution: Record<string, number> = {};
  for (const v of allValues) {
    distribution[v] = (distribution[v] || 0) + 1;
  }

  if (numericValues.length === 0) {
    return { average: 0, median: 0, distribution, totalVotes: allValues.length };
  }

  const sorted = [...numericValues].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const average = sum / sorted.length;

  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return {
    average: Math.round(average * 100) / 100,
    median,
    distribution,
    totalVotes: allValues.length
  };
}
```

**Step 4: テストが通ることを確認**

```bash
npx vitest run src/lib/stats.test.ts
```

Expected: 全テスト PASS

**Step 5: コミット**

```bash
git add src/lib/stats.ts src/lib/stats.test.ts package.json package-lock.json
git commit -m "feat: add vote statistics calculation with tests"
```

---

## Task 5: グローバルCSS - パチンコ風テーマ

**Files:**
- Modify: `src/app.css` (もしくは `src/app.html`)
- Create: `src/lib/styles/theme.css`

**Step 1: テーマCSSを作成**

`src/lib/styles/theme.css`:
```css
:root {
  /* パチンコ風カラーパレット */
  --color-bg: #0a0a1a;
  --color-bg-secondary: #1a1a3e;
  --color-surface: #2a2a5e;
  --color-surface-hover: #3a3a7e;

  --color-neon-pink: #ff2d95;
  --color-neon-blue: #00d4ff;
  --color-neon-green: #39ff14;
  --color-neon-yellow: #ffe600;
  --color-neon-orange: #ff6600;
  --color-neon-purple: #bf00ff;

  --color-gold: #ffd700;
  --color-silver: #c0c0c0;

  --color-text: #ffffff;
  --color-text-muted: #a0a0c0;

  /* グロー効果 */
  --glow-pink: 0 0 10px var(--color-neon-pink), 0 0 30px var(--color-neon-pink);
  --glow-blue: 0 0 10px var(--color-neon-blue), 0 0 30px var(--color-neon-blue);
  --glow-green: 0 0 10px var(--color-neon-green), 0 0 30px var(--color-neon-green);
  --glow-gold: 0 0 10px var(--color-gold), 0 0 30px var(--color-gold);

  /* フォント */
  --font-main: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-display: 'Impact', 'Arial Black', sans-serif;

  /* サイズ */
  --card-width: 80px;
  --card-height: 120px;
  --radius: 12px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-main);
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ネオングロー テキスト */
.neon-text {
  text-shadow: var(--glow-pink);
}

.neon-text-blue {
  text-shadow: var(--glow-blue);
}

/* ネオン ボタン */
.btn-neon {
  background: transparent;
  border: 2px solid var(--color-neon-pink);
  color: var(--color-neon-pink);
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: var(--radius);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-neon:hover {
  background: var(--color-neon-pink);
  color: var(--color-bg);
  box-shadow: var(--glow-pink);
}

.btn-neon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-neon--blue {
  border-color: var(--color-neon-blue);
  color: var(--color-neon-blue);
}

.btn-neon--blue:hover {
  background: var(--color-neon-blue);
  color: var(--color-bg);
  box-shadow: var(--glow-blue);
}

.btn-neon--green {
  border-color: var(--color-neon-green);
  color: var(--color-neon-green);
}

.btn-neon--green:hover {
  background: var(--color-neon-green);
  color: var(--color-bg);
  box-shadow: var(--glow-green);
}

/* ネオン入力フィールド */
.input-neon {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-surface);
  color: var(--color-text);
  padding: 12px 16px;
  font-size: 1rem;
  border-radius: var(--radius);
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.input-neon:focus {
  border-color: var(--color-neon-blue);
  box-shadow: var(--glow-blue);
}

/* カード公開アニメーション */
@keyframes card-reveal {
  0% {
    transform: rotateY(180deg) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: rotateY(90deg) scale(1.1);
  }
  100% {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes neon-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes rainbow-border {
  0% { border-color: var(--color-neon-pink); }
  25% { border-color: var(--color-neon-blue); }
  50% { border-color: var(--color-neon-green); }
  75% { border-color: var(--color-neon-yellow); }
  100% { border-color: var(--color-neon-pink); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.animate-reveal {
  animation: card-reveal 0.6s ease-out forwards;
}

.animate-pulse {
  animation: neon-pulse 2s ease-in-out infinite;
}

.animate-rainbow {
  animation: rainbow-border 3s linear infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

**Step 2: app.css にテーマをインポート**

`src/app.css`:
```css
@import './lib/styles/theme.css';
```

**Step 3: コミット**

```bash
git add src/lib/styles/theme.css src/app.css
git commit -m "feat: add pachinko-style neon theme CSS"
```

---

## Task 6: トップページ (ルーム作成・参加)

**Files:**
- Modify: `src/routes/+page.svelte`

**Step 1: トップページコンポーネントを作成**

`src/routes/+page.svelte`:
```svelte
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
      <button class="btn-neon" onclick={() => (mode = 'create')}>
        ルームを作成
      </button>
      <button class="btn-neon btn-neon--blue" onclick={() => (mode = 'join')}>
        ルームに参加
      </button>
    </div>
  {:else if mode === 'create'}
    <div class="form-card">
      <h3 class="form-title neon-text">ルーム作成</h3>
      <form onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
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
      <form onsubmit={(e) => { e.preventDefault(); handleJoin(); }}>
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
        <button class="btn-neon btn-neon--green" type="submit" disabled={!joinRoomId.trim() || !joinName.trim()}>
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
</style>
```

**Step 2: 開発サーバーで表示を確認**

```bash
npm run dev
```

ブラウザで `http://localhost:5173/` を開き、パチンコ風のトップページが表示されることを確認。

**Step 3: コミット**

```bash
git add src/routes/+page.svelte
git commit -m "feat: add top page with room create/join UI"
```

---

## Task 7: ルームページ - レイアウトとプレイヤー参加

**Files:**
- Create: `src/routes/room/[roomId]/+page.svelte`
- Create: `src/lib/stores/room-store.ts`

**Step 1: ルームストアを作成**

`src/lib/stores/room-store.ts`:
```ts
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
```

**Step 2: ルームページを作成**

`src/routes/room/[roomId]/+page.svelte`:
```svelte
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

  const roomId = $derived($page.params.roomId);
  let joinName = $state('');
  let hasJoined = $state(false);
  let unsubscribe: (() => void) | null = null;

  $effect(() => {
    if (!browser || !roomId) return;

    unsubscribe = initRoomSubscription(roomId);

    // 既にセッションに保存されたプレイヤーIDがあるか確認
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
  <!-- 名前入力画面 -->
  <div class="join-container">
    <div class="form-card">
      <h2 class="neon-text-blue">ルームに参加</h2>
      <p class="room-id">Room: <span class="neon-text">{roomId}</span></p>
      <form onsubmit={(e) => { e.preventDefault(); handleJoin(); }}>
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
  <!-- ルームメイン画面 -->
  <div class="room-layout">
    <!-- ヘッダー -->
    <header class="room-header">
      <h1 class="room-title neon-text">PORKER</h1>
      <div class="room-meta">
        <span class="room-id-badge">Room: {roomId}</span>
        <button class="btn-back" onclick={handleLeave}>退出</button>
      </div>
    </header>

    <!-- メインエリア: プレイヤーカードとコントロール -->
    <main class="room-main">
      {#snippet playerCard(player: import('$lib/types').Player)}
        <div class="player-slot" class:voted={player.vote !== null} class:is-me={player.id === $currentPlayerId}>
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

      <!-- 投票カード選択 -->
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

  .btn-back {
    background: none;
    border: 1px solid var(--color-text-muted);
    color: var(--color-text-muted);
    padding: 0.4rem 1rem;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 0.85rem;
  }

  .btn-back:hover {
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
```

**Step 3: 開発サーバーで表示を確認**

```bash
npm run dev
```

ブラウザで `http://localhost:5173/` からルーム作成 → ルームページ遷移を確認。

**Step 4: コミット**

```bash
git add src/lib/stores/room-store.ts src/routes/room/\[roomId\]/+page.svelte
git commit -m "feat: add room page with player cards and voting UI"
```

---

## Task 8: ホストコントロール (公開・リセット・次の議題)

**Files:**
- Create: `src/lib/components/HostControls.svelte`
- Create: `src/lib/components/VoteStats.svelte`
- Modify: `src/routes/room/[roomId]/+page.svelte`

**Step 1: HostControlsコンポーネントを作成**

`src/lib/components/HostControls.svelte`:
```svelte
<script lang="ts">
  import { revealCards, resetVotes, nextIssue, setIssueResult } from '$lib/room-service';
  import type { Player, Issue, Room } from '$lib/types';

  interface Props {
    roomId: string;
    room: Room;
    players: Record<string, Player>;
    issues: Issue[];
    allVoted: boolean;
  }

  let { roomId, room, players, issues, allVoted }: Props = $props();

  const isRevealed = $derived(room.status === 'revealed');
  const currentIssue = $derived(issues[room.currentIssueIndex] ?? null);
  const hasNextIssue = $derived(room.currentIssueIndex < issues.length - 1);

  function handleReveal() {
    revealCards(roomId);
  }

  function handleReset() {
    resetVotes(roomId, players);
  }

  function handleNextIssue() {
    nextIssue(roomId, room.currentIssueIndex + 1, players);
  }
</script>

<div class="host-controls">
  {#if !isRevealed}
    <button class="btn-neon btn-neon--green" onclick={handleReveal} disabled={!allVoted}>
      カードを公開
    </button>
  {:else}
    <div class="revealed-actions">
      <button class="btn-neon" onclick={handleReset}>
        リセット
      </button>
      {#if hasNextIssue}
        <button class="btn-neon btn-neon--blue" onclick={handleNextIssue}>
          次の議題へ
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .host-controls {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .revealed-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
```

**Step 2: VoteStatsコンポーネントを作成**

`src/lib/components/VoteStats.svelte`:
```svelte
<script lang="ts">
  import { calculateStats } from '$lib/stats';
  import type { Player } from '$lib/types';

  interface Props {
    players: Record<string, Player>;
  }

  let { players }: Props = $props();

  const stats = $derived(() => {
    const votes: Record<string, string | null> = {};
    for (const [id, p] of Object.entries(players)) {
      votes[id] = p.vote;
    }
    return calculateStats(votes);
  });
</script>

<div class="stats-panel">
  <h3 class="stats-title neon-text">投票結果</h3>
  <div class="stats-grid">
    <div class="stat-item">
      <span class="stat-label">平均</span>
      <span class="stat-value neon-text-blue">{stats().average}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">中央値</span>
      <span class="stat-value neon-text-blue">{stats().median}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">投票数</span>
      <span class="stat-value">{stats().totalVotes}</span>
    </div>
  </div>
  <div class="distribution">
    <h4 class="dist-title">分布</h4>
    <div class="dist-bars">
      {#each Object.entries(stats().distribution) as [value, count]}
        <div class="dist-bar-item">
          <span class="dist-label">{value}</span>
          <div class="dist-bar">
            <div
              class="dist-fill"
              style="width: {(count / stats().totalVotes) * 100}%"
            ></div>
          </div>
          <span class="dist-count">{count}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .stats-panel {
    background: var(--color-bg-secondary);
    border: 2px solid var(--color-surface);
    border-radius: var(--radius);
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
  }

  .stats-title {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .stats-grid {
    display: flex;
    justify-content: space-around;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-bottom: 0.3rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
  }

  .dist-title {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .distribution {
    border-top: 1px solid var(--color-surface);
    padding-top: 1rem;
  }

  .dist-bars {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .dist-bar-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dist-label {
    width: 2rem;
    text-align: right;
    font-size: 0.9rem;
    color: var(--color-neon-yellow);
  }

  .dist-bar {
    flex: 1;
    height: 20px;
    background: var(--color-surface);
    border-radius: 4px;
    overflow: hidden;
  }

  .dist-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-neon-pink), var(--color-neon-purple));
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .dist-count {
    width: 1.5rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }
</style>
```

**Step 3: ルームページにホストコントロールと統計を統合**

`src/routes/room/[roomId]/+page.svelte` の `</main>` の直前に以下を追加:

```svelte
<!-- room-main 内の cards-row セクションの後に追加 -->

<!-- ホストコントロール -->
{#if $isHost}
  <HostControls
    {roomId}
    room={$roomInfo}
    players={$players}
    issues={$issues}
    {allVoted}
  />
{/if}

<!-- 投票結果統計 (公開時のみ) -->
{#if isRevealed}
  <VoteStats players={$players} />
{/if}
```

`<script>` の import に追加:
```ts
import HostControls from '$lib/components/HostControls.svelte';
import VoteStats from '$lib/components/VoteStats.svelte';
```

**Step 4: 動作確認**

```bash
npm run dev
```

2つのブラウザウィンドウで同じルームに参加し、投票→公開→統計表示のフローを確認。

**Step 5: コミット**

```bash
git add src/lib/components/HostControls.svelte src/lib/components/VoteStats.svelte src/routes/room/\[roomId\]/+page.svelte
git commit -m "feat: add host controls and vote statistics display"
```

---

## Task 9: 議題 (イシュー) 管理パネル

**Files:**
- Create: `src/lib/components/IssuePanel.svelte`
- Modify: `src/routes/room/[roomId]/+page.svelte`

**Step 1: IssuePanelコンポーネントを作成**

`src/lib/components/IssuePanel.svelte`:
```svelte
<script lang="ts">
  import { addIssue } from '$lib/room-service';
  import type { Issue } from '$lib/types';

  interface Props {
    roomId: string;
    issues: Issue[];
    currentIndex: number;
    isHost: boolean;
  }

  let { roomId, issues, currentIndex, isHost }: Props = $props();
  let newIssueTitle = $state('');

  function handleAdd() {
    if (!newIssueTitle.trim()) return;
    addIssue(roomId, newIssueTitle.trim());
    newIssueTitle = '';
  }
</script>

<aside class="issue-panel">
  <h3 class="panel-title neon-text-blue">議題リスト</h3>

  {#if isHost}
    <form class="add-form" onsubmit={(e) => { e.preventDefault(); handleAdd(); }}>
      <input
        class="input-neon"
        type="text"
        placeholder="議題を追加..."
        bind:value={newIssueTitle}
        maxlength="100"
      />
      <button class="btn-neon btn-neon--blue" type="submit" disabled={!newIssueTitle.trim()}>
        追加
      </button>
    </form>
  {/if}

  <ul class="issue-list">
    {#each issues as issue, i (issue.id)}
      <li
        class="issue-item"
        class:active={i === currentIndex}
        class:done={issue.result !== null}
      >
        <span class="issue-index">{i + 1}.</span>
        <span class="issue-title">{issue.title}</span>
        {#if issue.result !== null}
          <span class="issue-result">{issue.result}pt</span>
        {/if}
      </li>
    {/each}
  </ul>

  {#if issues.length === 0}
    <p class="empty-msg">議題がまだありません</p>
  {/if}
</aside>

<style>
  .issue-panel {
    background: var(--color-bg-secondary);
    border: 2px solid var(--color-surface);
    border-radius: var(--radius);
    padding: 1.5rem;
    width: 100%;
    max-width: 350px;
  }

  .panel-title {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .add-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .add-form .input-neon {
    flex: 1;
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  .add-form .btn-neon {
    padding: 8px 16px;
    font-size: 0.8rem;
  }

  .issue-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .issue-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    background: var(--color-surface);
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .issue-item.active {
    border: 2px solid var(--color-neon-pink);
    box-shadow: var(--glow-pink);
    background: rgba(255, 45, 149, 0.1);
  }

  .issue-item.done {
    opacity: 0.6;
  }

  .issue-index {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    min-width: 1.5rem;
  }

  .issue-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issue-result {
    color: var(--color-neon-green);
    font-weight: bold;
    font-size: 0.85rem;
  }

  .empty-msg {
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    padding: 1rem;
  }
</style>
```

**Step 2: ルームページに議題パネルを統合**

`src/routes/room/[roomId]/+page.svelte` のレイアウトを修正し、サイドバーとして議題パネルを配置:

import を追加:
```ts
import IssuePanel from '$lib/components/IssuePanel.svelte';
```

`room-layout` 内のレイアウトを修正して、`<main>` の隣にサイドバーとして配置:
```svelte
<div class="room-body">
  <main class="room-main">
    <!-- 既存のメインコンテンツ -->
  </main>
  <IssuePanel
    {roomId}
    issues={$issues}
    currentIndex={$roomInfo?.currentIssueIndex ?? 0}
    isHost={$isHost}
  />
</div>
```

CSSに追加:
```css
.room-body {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem 2rem;
}

.room-main {
  flex: 1;
}
```

**Step 3: 動作確認**

```bash
npm run dev
```

ホストとして議題を追加し、リストに表示されることを確認。

**Step 4: コミット**

```bash
git add src/lib/components/IssuePanel.svelte src/routes/room/\[roomId\]/+page.svelte
git commit -m "feat: add issue management panel"
```

---

## Task 10: カード公開時のパチンコ風演出

**Files:**
- Create: `src/lib/components/RevealAnimation.svelte`
- Modify: `src/routes/room/[roomId]/+page.svelte`

**Step 1: 公開アニメーションコンポーネントを作成**

`src/lib/components/RevealAnimation.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    show: boolean;
  }

  let { show }: Props = $props();

  interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    delay: number;
    duration: number;
  }

  let particles = $state<Particle[]>([]);

  const neonColors = [
    '#ff2d95', '#00d4ff', '#39ff14', '#ffe600', '#ff6600', '#bf00ff', '#ffd700'
  ];

  $effect(() => {
    if (show) {
      particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        size: Math.random() * 12 + 4,
        delay: Math.random() * 0.5,
        duration: Math.random() * 1 + 0.5
      }));

      setTimeout(() => {
        particles = [];
      }, 2000);
    }
  });
</script>

{#if particles.length > 0}
  <div class="reveal-overlay">
    {#each particles as p (p.id)}
      <div
        class="particle"
        style="
          left: {p.x}%;
          top: {p.y}%;
          background: {p.color};
          width: {p.size}px;
          height: {p.size}px;
          animation-delay: {p.delay}s;
          animation-duration: {p.duration}s;
          box-shadow: 0 0 {p.size}px {p.color};
        "
      ></div>
    {/each}
    <div class="reveal-text neon-text">OPEN!</div>
  </div>
{/if}

<style>
  .reveal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reveal-text {
    font-family: var(--font-display);
    font-size: 6rem;
    color: var(--color-neon-pink);
    animation: reveal-text-pop 0.6s ease-out forwards;
    letter-spacing: 12px;
  }

  @keyframes reveal-text-pop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    60% {
      transform: scale(1.3);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    animation: particle-burst 1s ease-out forwards;
  }

  @keyframes particle-burst {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: scale(2) translateY(-50px);
      opacity: 0;
    }
  }
</style>
```

**Step 2: ルームページにアニメーションを統合**

import を追加:
```ts
import RevealAnimation from '$lib/components/RevealAnimation.svelte';
```

`<RevealAnimation show={isRevealed} />` をルームページ内に配置。
公開直後のフレームだけ表示するため、`showRevealAnimation` state を管理:
```ts
let showRevealAnimation = $state(false);
let prevStatus = $state('voting');

$effect(() => {
  if ($roomInfo?.status === 'revealed' && prevStatus === 'voting') {
    showRevealAnimation = true;
    setTimeout(() => { showRevealAnimation = false; }, 2500);
  }
  prevStatus = $roomInfo?.status ?? 'voting';
});
```

```svelte
<RevealAnimation show={showRevealAnimation} />
```

**Step 3: 動作確認**

```bash
npm run dev
```

カード公開ボタン押下時にパーティクル + "OPEN!" テキストが表示されることを確認。

**Step 4: コミット**

```bash
git add src/lib/components/RevealAnimation.svelte src/routes/room/\[roomId\]/+page.svelte
git commit -m "feat: add pachinko-style reveal animation"
```

---

## Task 11: レスポンシブ対応 & 仕上げ

**Files:**
- Modify: `src/lib/styles/theme.css`
- Modify: `src/routes/+page.svelte`
- Modify: `src/routes/room/[roomId]/+page.svelte`

**Step 1: レスポンシブ CSS を追加**

`src/lib/styles/theme.css` に追加:
```css
@media (max-width: 768px) {
  :root {
    --card-width: 60px;
    --card-height: 90px;
  }
}
```

各コンポーネントの `<style>` にモバイル対応を追加。トップページのタイトルサイズ縮小、ルームページではサイドバーを下に移動 (flex-direction: column) など。

**Step 2: URL共有のコピーボタンを追加**

ルームページのヘッダーに「URLをコピー」ボタンを追加:
```svelte
<button class="btn-copy" onclick={() => navigator.clipboard.writeText(window.location.href)}>
  URLをコピー
</button>
```

**Step 3: 全体の動作確認**

```bash
npm run dev
```

以下のフローを確認:
1. トップページでルーム作成
2. URLをコピーして別のブラウザ/タブで参加
3. 議題を追加
4. 全員が投票
5. ホストがカード公開 → パチンコ演出 + 統計表示
6. リセット or 次の議題へ
7. モバイル表示の確認

**Step 4: コミット**

```bash
git add -A
git commit -m "feat: add responsive design and URL copy button"
```

---

## Task 12: ビルド & デプロイ準備

**Files:**
- Modify: `svelte.config.js`
- Create: `.gitignore` (更新)

**Step 1: ビルド確認**

```bash
npm run build
npm run preview
```

Expected: ビルド成功、プレビューで動作確認。

**Step 2: Firebase Realtime Database ルールを設定**

Firebase コンソールで以下のルールを設定:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**Step 3: コミット**

```bash
git add -A
git commit -m "chore: configure build and Firebase rules"
```

---

## まとめ

| Task | 内容 | 推定ファイル数 |
|------|------|----------------|
| 1 | プロジェクト初期化 | 3-4 |
| 2 | 型定義・定数 | 2 |
| 3 | ルームサービス (Firebase) | 2 |
| 4 | 統計計算 (TDD) | 2 |
| 5 | パチンコ風テーマCSS | 2 |
| 6 | トップページ | 1 |
| 7 | ルームページ + ストア | 2 |
| 8 | ホストコントロール + 統計UI | 3 |
| 9 | 議題管理パネル | 2 |
| 10 | カード公開演出 | 2 |
| 11 | レスポンシブ + 仕上げ | 3 |
| 12 | ビルド・デプロイ準備 | 2 |
