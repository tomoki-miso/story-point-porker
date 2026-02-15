# Windows XP Luna テーマ適用 Skill

あなたはWindows XP Luna テーマのデザインエキスパートです。ユーザーの現在のコードベースを分析し、UIコンポーネントにWindows XP の視覚スタイルを適用してください。

## 手順

### Step 1: フレームワーク自動判定

プロジェクトのファイル構成・依存定義を読み取り、対象フレームワークを判定してください:

- `Package.swift` / `.swift` ファイル → **SwiftUI**
- `package.json` + `.tsx` / `.jsx` → **React**
- `package.json` + `.vue` → **Vue**
- `index.html` / `.css` → **HTML+CSS**
- `pubspec.yaml` → **Flutter**
- `*.csproj` + `.xaml` → **WPF/MAUI**

判定結果をユーザーに報告してから作業を開始してください。

### Step 2: サブテーマ選択

引数 `$ARGUMENTS` を確認してください:

- 引数なし or `blue` → **Luna Blue**（デフォルト）
- `olive` or `green` → **Luna Olive Green**
- `silver` → **Luna Silver**

---

## カラーパレット定義

### Luna Blue（デフォルト）

| トークン名 | Hex | 用途 |
|---|---|---|
| ActiveCaption | `#0054E3` | アクティブウィンドウ タイトルバー左端 |
| ActiveCaptionGradient | `#4E98FF` | アクティブウィンドウ タイトルバー右端（グラデーション終点） |
| InactiveCaption | `#7A96DF` | 非アクティブウィンドウ タイトルバー左端 |
| InactiveCaptionGradient | `#C3D4FF` | 非アクティブウィンドウ タイトルバー右端 |
| CaptionText | `#FFFFFF` | タイトルバー文字色 |
| Control | `#ECE9D8` | ウィンドウ背景・ボタン背景 |
| ControlLight | `#F1EFE2` | 3Dベベル ライト面（内側） |
| ControlLightLight | `#FFFFFF` | 3Dベベル ハイライト面（最外） |
| ControlDark | `#ACA899` | 3Dベベル ダーク面（内側） |
| ControlDarkDark | `#716F64` | 3Dベベル シャドウ面（最外） |
| ControlText | `#000000` | ボタン・ラベル文字色 |
| Highlight | `#316AC5` | 選択項目背景 |
| HighlightText | `#FFFFFF` | 選択項目文字色 |
| Window | `#FFFFFF` | テキスト入力欄・リスト背景 |
| WindowText | `#000000` | テキスト入力欄文字色 |
| WindowFrame | `#0054E3` | ウィンドウ外枠 |
| ButtonFace | `#ECE9D8` | ボタンのデフォルト面 |
| ButtonHighlight | `#FFFFFF` | ボタンの3Dハイライト |
| ButtonShadow | `#ACA899` | ボタンの3Dシャドウ |
| GrayText | `#808080` | 無効化テキスト |
| MenuBar | `#ECE9D8` | メニューバー背景 |
| MenuHighlight | `#316AC5` | メニュー選択背景 |
| Scrollbar | `#D6D2C2` | スクロールバー背景 |
| InfoWindow | `#FFFFE1` | ツールチップ背景 |
| InfoText | `#000000` | ツールチップ文字色 |
| Desktop | `#0078D7` | デスクトップ背景（Bliss） |
| StartButtonGreen | `#3C8A2E` | スタートボタン緑 |
| StartButtonGreenLight | `#6FC05C` | スタートボタン緑ハイライト |
| TaskbarBlue | `#245ADB` | タスクバー背景 |
| TaskbarBlueDark | `#1941A5` | タスクバー下端 |
| ProgressGreen | `#37B337` | プログレスバー チャンク |

### Luna Olive Green

