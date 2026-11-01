import { getCM, Vim } from '@replit/codemirror-vim'
import type { EditorView } from '@codemirror/view'
import { parseVimrc } from './vimrc'

/**
 * vimrc をエミュレーションに適用し、失敗したコマンドの一覧を返す。
 * Vim のマップ・オプションはグローバルなので、再適用時は先にユーザー定義マップを消してから登録し直す。
 */
export function applyVimrc(view: EditorView, source: string): string[] {
  const cm = getCM(view)
  if (!cm) return []
  Vim.mapclear()
  const parsed = parseVimrc(source)
  // 既定で割り当てのあるキー（<Space> や , など）を leader にすると、完全一致が優先されて
  // <leader>x のような複数キーのマップに到達できない。leader キー自体の既定割り当てを外しておく
  if (parsed.leaderKey) {
    // 既定の割り当ては context を持つもの（normal 等）と持たないもの（<Space> など全モード共通）がある
    for (const ctx of ['normal', 'visual', undefined]) Vim.unmap(parsed.leaderKey, ctx as string)
  }
  const failed: string[] = []
  for (const command of parsed.commands) {
    try {
      Vim.handleEx(cm as Parameters<typeof Vim.handleEx>[0], command)
    } catch (e) {
      failed.push(`${command}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return failed
}
