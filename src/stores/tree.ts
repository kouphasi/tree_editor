import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { parseTree } from '../domain/tree/parser'
import { textFromHash } from '../lib/url-state/decode'
import { toHash } from '../lib/url-state/encode'

export function createTreeStore() {
  const [text, setText] = createSignal(textFromHash(location.hash))
  const tree = createMemo(() => parseTree(text()))

  // テキスト変更のたびにURL hashを更新（履歴は増やさない）。replaceState の連続呼び出しを避けるため間引く
  createEffect(() => {
    const hash = toHash(text())
    const timer = setTimeout(() => history.replaceState(null, '', hash || location.pathname + location.search), 300)
    onCleanup(() => clearTimeout(timer))
  })

  return { text, setText, tree }
}

export type TreeStore = ReturnType<typeof createTreeStore>
