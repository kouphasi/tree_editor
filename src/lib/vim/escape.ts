/** Esc 判定に必要な vim 状態だけを抜き出した型（@replit/codemirror-vim の vimState のサブセット） */
export interface VimEscState {
  insertMode: boolean
  visualMode: boolean
  inputState?: {
    operator?: string | null
    prefixRepeat?: string[]
    motionRepeat?: string[]
    keyBuffer?: string[]
    registerName?: string | null
  }
}

/**
 * ノーマルモードで、かつ入力途中のコマンド（`d` や `2` や `"a` など）が無い状態か。
 * この状態で Esc が押されたときだけエディタからフォーカスを外す。
 * INSERT / VISUAL やコマンド入力途中の Esc は vim 側に処理させてノーマルモードへ戻す。
 */
export function isIdleNormalMode(vim: VimEscState | undefined | null): boolean {
  if (!vim || vim.insertMode || vim.visualMode) return false
  const s = vim.inputState
  if (!s) return true
  return !s.operator && !s.prefixRepeat?.length && !s.motionRepeat?.length && !s.keyBuffer?.length && !s.registerName
}
