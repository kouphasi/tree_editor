import { computed, shallowRef } from 'vue'

const KEY_ENABLED = 'tree-editor:vim'
const KEY_VIMRC = 'tree-editor:vimrc'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // プライベートモード等で保存できなくても動作は継続する
  }
}

/** vim モードの ON/OFF と vimrc 本文。localStorage に永続化する */
export function createVimSettings() {
  const enabled = shallowRef(read(KEY_ENABLED) === '1')
  const vimrc = shallowRef(read(KEY_VIMRC) ?? '')
  return {
    enabled: computed(() => enabled.value),
    vimrc: computed(() => vimrc.value),
    setEnabled(value: boolean) {
      enabled.value = value
      write(KEY_ENABLED, value ? '1' : '0')
    },
    setVimrc(value: string) {
      vimrc.value = value
      write(KEY_VIMRC, value)
    },
  }
}

export type VimSettings = ReturnType<typeof createVimSettings>
