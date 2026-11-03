tree editor by solid
## Vim モード

ツールバーの **Vim** ボタンから有効化できます（設定はブラウザの localStorage に保存）。
同じダイアログに vimrc を貼り付けて保存すると、即時に反映されます。

対応している vimrc の記述:

- キーマップ: `map` / `nmap` / `vmap` / `imap` / `omap` と各 `noremap`、`unmap`、`mapclear`（`xmap` は `vmap` として扱う）
- `set` / `setlocal` / `setglobal`（エミュレーションが持つオプションのみ）
- `let mapleader = " "` と `<leader>`
- コメント行（`"` 始まり）と継続行（`\` 始まり）

プラグイン・関数・`autocmd`・`syntax` など Vim script 本体は動作しません。未対応の行はダイアログ内に一覧表示されます。
