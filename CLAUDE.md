# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (http://localhost:5173/)
- `npm run build` — Production build
- `npm run check` — TypeScript type checking (runs svelte-kit sync first)
- `npm run test` — Run all tests (vitest)
- `npx vitest run src/lib/stats.test.ts` — Run a single test file

## Architecture

SvelteKit 2 + Firebase Realtime Database のリアルタイムプランニングポーカーアプリ。認証なし、URL共有型のルームベース設計。

### Data Flow

1. **room-service.ts** — Firebase CRUD の薄いラッパー。全てのDB操作はここを経由する
2. **room-store.ts** — `subscribeToRoom()` で Firebase の `onValue` リスナーを接続し、`roomData` writable store に流す。`roomInfo`, `players`, `issues`, `isHost` は全て `roomData` からの derived store
3. **theme-store.ts** — `theme` writable store で `'neon' | 'xp'` を管理。`<html>` の `data-theme` 属性を切替え、CSS変数でスタイル適用
4. **ルームページ** — store を subscribe し、UIに反映。投票・公開・リセット等のアクションは room-service の関数を直接呼ぶ

### UI Components

- **AppHeader.svelte** — ルートレイアウトに配置。ロゴとテーマトグルボタンを提供
- **XpAssistant.svelte** — XPテーマ時のみ表示されるクリッピー風イルカアシスタント

### State Management

- プレイヤーIDは `sessionStorage` に `player_{roomId}` キーで保存（リロード時の再参加用）
- ルームの状態は `'voting' | 'revealed'` の2状態。ホストが公開/リセットで遷移させる
- 複数フィールドの同時更新（リセット、次の議題）は Firebase の `update(ref(db), updates)` でルートからのマルチパス更新を使う
- テーマは `localStorage` に `theme` キーで `'neon' | 'xp'` を保存。`theme.css` で CSS変数を切替
- onDisconnect ハンドラ: `setupHostDisconnectHandler()` でホスト切断時にルーム削除、`setupPlayerDisconnectHandler()` でプレイヤー切断時にプレイヤーデータ削除

### Firebase Data Structure

```
rooms/{roomId}/
  ├── id, hostId, status, currentIssueIndex, createdAt
  ├── players/{playerId}/
  │   └── id, name, vote, isHost, joinedAt
  └── issues/{issueId}/
      └── id, title, result
```

### Environment

Firebase の設定は `$env/static/public` 経由。`.env.example` を参照。
