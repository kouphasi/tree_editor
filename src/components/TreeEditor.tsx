import type { TreeStore } from '../stores/tree'

const INDENT = '  '

const PLACEHOLDER = `例:
src/
  components/
    Button.tsx
    Modal.tsx
  lib/
    tree.ts
  App.tsx
README.md`

/** undo 履歴を保ったままテキストを差し替える（execCommand 非対応環境では setRangeText にフォールバック） */
function insertText(el: HTMLTextAreaElement, text: string) {
  if (!document.execCommand('insertText', false, text)) {
    el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end')
  }
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

export function TreeEditor(props: { store: TreeStore }) {
  const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    const el = e.currentTarget
    if (e.isComposing) return
    if (e.key === 'Enter' && !e.shiftKey && el.selectionStart === el.selectionEnd) {
      // 改行時に現在行のインデントを引き継ぐ。行末が "/" ならディレクトリとみなして1段深くする
      const { value, selectionStart: pos } = el
      const line = value.slice(value.lastIndexOf('\n', pos - 1) + 1, pos)
      const indent = line.match(/^[ \t]*/)![0]
      e.preventDefault()
      insertText(el, '\n' + indent + (line.trimEnd().endsWith('/') ? INDENT : ''))
    }
  }

  const lineCount = () => {
    const t = props.store.text()
    return t ? t.split('\n').length : 0
  }

  return (
    <section class="glass pane editor-pane">
      <div class="pane-header">
        <h2>入力</h2>
        <span class="pane-meta">{lineCount()} 行</span>
      </div>
      <textarea
        class="editor"
        value={props.store.text()}
        onInput={(e) => props.store.setText(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        placeholder={PLACEHOLDER}
        spellcheck={false}
        autocapitalize="off"
        autocomplete="off"
      />
    </section>
  )
}
