# Story Point Porker

パチンコ風の派手なUIを持つ、リアルタイムマルチプレイヤー対応プランニングポーカーアプリ。

## 機能

- **ルーム作成・参加** - URLを共有するだけで誰でも参加可能（名前入力のみ）
- **リアルタイム投票** - Firebase Realtime Database による即時同期
- **ホスト制御** - カード公開・リセット・次の議題への進行をホストが管理
- **投票統計** - 平均値・中央値・分布をカード公開時に自動表示
- **投票状況インジケータ** - 投票済み/未投票の人数をリアルタイム表示
- **議題管理** - ホストが議題リストを作成し、順番に進行
- **URL自動リンク** - 議題タイトル中のURLが自動でクリック可能に
- **テーマ切替** - ネオンテーマと Windows XP Luna テーマのトグル切替（localStorage で永続化）
- **XP アシスタント（イルカ）** - XPテーマ時にクリッピー風のイルカアシスタントが表示
- **自動クリーンアップ** - ホスト/プレイヤーの切断時に Firebase onDisconnect で自動削除
- **パチンコ風演出** - カード公開時にネオンパーティクル + "OPEN!" アニメーション
- **レスポンシブ対応** - PC・モバイル両対応

カード数列: `1, 2, 3, 5, 8, 13, 21`

## 技術スタック

- **フロントエンド:** SvelteKit 2, TypeScript
- **バックエンド:** Firebase Realtime Database
- **ビルド:** Vite
- **テスト:** Vitest

## セットアップ

### 1. 依存パッケージのインストール

```sh
npm install
```

### 2. Firebase プロジェクトの設定

[Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成し、Realtime Database を有効化してください。

`.env.example` をコピーして `.env` を作成し、Firebase の設定値を記入します。

```sh
cp .env.example .env
```

```
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firebase Realtime Database ルール

Firebase Console で以下のルールを設定してください。

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

### 4. 開発サーバーの起動

```sh
npm run dev
```

`http://localhost:5173/` でアプリが起動します。

## 使い方

1. トップページで「ルームを作成」をクリックし、名前を入力
2. ルームに入ったら「URLをコピー」でチームメンバーに共有
3. ホストは右側の議題パネルから議題を追加
4. 各メンバーがカードを選択して投票
5. 全員の投票が完了したら、ホストが「カードを公開」
6. 統計結果を確認し、「リセット」または「次の議題へ」で進行

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーの起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run test` | テストの実行 |
| `npm run test:watch` | テストのウォッチモード |
| `npm run check` | 型チェック |

## プロジェクト構成

```
src/
├── app.css                          # グローバルCSSインポート
├── lib/
│   ├── firebase.ts                  # Firebase 初期化
│   ├── types.ts                     # 型定義 (Room, Player, Issue, VoteStats)
│   ├── constants.ts                 # カード値の定数
│   ├── id-utils.ts                  # ID生成ユーティリティ
│   ├── room-service.ts              # Firebase CRUD操作
│   ├── stats.ts                     # 投票統計計算
│   ├── stats.test.ts                # 統計計算のテスト
│   ├── assets/
│   │   ├── iruka.svg                # イルカアイコン（favicon兼用）
│   │   └── iruka.png                # イルカ画像
│   ├── stores/
│   │   ├── room-store.ts            # Svelte ストア (ルーム状態管理)
│   │   └── theme-store.ts           # テーマ状態管理ストア
│   ├── components/
│   │   ├── AppHeader.svelte         # ヘッダー（ロゴ + テーマトグル）
│   │   ├── HostControls.svelte      # ホスト用操作パネル
│   │   ├── VoteStats.svelte         # 投票結果統計表示
│   │   ├── IssuePanel.svelte        # 議題管理パネル
│   │   ├── RevealAnimation.svelte   # カード公開アニメーション
│   │   └── XpAssistant.svelte       # XP イルカアシスタント
│   └── styles/
│       └── theme.css                # テーマCSS変数（ネオン / XP Luna）
└── routes/
    ├── +layout.svelte               # ルートレイアウト
    ├── +page.svelte                 # トップページ
    └── room/
        └── [roomId]/
            └── +page.svelte         # ルームページ
```