| トークン名 | Hex | 用途 |
|---|---|---|
| ActiveCaption | `#8BA169` | タイトルバー左端 |
| ActiveCaptionGradient | `#B7C89A` | タイトルバー右端 |
| InactiveCaption | `#A5B590` | 非アクティブ タイトルバー左端 |
| InactiveCaptionGradient | `#CDD5C1` | 非アクティブ タイトルバー右端 |
| CaptionText | `#FFFFFF` | タイトルバー文字色 |
| Control | `#ECE9D8` | ウィンドウ背景 |
| ControlLight | `#F1EFE2` | ベベル ライト |
| ControlLightLight | `#FFFFFF` | ベベル ハイライト |
| ControlDark | `#ACA899` | ベベル ダーク |
| ControlDarkDark | `#716F64` | ベベル シャドウ |
| Highlight | `#93A070` | 選択背景 |
| HighlightText | `#FFFFFF` | 選択文字色 |
| Window | `#FFFFFF` | 入力欄背景 |
| WindowFrame | `#8BA169` | ウィンドウ外枠 |
| TaskbarOlive | `#7B8B6F` | タスクバー背景 |
| StartButtonGreen | `#6F7D52` | スタートボタン |

### Luna Silver

| トークン名 | Hex | 用途 |
|---|---|---|
| ActiveCaption | `#C0C0C0` | タイトルバー左端 |
| ActiveCaptionGradient | `#DCDCDC` | タイトルバー右端 |
| InactiveCaption | `#C9C9C9` | 非アクティブ タイトルバー左端 |
| InactiveCaptionGradient | `#E8E8E8` | 非アクティブ タイトルバー右端 |
| CaptionText | `#1E395B` | タイトルバー文字色 |
| Control | `#E0DFE3` | ウィンドウ背景 |
| ControlLight | `#E8E7EB` | ベベル ライト |
| ControlLightLight | `#FFFFFF` | ベベル ハイライト |
| ControlDark | `#A5A5A5` | ベベル ダーク |
| ControlDarkDark | `#6E6E6E` | ベベル シャドウ |
| Highlight | `#9099A5` | 選択背景 |
| HighlightText | `#FFFFFF` | 選択文字色 |
| Window | `#FFFFFF` | 入力欄背景 |
| WindowFrame | `#C0C0C0` | ウィンドウ外枠 |
| TaskbarSilver | `#C0C0C0` | タスクバー背景 |

---

## タイポグラフィ仕様

| 要素 | フォント | サイズ | ウェイト | 備考 |
|---|---|---|---|---|
| 本文テキスト | Tahoma | 8pt (11px) | Regular (400) | line-height: 15px |
| メニュー項目 | Tahoma | 8pt (11px) | Regular (400) | |
| ボタンラベル | Tahoma | 8pt (11px) | Regular (400) | |
| タイトルバー | Trebuchet MS | 10pt (13px) | Bold (700) | `text-shadow: 1px 1px #0F1089` |
| ツールチップ | Tahoma | 8pt (11px) | Regular (400) | |
| ステータスバー | Tahoma | 8pt (11px) | Regular (400) | |

フォント代替戦略:
- Tahoma が利用できない環境 → `"Tahoma", "Segoe UI", "Verdana", sans-serif`
- Trebuchet MS が利用できない環境 → `"Trebuchet MS", "Lucida Grande", "Lucida Sans", sans-serif`
- SwiftUI の場合 → `.custom("Tahoma", size: 11)` をベースに、フォールバックとして `.system(size: 11)` を使用

---

## UIコンポーネント仕様

### 1. タイトルバー

```
高さ: 28px
角丸: 上部左右 8px（左上 7px）、下部 0px
グラデーション: linear-gradient(180deg, [明るい補助色] 0%, ActiveCaption 6%, ActiveCaptionGradient 94%, [暗い縁色] 100%)
Luna Blue 詳細グラデーション:
  - 0%: #0997FF
  - 6%: #0054E3
  - 50%: #0054E3 → #4E98FF
  - 94%: #4E98FF
  - 100%: #0350C9
テキスト: CaptionText, Trebuchet MS Bold 13px
テキストシャドウ: 1px 1px rgba(15, 16, 137, 0.8)
アイコン: 左端16x16、テキストとの間隔4px
ウィンドウコントロールボタン: 右端に最小化(21x21)・最大化(21x21)・閉じる(21x21)
  閉じるボタン背景: 赤系グラデーション (#C75050 → #E09090)
```

