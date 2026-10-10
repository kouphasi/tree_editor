import { createSignal } from 'solid-js'

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

export function Toolbar(props: { text: string }) {
  const [copied, copy] = createCopy()
  const [linkCopied, copyLink] = createCopy()
  return (
    <header class="toolbar">
      <div class="glass toolbar-pill">
        <span class="logo" aria-hidden="true">└──</span>
        <h1>Directory Tree Editor</h1>
        <button class="btn" onClick={() => copyLink(location.href)}>
          {linkCopied() ? 'コピーしました' : 'リンクをコピー'}
        </button>
        <button class="btn btn-primary" onClick={() => copy(props.text)}>
          {copied() ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </header>
  )
}
