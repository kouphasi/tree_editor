tree editor by Vue 3.6 (Vapor Mode)

## 開発スタック

- Vue 3.6 (RC) の Vapor Mode — 全コンポーネントを `<script setup vapor>` で書き、`createVaporApp` でマウント（仮想 DOM ランタイムを使わない）
- [Vize](https://github.com/ubugeeei-prod/vize) — `.vue` のコンパイル（`@vizejs/vite-plugin`）と lint（`npm run lint`）
- TypeScript 7.1 (native) — Vize の Content Mapper で `.vue` も含めて型チェック（`npm run typecheck`）

## Vim モード

ツールバーの **Vim** ボタンから有効化できます（設定はブラウザの localStorage に保存）。
同じダイアログに vimrc を貼り付けて保存すると、即時に反映されます。

対応している vimrc の記述:

- キーマップ: `map` / `nmap` / `vmap` / `imap` / `omap` と各 `noremap`、`unmap`、`mapclear`（`xmap` は `vmap` として扱う）
- `set` / `setlocal` / `setglobal`（エミュレーションが持つオプションのみ）
- `let mapleader = " "` と `<leader>`
- コメント行（`"` 始まり）と継続行（`\` 始まり）

プラグイン・関数・`autocmd`・`syntax` など Vim script 本体は動作しません。未対応の行はダイアログ内に一覧表示されます。
