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

/** 選択範囲を含む行全体をインデント / アンインデントする */
function shiftLines(el: HTMLTextAreaElement, outdent: boolean) {
  const { value, selectionStart: start, selectionEnd: end } = el
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEnd = end > start && value[end - 1] === '\n' ? end - 1 : end
  const lines = value.slice(lineStart, lineEnd).split('\n')

  let firstDelta = 0
  const shifted = lines.map((line, i) => {
    if (!outdent) {
      if (i === 0) firstDelta = INDENT.length
      return INDENT + line
    }
    const removed = line.match(/^( {1,2}|\t)/)?.[0].length ?? 0
    if (i === 0) firstDelta = -removed
    return line.slice(removed)
  })
  const replaced = shifted.join('\n')

  el.setSelectionRange(lineStart, lineEnd)
  insertText(el, replaced)
  if (start === end) {
    const caret = Math.max(lineStart, start + firstDelta)
    el.setSelectionRange(caret, caret)
  } else {
    el.setSelectionRange(lineStart, lineStart + replaced.length)
  }
}

export function TreeEditor(props: { store: TreeStore }) {
  const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    const el = e.currentTarget
    if (e.isComposing) return
    if (e.key === 'Tab') {
      e.preventDefault()
      shiftLines(el, e.shiftKey)
    } else if (e.key === 'Enter' && !e.shiftKey && el.selectionStart === el.selectionEnd) {
      // 改行時に現在行のインデントを引き継ぐ。行末が "/" ならディレクトリとみなして1段深くする
      const { value, selectionStart: pos } = el
      const line = value.slice(value.lastIndexOf('\n', pos - 1) + 1, pos)
      const indent = line.match(/^[ \t]*/)![0]
      e.preventDefault()
      insertText(el, '\n' + indent + (line.trimEnd().endsWith('/') ? INDENT : ''))
    }
  }

  return (
    <section class="pane editor-pane">
      <h2>Tree Editor</h2>
      <p class="muted">
        インデントで階層を表します。子を持つ行・末尾が <code>/</code> の行はディレクトリになります。
        Tab / Shift+Tab でインデント操作できます。
      </p>
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
