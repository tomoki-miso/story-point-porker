# CSS Refactoring Design

## Goal

`theme.css`(423行)を責務ごとに分割し、デザイントークンを追加して保守性と拡張性を向上させる。

## Current State

- `theme.css` にトークン、リセット、ボタン、インプット、XPウィンドウ、アニメーション、レスポンシブが混在
- XPボタンスタイルが `.btn-leave`, `.btn-copy`, `.theme-toggle` で重複（3箇所）
- パネルスタイル（`.stats-panel`, `.issue-panel`, `.form-card`）が同パターンを繰り返し
- スペーシング値がハードコードで散在

## File Structure

```
src/lib/styles/
├── index.css          ← 全ファイルを import（app.css から参照）
├── tokens.css         ← CSS カスタムプロパティ（neon defaults + xp overrides）
├── reset.css          ← リセット + body
├── components.css     ← ボタン、インプット、XPウィンドウ、テキストユーティリティ
├── animations.css     ← @keyframes + アニメーションユーティリティクラス
└── responsive.css     ← グローバルメディアクエリ
```

## New Design Tokens

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}
```

## Scope

- グローバル CSS の分割のみ
- コンポーネント `<style>` ブロックは維持
- 既存クラス名・セレクタの変更は最小限
