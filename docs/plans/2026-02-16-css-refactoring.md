# CSS Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `theme.css`(423行)を責務別の6ファイルに分割し、デザイントークンを追加して保守性を向上させる。

**Architecture:** 現在の単一 `theme.css` を tokens / reset / components / animations / responsive / index に分割。`app.css` の import 先を `index.css` に変更。既存のクラス名・セレクタは一切変更しない純粋なファイル分割。

**Tech Stack:** CSS custom properties, SvelteKit

---

### Task 1: tokens.css を作成

**Files:**
- Create: `src/lib/styles/tokens.css`

**Step 1: ファイルを作成**

`theme.css` の行1-82（`:root` と `[data-theme='xp']` ブロック）に新しいデザイントークンを加えて `tokens.css` を作成する。

```css
:root {
	/* パチンコ風カラーパレット (Neon theme - default) */
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

	/* スペーシング */
	--space-xs: 0.25rem;
	--space-sm: 0.5rem;
	--space-md: 1rem;
	--space-lg: 1.5rem;
	--space-xl: 2rem;

	/* トランジション */
	--transition-fast: 0.2s ease;
	--transition-normal: 0.3s ease;
}

/* Windows XP Luna Blue Theme */
[data-theme='xp'] {
	--color-bg: #0078d7;
	--color-bg-secondary: #ece9d8;
	--color-surface: #d6d2c2;
	--color-surface-hover: #e8e4d4;

	--color-neon-pink: #0054e3;
	--color-neon-blue: #316ac5;
	--color-neon-green: #37b337;
	--color-neon-yellow: #ebb214;
	--color-neon-orange: #ff8c00;
	--color-neon-purple: #7a96df;

	--color-gold: #ebb214;
	--color-silver: #c0c0c0;

	--color-text: #000000;
	--color-text-muted: #544e3f;

	/* グロー効果を無効化 */
	--glow-pink: none;
	--glow-blue: none;
	--glow-green: none;
	--glow-gold: none;

	/* フォント */
	--font-main: 'Tahoma', 'Segoe UI', 'Verdana', sans-serif;
	--font-display: 'Trebuchet MS', 'Tahoma', sans-serif;

	--radius: 3px;

	/* XP 固有変数 */
	--color-window: #ffffff;
	--color-button-face: #ece9d8;
	--color-button-highlight: #ffffff;
	--color-button-shadow: #aca899;
	--color-button-dk-shadow: #716f64;
	--color-titlebar-start: #0054e3;
	--color-titlebar-end: #4e98ff;
	--color-input-border: #7f9db9;
	--shadow-window: 2px 2px 6px rgba(0, 0, 0, 0.3);
	--radius-window: 8px;
}
```

**Step 2: Commit**

```bash
git add src/lib/styles/tokens.css
git commit -m "refactor: extract CSS design tokens to tokens.css"
```

---

### Task 2: reset.css を作成

**Files:**
- Create: `src/lib/styles/reset.css`

**Step 1: ファイルを作成**

`theme.css` の行87-103（リセット + body）を `reset.css` に移動。

```css
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

[data-theme='xp'] body {
	font-size: 11px;
}
```

**Step 2: Commit**

```bash
git add src/lib/styles/reset.css
git commit -m "refactor: extract base reset styles to reset.css"
```

---

### Task 3: components.css を作成

**Files:**
- Create: `src/lib/styles/components.css`

**Step 1: ファイルを作成**

`theme.css` の行105-305（テキストユーティリティ、ボタン、インプット、XPウィンドウ）を `components.css` に移動。内容はそのまま。

