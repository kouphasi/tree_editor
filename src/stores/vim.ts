import { createSignal } from 'solid-js'

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
  const [enabled, setEnabledSignal] = createSignal(read(KEY_ENABLED) === '1')
  const [vimrc, setVimrcSignal] = createSignal(read(KEY_VIMRC) ?? '')
  return {
    enabled,
    vimrc,
    setEnabled(value: boolean) {
      setEnabledSignal(value)
      write(KEY_ENABLED, value ? '1' : '0')
    },
    setVimrc(value: string) {
      setVimrcSignal(value)
      write(KEY_VIMRC, value)
    },
  }
}

export type VimSettings = ReturnType<typeof createVimSettings>
