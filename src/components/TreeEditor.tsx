import { Compartment, EditorState } from '@codemirror/state'
import { indentLess, indentMore, history, historyKeymap, defaultKeymap } from '@codemirror/commands'
import { EditorView, drawSelection, keymap, placeholder } from '@codemirror/view'
import { indentService, indentUnit } from '@codemirror/language'
import { vim } from '@replit/codemirror-vim'
import { createEffect, createSignal, on, onCleanup, onMount } from 'solid-js'
import { applyVimrc } from '../lib/vim/apply'
import type { TreeStore } from '../stores/tree'
import type { VimSettings } from '../stores/vim'

const INDENT = '\t'

const vimExt = () => vim({ status: true })

const PLACEHOLDER = `例:
src/
  components/
    Button.tsx
    Modal.tsx
  lib/
    tree.ts
  App.tsx
README.md`

function placeholderEl() {
  const el = document.createElement('span')
  el.className = 'editor-placeholder'
  el.textContent = PLACEHOLDER
  return el
}

/** 改行時に現在行のインデントを引き継ぐ。カーソルより前が "/" で終わる行はディレクトリとみなして1段深くする */
const treeIndent = indentService.of((ctx, pos) => {
  const line = ctx.state.doc.lineAt(pos)
  const before = line.text.slice(0, pos - line.from)
  const base = before.match(/^[ \t]*/)![0]
  const columns = ctx.state.doc.sliceString(line.from, line.from + base.length).replace(/\t/g, ' '.repeat(ctx.state.tabSize)).length
  return columns + (before.trimEnd().endsWith('/') ? ctx.state.tabSize : 0)
})

const theme = EditorView.theme({
  '&': { height: '100%', background: 'transparent', color: 'var(--ink)', font: 'var(--font-code)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { font: 'inherit', lineHeight: 'inherit', overflow: 'auto' },
  '.cm-content': { padding: 'var(--pane-pad)', caretColor: 'var(--accent)' },
  '.cm-line': { padding: 0 },
  '.cm-cursor': { borderLeftColor: 'var(--accent)' },
  '.cm-fat-cursor': { background: 'color-mix(in oklch, var(--accent) 70%, transparent) !important', color: 'white !important' },
  '&:not(.cm-focused) .cm-fat-cursor': { background: 'none !important', outline: '1px solid var(--accent)', color: 'inherit !important' },
  '.cm-selectionBackground': { background: 'color-mix(in oklch, var(--accent) 22%, transparent) !important' },
  '.cm-panels': { background: 'transparent', color: 'var(--ink-2)', font: '500 12px var(--font-mono)' },
  '.cm-panels-bottom': { borderTop: '1px solid rgba(16, 19, 26, 0.08)' },
  '.cm-vim-panel': { padding: '4px 24px' },
  '.cm-vim-panel input': { background: 'transparent', color: 'inherit', font: 'inherit', border: 'none', outline: 'none' },
})

export function TreeEditor(props: { store: TreeStore; vimSettings: VimSettings }) {
  let host!: HTMLDivElement
  let view: EditorView | undefined
  const vimSlot = new Compartment()
  const [lines, setLines] = createSignal(0)

  const countLines = (text: string) => (text ? text.split('\n').length : 0)

  onMount(() => {
    const initial = props.store.text()
    setLines(countLines(initial))
    view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: initial,
        extensions: [
          // vim は他のキーマップより先に評価させる必要があるため先頭に置く
          vimSlot.of(props.vimSettings.enabled() ? vimExt() : []),
          history(),
          drawSelection(),
          EditorState.tabSize.of(4),
          indentUnit.of(INDENT),
          treeIndent,
          placeholder(placeholderEl()),
          keymap.of([
            { key: 'Tab', run: indentMore, shift: indentLess },
            ...historyKeymap,
            ...defaultKeymap,
          ]),
          theme,
          EditorView.updateListener.of((u) => {
            if (!u.docChanged) return
            const text = u.state.doc.toString()
            setLines(countLines(text))
            props.store.setText(text)
          }),
        ],
      }),
    })
  })

  onCleanup(() => view?.destroy())

  // vim モードの切り替え。マウント直後（view 作成後）にも実行され、以降は設定変更のたびに vimrc を再適用する
  createEffect(
    on(
      () => [props.vimSettings.enabled(), props.vimSettings.vimrc()] as const,
      ([enabled, vimrc]) => {
        if (!view) return
        view.dispatch({ effects: vimSlot.reconfigure(enabled ? vimExt() : []) })
        if (enabled) applyVimrc(view, vimrc)
      },
    ),
  )

  return (
    <section class="glass pane editor-pane">
      <div class="pane-header">
        <h2>入力{props.vimSettings.enabled() ? ' · VIM' : ''}</h2>
        <span class="pane-meta">{lines()} 行</span>
      </div>
      <div class="editor" ref={host} />
    </section>
  )
}