### 2. ウィンドウフレーム

```
枠線幅: 4px（左右・下部）
Luna Blue 枠色: #0054E3（ActiveCaption に連動）
box-shadow（多層、外側→内側）:
  - inset 0 0 0 1px ControlLightLight（最内側白ライン）
外側ドロップシャドウ: 4px 4px 10px rgba(0, 0, 0, 0.35)
背景: Control (#ECE9D8)
ウィンドウ内コンテンツ領域: padding 8px
```

### 3. ボタン

```
サイズ: 最小幅 75px、高さ 23px
背景: linear-gradient(180deg, #FFFFFF 0%, #ECE9D8 86%, #D8D0BE 100%)
枠線: 1px solid #003C74（フォーカス時）/ 1px solid ControlDark（通常時）
角丸: 3px
パディング: 1px 12px

状態:
  hover: 外側glow - box-shadow: 0 0 3px 1px #FFC73C（オレンジ系）
         内側: linear-gradient(180deg, #FFF0CF 0%, #FFD490 100%)
  pressed: 背景反転 - linear-gradient(180deg, #D8D0BE 0%, #ECE9D8 100%)
           内側に1px inset shadow
  focused: 外側glow - box-shadow: 0 0 3px 1px #6FA5DC（ブルー系）
           枠線: 1px solid #003C74
  disabled: 背景 Control, テキスト GrayText
  default（デフォルトボタン）: 枠線 2px solid #003C74, 外側に1pxの追加ボーダー

テキスト: ControlText, Tahoma 11px, text-align center
ニーモニック（アクセスキー）のアンダーライン対応
```

### 4. タスクバー

```
高さ: 30px（画面下端固定）
背景: linear-gradient(180deg, #245ADB 0%, #1941A5 50%, #1941A5 100%)
Luna Blue 詳細:
  - 上端1pxライン: #59ABFF
  - メイン: #245ADB → #1B49B5 → #1941A5

スタートボタン:
  サイズ: 約108x30px
  背景: 緑グラデーション linear-gradient(180deg, #6FC05C 0%, #3C8A2E 50%, #3C8A2E 100%)
  角丸: 上部左 0px、下部左 8px（左下のみ丸い）
  テキスト: "start" 白 Bold Italic, Tahoma
  Windowsロゴ: 左端にフラッグアイコン（緑テーマのボタン上）

クイック起動エリア: スタートボタン右、区切り線あり
タスクボタン: 高さ22px、角丸2px、背景は半透明のハイライト

通知領域（トレイ）: 右端、時計表示、区切り線あり
```

### 5. メニュー・ドロップダウン

```
背景: Window (#FFFFFF)
枠線: 1px solid ControlDark
ドロップシャドウ: 4px 4px 6px rgba(0, 0, 0, 0.25)
アイコン列背景: Control (#ECE9D8), 幅28px
パディング: 項目ごと 2px 6px
項目高さ: 22px

区切り線: 1px solid ControlLight, margin上下 3px
選択項目: 背景 Highlight, テキスト HighlightText
無効項目: テキスト GrayText
チェック済み項目: アイコン列にチェックマーク
サブメニュー矢印: 右端に ▶ (4px幅)
```

### 6. テキストフィールド

```
高さ: 23px
背景: Window (#FFFFFF)
枠線: 1px solid #7F9DB9
角丸: 0px（角丸なし）
パディング: 1px 4px
テキスト: WindowText, Tahoma 11px

focused: 枠線色変化なし（XPではフォーカス枠変化は微妙）
disabled: 背景 Control, テキスト GrayText
readonly: 背景 Control
```

### 7. スクロールバー

