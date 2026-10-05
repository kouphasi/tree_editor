import { createSignal } from 'solid-js'

export function Toolbar(props: { text: string }) {
  const [copied, setCopied] = createSignal(false)
  const copy = async () => {
    await navigator.clipboard.writeText(props.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <footer class="toolbar">
      <button onClick={copy}>{copied() ? 'Copied!' : 'Copy'}</button>
    </footer>
  )
}
