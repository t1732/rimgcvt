# AGENTS.md

## プロジェクト概要

**rimgcvt** は、Tauri v2、React 19、TypeScript、Viteで構築された画像変換アプリケーションです。テーマ選択、出力パス設定、ファイル名プレフィックス、競合解決戦略などのカスタマイズ可能な設定を備えた、画像ファイル変換用のデスクトップインターフェースを提供します。

## 技術スタック

### フロントエンド
- **フレームワーク**: React 19.1.0
- **言語**: TypeScript 5.8.3
- **ビルドツール**: Vite 7.0.4
- **スタイリング**: Tailwind CSS 4.1.18 with @tailwindcss/vite
- **UIコンポーネント**: shadcn/ui (Radix UIプリミティブ)
- **アイコン**: lucide-react 0.563.0

### バックエンド
- **デスクトップフレームワーク**: Tauri v2
- **言語**: Rust (edition 2021)
- **プラグイン**: tauri-plugin-opener, tauri-plugin-dialog

### 開発ツール
- **リンター/フォーマッター**: Biome 2.3.13
- **パッケージマネージャー**: Bun (mise.tomlで設定)。ツールの実行には `npx` ではなく `bunx` を使用してください。

## プロジェクト構造

```
rimgcvt/
├── src/                          # フロントエンドソースコード
│   ├── components/               # Reactコンポーネント
│   │   ├── ui/                   # shadcn/uiコンポーネント（10個）
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── tooltip.tsx
│   │   ├── AppSidebar.tsx        # アプリケーションナビゲーションサイドバー
│   │   ├── DropZone.tsx          # ドラッグ&ドロップファイルアップロードコンポーネント
│   │   ├── FileItem.tsx          # サムネイル付きファイルリストアイテム
│   │   └── Header.tsx            # アプリケーションヘッダー
│   ├── contexts/                 # React Contextプロバイダー
│   │   ├── SettingsContext.tsx   # 設定の状態管理
│   │   └── ThemeProvider.tsx     # テーマ管理（light/dark/system）
│   ├── pages/                    # ページコンポーネント
│   │   ├── HomePage.tsx          # メイン変換インターフェース
│   │   └── SettingsPage.tsx      # 設定画面
│   ├── lib/                      # ユーティリティ関数
│   │   └── utils.ts              # ユーティリティヘルパー（cnなど）
│   ├── hooks/                    # カスタムReactフック
│   ├── assets/                   # 静的アセット
│   ├── App.tsx                   # ルートアプリケーションコンポーネント
│   ├── main.tsx                  # アプリケーションエントリーポイント
│   └── index.css                 # グローバルスタイルとTailwind設定
├── src-tauri/                    # Tauriバックエンド（Rust）
│   ├── src/
│   │   ├── lib.rs                # メインTauriライブラリ
│   │   └── main.rs               # アプリケーションエントリーポイント
│   ├── Cargo.toml                # Rust依存関係
│   ├── tauri.conf.json           # Tauri設定
│   ├── build.rs                  # ビルドスクリプト
│   ├── capabilities/             # Tauri capabilities設定
│   └── icons/                    # アプリケーションアイコン
├── public/                       # 公開静的アセット
├── dist/                         # ビルド出力
├── package.json                  # Node.js依存関係とスクリプト
├── tsconfig.json                 # TypeScript設定
├── vite.config.ts                # Vite設定
├── biome.json                    # Biomeリンター/フォーマッター設定
├── components.json               # shadcn/ui設定
├── Dockerfile                    # Dockerコンテナ設定
├── compose.yml                   # Docker Compose設定
└── mise.toml                     # 開発環境設定
```

## コア機能

### 1. ファイルアップロード & 管理
- **DropZoneコンポーネント** (`src/components/DropZone.tsx`)
  - 画像ファイル用のドラッグ&ドロップインターフェース
  - 手動選択用のファイル入力ボタン
  - 画像ファイルのみを受け入れるフィルター（`image/*`）
  - ドラッグ操作中の視覚的フィードバック
  - 複数ファイル選択のサポート