```
幅: 17px（縦）/ 高さ: 17px（横）
トラック背景: Scrollbar (#D6D2C2) にチェック柄パターン
つまみ（thumb）: ButtonFace グラデーション、3Dベベル付き
矢印ボタン: 17x17px、3Dベベル、中央に三角矢印
  hover: 明るいハイライト
  pressed: 反転（凹み表現）
最小つまみ長: 17px
```

### 8. プログレスバー

```
高さ: 17px
背景: Window 枠付き（inset border 1px ControlDark）
チャンク: ProgressGreen (#37B337) の角丸矩形ブロック
  チャンク幅: 8px、角丸 2px
  チャンク間ギャップ: 2px
アニメーション: チャンクが左から右へ増加
  不確定状態: 光るハイライトが左右に往復

外枠: 1px solid ControlDark + 1px inset ControlLightLight
```

### 9. タブコントロール

```
タブ（非選択）:
  高さ: 21px
  背景: linear-gradient(180deg, #FFFFFF 0%, Control 100%)
  枠線: 1px solid ControlDark（上・左・右のみ）
  角丸: 上部左右 3px
  テキスト: ControlText, Tahoma 11px

タブ（選択）:
  高さ: 24px（3px高い = パネルに重なる）
  背景: Control（フラット）
  枠線: 1px solid ControlDark（上・左・右のみ）
  下端: パネル背景と同色で枠線を隠す
  角丸: 上部左右 3px

タブパネル:
  枠線: 1px solid ControlDark
  背景: Control
  パディング: 8px
```

### 10. チェックボックス・ラジオボタン

```
チェックボックス:
  サイズ: 13x13px
  枠線: 1px solid ButtonShadow(外側) + 1px solid ControlDarkDark(内側) — 二重枠
  内側ハイライト: 右下に ControlLight + ControlLightLight
  背景（未チェック）: Window (#FFFFFF)
  チェックマーク: ControlText, 太さ2px, パス型 ✓
  disabled: 背景 Control, チェックマーク GrayText

ラジオボタン:
  サイズ: 13x13px（円形）
  枠線: チェックボックスと同じ二重枠構造（円形に適用）
  背景: Window
  選択ドット: ControlText, 直径5px, 中央配置
  disabled: 背景 Control, ドット GrayText

ラベル間隔: チェックボックス/ラジオボタンの右に4pxスペース
```

### 11. ステータスバー

```
高さ: 22px
背景: Control (#ECE9D8)
上部枠線: 1px solid ControlDark
テキスト: ControlText, Tahoma 11px, padding-left 4px
サイズグリップ: 右下に斜線パターン（16x16px）、ControlDark + ControlLightLight の交互ドット
パネル区切り: 1px insetベベル（ControlDark左上、ControlLightLight右下）
```

---

## 視覚効果ルール

### 3Dベベル（標準）

XPスタイルの立体感を出す4層ベベル:

```
外側ハイライト: ControlLightLight (#FFFFFF) — 左辺・上辺
内側ハイライト: ControlLight (#F1EFE2) — 左辺・上辺（1px内側）
内側シャドウ: ControlDark (#ACA899) — 右辺・下辺（1px内側）
外側シャドウ: ControlDarkDark (#716F64) — 右辺・下辺

CSS実装:
  border-top: 1px solid ControlLightLight;
  border-left: 1px solid ControlLightLight;
  border-right: 1px solid ControlDarkDark;
  border-bottom: 1px solid ControlDarkDark;
  box-shadow: inset 1px 1px 0 ControlLight, inset -1px -1px 0 ControlDark;

SwiftUI実装:
  .overlay(
    RoundedRectangle(cornerRadius: 0)
      .stroke(ControlLightLight, lineWidth: 1)
      .padding(0.5)
  )
  + 内側にControlDark のinsetストローク
```

### 凹みベベル（テキスト入力・inset要素）

```
外側: ControlDark（左・上）, ControlLightLight（右・下）
内側: ControlDarkDark（左・上）, ControlLight（右・下）
→ 標準ベベルの色を反転
```

### グラデーション方向規則

