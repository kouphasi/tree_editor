import { computed, shallowRef, watchSyncEffect } from 'vue'
import { parseTree } from '../domain/tree/parser'
import { textFromHash } from '../lib/url-state/decode'
import { toHash } from '../lib/url-state/encode'

export function createTreeStore() {
  const text = shallowRef(textFromHash(location.hash))
  const tree = computed(() => parseTree(text.value))

  // テキスト変更のたびにURL hashを更新（履歴は増やさない）。replaceState の連続呼び出しを避けるため間引く
  watchSyncEffect((onCleanup) => {
    const hash = toHash(text.value)
    const timer = setTimeout(() => history.replaceState(null, '', hash || location.pathname + location.search), 300)
    onCleanup(() => clearTimeout(timer))
  })

  return {
    text: computed(() => text.value),
    tree,
    setText(value: string) {
      text.value = value
    },
  }
}

export type TreeStore = ReturnType<typeof createTreeStore>