- **FileItemコンポーネント** (`src/components/FileItem.tsx`)
  - `URL.createObjectURL`を使用したファイルサムネイル表示
  - ファイル名とサイズ（KB単位）の表示
  - アンマウント時のオブジェクトURLの自動クリーンアップ

### 2. 設定管理
- **SettingsContext** (`src/contexts/SettingsContext.tsx`)
  - React Contextを使用した集中型設定状態管理
  - `localStorage`による永続化ストレージ（キー: `rimgcvt-settings`）
  - 設定インターフェース:
    ```typescript
    interface Settings {
      theme: "light" | "dark" | "system"
      outputPath: string
      filePrefix: string
      conflictResolution: "overwrite" | "numbering"
    }
    ```
  - デフォルト値:
    - theme: `"system"`
    - outputPath: `""`
    - filePrefix: `""`
    - conflictResolution: `"numbering"`

- **SettingsPage** (`src/pages/SettingsPage.tsx`)
  - テーマ選択（light/dark/system）
  - 出力パス設定（Tauriフォルダ選択ダイアログ統合済）
  - 変換ファイル用のファイルプレフィックス入力
  - 競合解決戦略（上書き vs. 番号付け）

### 3. テーマシステム
- **ThemeProvider** (`src/contexts/ThemeProvider.tsx`)
  - DOMへのテーマ適用を管理
  - 3つのモードをサポート:
    - `light`: ライトテーマを強制
    - `dark`: ダークテーマを強制
    - `system`: システム設定に従い、自動更新
  - システムテーマ検出に`prefers-color-scheme`メディアクエリを使用
  - `document.documentElement`の`dark`クラスを切り替えてテーマを適用

### 4. ナビゲーション
- **AppSidebar** (`src/components/AppSidebar.tsx`)
  - ホームと設定ページのサイドバーナビゲーション
  - アクティブページのハイライト
  - アプリロゴ付きブランドヘッダー（IMGCVT）

- **Appコンポーネント** (`src/App.tsx`)
  - シンプルなページ切り替えナビゲーション（ルーターなし）
  - ページ状態: `"home" | "settings"`
  - プロバイダー階層:
    ```
    SettingsProvider
      └─ ThemeProvider
           └─ SidebarProvider
                └─ AppSidebar + SidebarInset
    ```

### 5. UIコンポーネント（shadcn/ui）
アプリケーションは10個のshadcn/uiコンポーネントを使用:
- `button` - インタラクティブボタン
- `card` - コンテンツコンテナ
- `input` - テキスト入力フィールド
- `label` - フォームラベル
- `radio-group` - ラジオボタングループ
- `separator` - 視覚的な区切り線
- `sheet` - モーダルシート
- `sidebar` - ナビゲーションサイドバー
- `skeleton` - ローディングプレースホルダー
- `tooltip` - ホバーツールチップ

## 状態管理

### Contextプロバイダー
1. **SettingsProvider**
   - アプリケーション設定を管理
   - `settings`オブジェクトと`updateSettings`関数を提供
   - 更新ごとにlocalStorageに永続化

2. **ThemeProvider**
   - 設定に基づいてテーマを適用
   - "system"モード時にシステムテーマの変更をリッスン
   - 公開されたコンテキストなし（実装の詳細）

### ローカル状態
- **HomePage**: `selectedFiles` - 選択されたFileオブジェクトの配列
- **DropZone**: `isDragging` - ドラッグ操作の状態
- **FileItem**: `thumbnail` - ファイルプレビュー用のオブジェクトURL

## Tauri統合

### 現在の実装
- **Rustバックエンド** (`src-tauri/src/lib.rs`)
  - `tauri-plugin-opener`を使用した基本的なTauriセットアップ
  - サンプル`greet`コマンド（フロントエンドでは未使用）
  - macOSプライベートAPI有効化

### 予定されている統合
- フォルダー選択用のファイルダイアログ（tauri-plugin-dialog）
- 画像変換コマンド（未実装）

## 開発スクリプト

