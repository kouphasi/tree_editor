import { createMemo, createSignal, For, Show } from 'solid-js'
import { parseVimrc } from '../lib/vim/vimrc'
import type { VimSettings as Settings } from '../stores/vim'

const SAMPLE = `" 例
let mapleader = " "
inoremap jk <Esc>
nnoremap <leader>w :w<CR>
nnoremap H ^
nnoremap L $
set ignorecase smartcase`

export function VimSettingsDialog(props: { settings: Settings; onClose: () => void }) {
  const [enabled, setEnabled] = createSignal(props.settings.enabled())
  const [draft, setDraft] = createSignal(props.settings.vimrc())
  const parsed = createMemo(() => parseVimrc(draft()))

  const save = () => {
    props.settings.setVimrc(draft())
    props.settings.setEnabled(enabled())
    props.onClose()
  }

  return (
    <div class="modal-backdrop" onClick={(e) => e.target === e.currentTarget && props.onClose()}>
      <div class="glass modal" role="dialog" aria-modal="true" aria-labelledby="vim-title"
        onKeyDown={(e) => e.key === 'Escape' && props.onClose()}>
        <h2 id="vim-title">Vim 設定</h2>
        <label class="check">
          <input type="checkbox" checked={enabled()} onChange={(e) => setEnabled(e.currentTarget.checked)} />
          Vim モードを有効にする
        </label>
        <label class="field">
          <span>vimrc</span>
          <textarea
            class="vimrc-input"
            value={draft()}
            onInput={(e) => setDraft(e.currentTarget.value)}
            placeholder={SAMPLE}
            spellcheck={false}
            autocapitalize="off"
            autocomplete="off"
          />
        </label>
        <p class="modal-note">
          対応: <code>map</code> 系 / <code>set</code> / <code>let mapleader</code>。ブラウザに保存され、保存時に即時反映されます。
        </p>
        <Show when={parsed().skipped.length > 0}>
          <details class="skipped">
            <summary>未対応のため無視される行: {parsed().skipped.length} 件</summary>
            <ul>
              <For each={parsed().skipped}>
                {(s) => (
                  <li>
                    <code>{s.line}: {s.text}</code> — {s.reason}
                  </li>
                )}
              </For>
            </ul>
          </details>
        </Show>
        <div class="modal-actions">
          <button class="btn" onClick={props.onClose}>キャンセル</button>
          <button class="btn btn-primary" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  )
}
