import { computed, shallowRef } from 'vue'

/** system は OS の配色設定に従う */
export type ThemeMode = 'system' | 'light' | 'dark'

// index.html のインラインスクリプトも同じキーを読んで初回描画前に適用する
export const THEME_KEY = 'tree-editor:theme'

const ORDER: readonly ThemeMode[] = ['system', 'light', 'dark']

const isMode = (v: string | null): v is ThemeMode => ORDER.includes(v as ThemeMode)

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return isMode(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

function write(mode: ThemeMode) {
  try {
    if (mode === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, mode)
  } catch {
    // プライベートモード等で保存できなくても切り替え自体は効かせる
  }
}

/** <html data-theme> に反映する。system のときは属性を外して CSS 側で OS 設定に任せる */
function apply(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'system') delete root.dataset.theme
  else root.dataset.theme = mode
}

/** テーマ（自動 / ライト / ダーク）。localStorage に永続化する */
export function createThemeSettings() {
  const mode = shallowRef(read())
  apply(mode.value)
  const set = (value: ThemeMode) => {
    mode.value = value
    write(value)
    apply(value)
  }
  return {
    mode: computed(() => mode.value),
    set,
    /** 自動 → ライト → ダーク → 自動 の順に切り替える */
    cycle: () => set(ORDER[(ORDER.indexOf(mode.value) + 1) % ORDER.length]),
  }
}

export type ThemeSettings = ReturnType<typeof createThemeSettings>
