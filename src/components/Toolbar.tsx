import { createSignal, Show } from 'solid-js'
import type { VimSettings } from '../stores/vim'
import { VimSettingsDialog } from './VimSettings'

/** クリップボードにコピーし、一定時間だけ完了表示を返す */
function createCopy() {
  const [copied, setCopied] = createSignal(false)
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return [copied, copy] as const
}

export function Toolbar(props: { text: string; vimSettings: VimSettings }) {
  const [vimOpen, setVimOpen] = createSignal(false)
  const [copied, copy] = createCopy()
  const [linkCopied, copyLink] = createCopy()
  return (
    <header class="toolbar">
      <div class="glass toolbar-pill">
        <span class="logo" aria-hidden="true">└──</span>
        <h1>Directory Tree Editor</h1>
        <button class="btn" classList={{ 'is-on': props.vimSettings.enabled() }} onClick={() => setVimOpen(true)}>
          Vim{props.vimSettings.enabled() ? ' ON' : ''}
        </button>
        <button class="btn" onClick={() => copyLink(location.href)}>
          {linkCopied() ? 'コピーしました' : 'リンクをコピー'}
        </button>
        <button class="btn btn-primary" onClick={() => copy(props.text)}>
          {copied() ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <Show when={vimOpen()}>
        <VimSettingsDialog settings={props.vimSettings} onClose={() => setVimOpen(false)} />
      </Show>
    </header>
  )
}