```css
/* ========================================
   Neon Text Utilities
   ======================================== */
.neon-text {
	text-shadow: var(--glow-pink);
}

.neon-text-blue {
	text-shadow: var(--glow-blue);
}

[data-theme='xp'] .neon-text {
	color: var(--color-neon-pink);
	text-shadow: none;
	font-family: var(--font-display);
	font-weight: bold;
}

[data-theme='xp'] .neon-text-blue {
	color: var(--color-neon-blue);
	text-shadow: none;
}

/* ========================================
   Neon Button
   ======================================== */
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
	transition: all var(--transition-normal);
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

/* XP Button Override */
[data-theme='xp'] .btn-neon {
	background: linear-gradient(180deg, #ffffff 0%, #ece9d8 90%, #d6d2c2 100%);
	border: 1px solid var(--color-button-dk-shadow);
	color: var(--color-text);
	border-radius: 3px;
	text-transform: none;
	letter-spacing: normal;
	box-shadow:
		inset 1px 1px 0 var(--color-button-highlight),
		inset -1px -1px 0 var(--color-button-shadow);
}

[data-theme='xp'] .btn-neon:hover {
	background: linear-gradient(180deg, #fff4cf 0%, #ffd870 100%);
	color: var(--color-text);
	box-shadow:
		inset 1px 1px 0 var(--color-button-highlight),
		inset -1px -1px 0 var(--color-button-shadow);
}

[data-theme='xp'] .btn-neon:active {
	background: linear-gradient(180deg, #d6d2c2 0%, #ece9d8 100%);
	box-shadow:
		inset 1px 1px 0 var(--color-button-shadow),
		inset -1px -1px 0 var(--color-button-highlight);
}

[data-theme='xp'] .btn-neon:disabled {
	color: var(--color-button-shadow);
	opacity: 1;
}

[data-theme='xp'] .btn-neon--blue,
[data-theme='xp'] .btn-neon--green {
	border-color: var(--color-button-dk-shadow);
	color: var(--color-text);
}

[data-theme='xp'] .btn-neon--blue:hover,
[data-theme='xp'] .btn-neon--green:hover {
	background: linear-gradient(180deg, #fff4cf 0%, #ffd870 100%);
	color: var(--color-text);
	box-shadow:
		inset 1px 1px 0 var(--color-button-highlight),
		inset -1px -1px 0 var(--color-button-shadow);
}

/* ========================================
   Neon Input
   ======================================== */
.input-neon {
	background: var(--color-bg-secondary);
	border: 2px solid var(--color-surface);
	color: var(--color-text);
	padding: 12px 16px;
	font-size: 1rem;
	border-radius: var(--radius);
	outline: none;
	transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
	width: 100%;
}

.input-neon:focus {
	border-color: var(--color-neon-blue);
	box-shadow: var(--glow-blue);
}

/* XP Input Override */
[data-theme='xp'] .input-neon {
	background: #ffffff;
	border: 1px solid var(--color-input-border);
	color: var(--color-text);
	border-radius: 0;
}

[data-theme='xp'] .input-neon:focus {
	border-color: var(--color-neon-blue);
	box-shadow: none;
}

/* ========================================
   XP Window Components
   (Neon: transparent wrappers / XP: window frame)
   ======================================== */

.xp-titlebar {
	/* Neon mode: acts as centered title heading */
	text-align: center;
	margin-bottom: var(--space-sm);
	font-size: 1.5rem;
}

/* XP mode: full window frame */
[data-theme='xp'] .xp-window {
	background: var(--color-button-face);
	border: 2px solid var(--color-button-dk-shadow);
	border-radius: var(--radius-window);
	box-shadow: var(--shadow-window);
	overflow: hidden;
}

[data-theme='xp'] .xp-titlebar {
	background: linear-gradient(180deg, var(--color-titlebar-start), var(--color-titlebar-end));
	color: #ffffff;
	font-family: var(--font-display);
	font-weight: bold;
	font-size: 13px;
	padding: 6px 10px;
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
	text-align: left;
	margin-bottom: 0;
	border-radius: 0;
}

[data-theme='xp'] .xp-titlebar .neon-text,
[data-theme='xp'] .xp-titlebar .neon-text-blue {
	color: #ffffff;
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
}

[data-theme='xp'] .xp-window-body {
	padding: 12px;
	background: var(--color-button-face);
}
```

