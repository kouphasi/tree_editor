<script setup lang="ts" vapor>
import { Compartment, EditorState } from '@codemirror/state'
import { indentLess, indentMore, history, historyKeymap, defaultKeymap } from '@codemirror/commands'
import { EditorView, drawSelection, keymap, placeholder } from '@codemirror/view'
import { indentService, indentUnit } from '@codemirror/language'
import { getCM, vim } from '@replit/codemirror-vim'
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { applyVimrc } from '../lib/vim/apply'
import type { TreeStore } from '../stores/tree'
import type { VimSettings } from '../stores/vim'

const props = defineProps<{ store: TreeStore; vimSettings: VimSettings }>()

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

const host = useTemplateRef<HTMLDivElement>('host')
let view: EditorView | undefined
const vimSlot = new Compartment()
// vim の現在モード（NORMAL / INSERT / VISUAL など）。vim OFF の間は使わない
const vimMode = shallowRef('normal')
let detachModeListener: (() => void) | undefined

/** vim 拡張を作り直すたびに CodeMirror アダプタも作り直されるので、モード変更の購読を張り直す */
function watchVimMode() {
  detachModeListener?.()
  detachModeListener = undefined
  const cm = view && getCM(view)
  if (!cm) return
  const onChange = (e: { mode: string; subMode?: string }) => {
    vimMode.value = e.subMode ? `${e.mode} ${e.subMode === 'linewise' ? 'line' : 'block'}` : e.mode
  }
  cm.on('vim-mode-change', onChange)
  detachModeListener = () => cm.off('vim-mode-change', onChange)
  vimMode.value = cm.state.vim?.insertMode ? 'insert' : cm.state.vim?.visualMode ? 'visual' : 'normal'
}

const countLines = (text: string) => (text ? text.split('\n').length : 0)
const lines = shallowRef(countLines(props.store.text.value))

/** vim モードの切り替えと vimrc の再適用 */
function syncVim(enabled: boolean, vimrc: string) {
  if (!view) return
  view.dispatch({ effects: vimSlot.reconfigure(enabled ? vimExt() : []) })
  if (enabled) applyVimrc(view, vimrc)
  watchVimMode()
}

onMounted(() => {
  view = new EditorView({
    parent: host.value!,
    state: EditorState.create({
      doc: props.store.text.value,
      extensions: [
        // vim は他のキーマップより先に評価させる必要があるため先頭に置く
        vimSlot.of([]),
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
          lines.value = countLines(text)
          props.store.setText(text)
        }),
      ],
    }),
  })
  syncVim(props.vimSettings.enabled.value, props.vimSettings.vimrc.value)
})

onBeforeUnmount(() => {
  detachModeListener?.()
  view?.destroy()
})

// 設定変更のたびに vim の有効/無効と vimrc を反映する
watch(
  () => [props.vimSettings.enabled.value, props.vimSettings.vimrc.value] as const,
  ([enabled, vimrc]) => syncVim(enabled, vimrc),
)
</script>

<template>
  <section class="glass pane editor-pane">
    <div class="pane-header">
      <h2>
        入力
        <span v-if="props.vimSettings.enabled.value" class="vim-mode" :data-mode="vimMode.split(' ')[0]">
          -- {{ vimMode.toUpperCase() }} --
        </span>
      </h2>
      <span class="pane-meta">{{ lines }} 行</span>
    </div>
    <div ref="host" class="editor"></div>
  </section>
</template>