```
タイトルバー: 上→下（vertical）＋ 左→右（ActiveCaption → ActiveCaptionGradient）を2軸合成
ボタン: 上→下（vertical）: 白 → ButtonFace → やや暗い
メニューハイライト: フラット塗り（グラデーションなし）
タスクバー: 上→下（vertical）
スタートメニュー: 上→下（vertical）
```

### ドロップシャドウ

```
ウィンドウ: 4px 4px 10px rgba(0, 0, 0, 0.35) — 右下方向
メニュー: 4px 4px 6px rgba(0, 0, 0, 0.25) — 右下方向
ツールチップ: 2px 2px 4px rgba(0, 0, 0, 0.2) — 右下方向
```

### 角丸ルール

```
タイトルバー: 上部左右 8px（アクティブ）/ 7px（非アクティブ）、下部 0px
ボタン: 全角 3px
タブ: 上部左右 3px、下部 0px
スタートボタン: 下部左 8px、その他 0px
スクロールバーつまみ: 0px
テキストフィールド: 0px
プログレスバーチャンク: 2px
それ以外: 0px
```

---

## 実装指示

### 共通ルール

1. **既存UIを破壊しない**: スタイリング（色・フォント・サイズ・ボーダー・シャドウ）のみを変更し、機能やレイアウト構造は維持する
2. **カラー定数を一元管理**: 選択されたサブテーマのカラーパレットを再利用可能な定数/変数として定義する
3. **コンポーネントスタイルを分離**: フレームワークの慣習に従い、スタイル定義を適切に構造化する

### フレームワーク別パターン

#### SwiftUI

```swift
// カラー定数を enum + static let で定義
enum XPColors {
    static let activeCaption = Color(hex: "#0054E3")
    static let control = Color(hex: "#ECE9D8")
    // ... 全トークン
}

// ViewModifier でコンポーネントスタイルを適用
struct XPButtonStyle: ButtonStyle { ... }
struct XPWindowStyle: ViewModifier { ... }
struct XPTextFieldStyle: TextFieldStyle { ... }

// Color(hex:) イニシャライザを extension で追加
extension Color {
    init(hex: String) { ... }
}
```

#### HTML + CSS

```css
/* CSS カスタムプロパティでカラー定義 */
:root {
    --xp-active-caption: #0054E3;
    --xp-control: #ECE9D8;
    /* ... */
}

/* コンポーネントクラス */
.xp-window { ... }
.xp-titlebar { ... }
.xp-button { ... }
```

#### React

```tsx
// テーマオブジェクト + styled-components or CSS Modules
const xpTheme = {
    colors: { activeCaption: '#0054E3', control: '#ECE9D8', ... },
    fonts: { body: '"Tahoma", "Segoe UI", sans-serif', ... }
};

// コンポーネントラッパー or className で適用
```

### 変換手順

1. プロジェクト内の全UIコンポーネントを特定する
2. カラー定数・スタイル定義ファイルを作成する
3. 各コンポーネントにXPスタイルを適用する:
   - 背景色 → Control / Window
   - テキスト色 → ControlText / WindowText
   - ボタン → XPボタンスタイル（グラデーション + ベベル + hover/pressed状態）
   - 入力欄 → XPテキストフィールドスタイル（#7F9DB9 ボーダー）
   - リスト選択 → Highlight / HighlightText
   - ウィンドウ → タイトルバー + フレーム + ドロップシャドウ
4. フォントを Tahoma / Trebuchet MS に設定する
5. 3Dベベル効果を適切な要素に適用する
6. 動作確認のポイントを提示する

### 注意事項

- macOS / iOS の SwiftUI では Tahoma フォントが標準搭載されていないため、バンドルするかシステムフォントでの代替を提案すること
- Web の場合、Tahoma は Windows 環境以外では利用できない可能性があるため、Web Safe フォントスタックを使用すること
- グラデーションやシャドウはプラットフォームのレンダリング差異を考慮すること
- ダークモード対応は行わない（XPはダークモード非対応）
- Retina/HiDPI ディスプレイでは1pxボーダーが細く見えるため、必要に応じて調整を提案すること