```json
{
  "dev": "vite",                    // 開発サーバーの起動
  "build": "tsc && vite build",     // 本番用ビルド
  "preview": "vite preview",        // 本番ビルドのプレビュー
  "tauri": "tauri",                 // Tauri CLIコマンド
  "lint": "biome check",            // リンターの実行
  "lint:apply": "biome check --write" // リンティング問題の自動修正
}
```

## カラースキーム

アプリケーションは"sushi"をプライマリカラーとしたカスタムカラーパレットを使用:
- プライマリアクセント: `sushi-*`（緑系）
- 参照箇所: DropZone、AppSidebar、Header

## 主要な設計パターン

### 1. コンポーネント構成
- 単一責任を持つ小さく焦点を絞ったコンポーネント
- Propsベースの設定
- プレゼンテーショナルコンポーネントとコンテナコンポーネントの分離

### 2. カスタムフック
- `useSettings()` - エラーハンドリング付き設定コンテキストへのアクセス

### 3. 型安全性
- 完全なTypeScriptカバレッジ
- PropsとStateの厳密な型定義
- 型安全なコンテキストコンシューマー

### 4. アクセシビリティ
- セマンティックHTML構造
- Radix UIプリミティブによる適切なARIAラベル
- キーボードナビゲーションのサポート

## 開発ガイドライン

### コンポーネント宣言スタイル

#### アロー関数形式（推奨）
shadcn/uiコンポーネント以外のすべてのコンポーネントは、**アロー関数形式**で作成してください：

```typescript
// ✅ 推奨: アロー関数 + export const
export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  return <div>...</div>;
};
```

#### 通常の関数宣言（非推奨）
以下の形式は使用しないでください：

```typescript
// ❌ 非推奨: function宣言
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return <div>...</div>;
}
```

#### 例外: shadcn/uiコンポーネント
`src/components/ui/`配下のshadcn/uiコンポーネントは、shadcn/uiの規約に従った形式を維持してください。

### コーディング規約

1. **型定義**
   - すべてのPropsにインターフェースを定義
   - `interface`を使用（`type`ではなく）
   - コンポーネント定義の直前に配置

2. **エクスポート**
   - Named exportを使用（`export const`）
   - Default exportは`App.tsx`のみ

3. **ファイル構成**
   ```typescript
   // 1. インポート
   import { useState } from "react";
   import { ExternalComponent } from "external-lib";
   
   // 2. 型定義
   interface MyComponentProps {
     prop1: string;
     prop2: number;
   }
   
   // 3. コンポーネント定義
   export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
     // ロジック
     return <div>...</div>;
   };
   ```

4. **命名規則**
   - コンポーネント: PascalCase（`DropZone`, `FileItem`）
   - Props型: `{ComponentName}Props`
   - フック: `use{Name}`（camelCase）
   - ユーティリティ関数: camelCase

5. **ツールの実行**
   - パッケージの実行には `npx` ではなく `bunx` を使用してください。

## 現在の制限事項 & TODO

1. **ファイル変換**: 実際の画像変換ロジックはまだ実装されていません
2. **ファイル操作**: ファイルシステム操作が実装されていません
3. **エラーハンドリング**: ファイル操作の最小限のエラーハンドリング
4. **バリデーション**: 設定の入力検証なし
5. **テスト**: テストスイートが設定されていません

## ファイル命名規則

- **コンポーネント**: PascalCaseで`.tsx`拡張子（例: `DropZone.tsx`）
- **コンテキスト**: PascalCaseで`Context`または`Provider`サフィックス
- **ページ**: PascalCaseで`Page`サフィックス
- **ユーティリティ**: camelCaseで`.ts`拡張子
- **UIコンポーネント**: kebab-caseで`.tsx`拡張子（shadcn/ui規約）

## インポートエイリアス

```typescript
"@/*" → "src/*"  // tsconfig.jsonとvite.config.tsで設定
```

## ブラウザ互換性

- ES2020+をサポートするモダンブラウザ
- Tauri WebView（プラットフォーム固有）

---

**最終更新日**: 2026-02-11
**バージョン**: 0.1.0