Note: `.btn-neon` の `transition: all 0.3s ease` を `transition: all var(--transition-normal)` に、`.input-neon` の `transition` も同様にトークンに置換。`.xp-titlebar` の `margin-bottom: 0.5rem` を `var(--space-sm)` に置換。

**Step 2: Commit**

```bash
git add src/lib/styles/components.css
git commit -m "refactor: extract component styles to components.css"
```

---

### Task 4: animations.css を作成

**Files:**
- Create: `src/lib/styles/animations.css`

**Step 1: ファイルを作成**

`theme.css` の行309-413（keyframes + アニメーションユーティリティ + XPオーバーライド）を `animations.css` に移動。

```css
/* ========================================
   Keyframes
   ======================================== */
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

	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.7;
	}
}

@keyframes rainbow-border {
	0% {
		border-color: var(--color-neon-pink);
	}

	25% {
		border-color: var(--color-neon-blue);
	}

	50% {
		border-color: var(--color-neon-green);
	}

	75% {
		border-color: var(--color-neon-yellow);
	}

	100% {
		border-color: var(--color-neon-pink);
	}
}

@keyframes float {

	0%,
	100% {
		transform: translateY(0px);
	}

	50% {
		transform: translateY(-10px);
	}
}

@keyframes sparkle {

	0%,
	100% {
		opacity: 0;
		transform: scale(0);
	}

	50% {
		opacity: 1;
		transform: scale(1);
	}
}

/* ========================================
   Animation Utilities
   ======================================== */
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

/* XP Animation Overrides */
[data-theme='xp'] .animate-pulse {
	animation: neon-pulse 3s ease-in-out infinite;
}

[data-theme='xp'] .animate-rainbow {
	animation: none;
}

[data-theme='xp'] .animate-float {
	animation: none;
}
```

**Step 2: Commit**

```bash
git add src/lib/styles/animations.css
git commit -m "refactor: extract animations to animations.css"
```

---

### Task 5: responsive.css を作成

**Files:**
- Create: `src/lib/styles/responsive.css`

**Step 1: ファイルを作成**

`theme.css` の行418-423（メディアクエリ）を `responsive.css` に移動。

```css
@media (max-width: 768px) {
	:root {
		--card-width: 60px;
		--card-height: 90px;
	}
}
```

**Step 2: Commit**

```bash
git add src/lib/styles/responsive.css
git commit -m "refactor: extract responsive styles to responsive.css"
```

---

### Task 6: index.css を作成し、app.css と theme.css を更新

**Files:**
- Create: `src/lib/styles/index.css`
- Modify: `src/app.css`
- Delete: `src/lib/styles/theme.css`

**Step 1: index.css を作成**

```css
@import './tokens.css';
@import './reset.css';
@import './components.css';
@import './animations.css';
@import './responsive.css';
```

**Step 2: app.css の import 先を変更**

```css
@import './lib/styles/index.css';
```

**Step 3: theme.css を削除**

```bash
rm src/lib/styles/theme.css
```

**Step 4: Commit**

```bash
git add src/lib/styles/index.css src/app.css
git rm src/lib/styles/theme.css
git commit -m "refactor: replace theme.css with modular CSS imports"
```

---

### Task 7: ビルド検証

**Step 1: TypeScript チェック**

Run: `npm run check`
Expected: エラーなし

**Step 2: ビルド**

Run: `npm run build`
Expected: エラーなし

**Step 3: dev サーバーで目視確認**

Run: `npm run dev`
- Neon テーマの表示を確認
- XP テーマに切り替えて表示を確認
- ボタン、インプット、カード、アニメーションが正常に動作することを確認

**Step 4: Commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: resolve any CSS import issues"
```
