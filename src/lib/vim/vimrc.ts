/**
 * vimrc の解析。Vim script 全体ではなく、ブラウザ上の vim エミュレーションで意味を持つ
 * 「キーマップ」「set オプション」「mapleader」だけを扱い、それ以外は skipped として報告する。
 */

export interface SkippedLine {
  /** 1 始まりの行番号 */
  line: number
  text: string
  reason: string
}

export interface ParsedVimrc {
  /** Vim.handleEx に渡す Ex コマンド（先頭の ":" なし） */
  commands: string[]
  skipped: SkippedLine[]
  /**
   * `<leader>` を含むマップで実際に使われた leader のキー表記（なければ null）。
   * エミュレーション側は既定割り当てのあるキーを先頭に持つ複数キーのマップを解決できないため、
   * 呼び出し側でそのキーの既定割り当てを外す必要がある。
   */
  leaderKey: string | null
}

/** エミュレーション側がそのまま解釈できるコマンド */
const SUPPORTED = new Set([
  'map', 'nmap', 'vmap', 'imap', 'omap',
  'noremap', 'nnoremap', 'vnoremap', 'inoremap', 'onoremap',
  'unmap', 'mapclear', 'nmapclear', 'vmapclear', 'imapclear', 'omapclear',
  'set', 'setlocal', 'setglobal',
])

/** 別名への読み替え（xmap は vmap と同じ選択系モードとして扱う） */
const ALIASES: Record<string, string> = {
  xmap: 'vmap',
  xnoremap: 'vnoremap',
  smap: 'vmap',
  snoremap: 'vnoremap',
  cmap: '',
  cnoremap: '',
}

/** 省略形を正式名へ（vim の最短省略形に対応） */
const SHORT_NAMES: Record<string, string> = {
  im: 'imap', nm: 'nmap', vm: 'vmap', om: 'omap',
  no: 'noremap', nn: 'nnoremap', vn: 'vnoremap', ino: 'inoremap', ono: 'onoremap',
  mapc: 'mapclear', nmapc: 'nmapclear', vmapc: 'vmapclear', imapc: 'imapclear', omapc: 'omapclear',
  se: 'set', setl: 'setlocal', setg: 'setglobal',
  xm: 'xmap', xn: 'xnoremap',
}

/** `let mapleader = ","` の右辺を実際のキー列にする */
function parseLeaderValue(raw: string): string | null {
  const v = raw.trim()
  const quoted = v.match(/^(["'])(.*)\1$/)
  if (!quoted) return null
  const body = quoted[2]
  if (quoted[1] === '"') {
    // ダブルクォート内の "\<Space>" 等のキー表記
    const key = body.match(/^\\(<[^>]+>)$/)
    if (key) return key[1].toLowerCase() === '<space>' ? ' ' : key[1]
    return body.replace(/\\\\/g, '\\')
  }
  return body
}

function leaderKeyName(leader: string): string {
  return leader === ' ' ? '<Space>' : leader
}

/** 行頭が "\" の継続行を前の行に連結する。元の行番号は先頭行のものを使う */
function joinContinuations(source: string): { text: string; line: number }[] {
  const out: { text: string; line: number }[] = []
  source.split(/\r?\n/).forEach((raw, i) => {
    const cont = raw.match(/^\s*\\(.*)$/)
    if (cont && out.length > 0) out[out.length - 1].text += cont[1]
    else out.push({ text: raw, line: i + 1 })
  })
  return out
}

export function parseVimrc(source: string): ParsedVimrc {
  const commands: string[] = []
  const skipped: SkippedLine[] = []
  let leader = '\\'
  let leaderUsed = false

  for (const { text, line } of joinContinuations(source)) {
    // 空行・全行コメント（vimrc では " 始まり）・先頭の ":" を除去
    const trimmed = text.trim().replace(/^:+\s*/, '')
    if (trimmed === '' || trimmed.startsWith('"')) continue

    const skip = (reason: string) => skipped.push({ line, text: text.trim(), reason })

    // let mapleader / maplocalleader
    const letMatch = trimmed.match(/^let\s+(?:g:)?(mapleader|maplocalleader)\s*=\s*(.+)$/)
    if (letMatch) {
      const value = parseLeaderValue(letMatch[2])
      if (value === null) skip('mapleader の値を解釈できません')
      else if (letMatch[1] === 'mapleader') leader = value
      continue
    }

    const m = trimmed.match(/^([A-Za-z]+)(!?)(?:\s+([\s\S]*))?$/)
    if (!m) {
      skip('未対応のコマンドです')
      continue
    }
    let name = SHORT_NAMES[m[1]] ?? m[1]
    if (name in ALIASES) {
      if (ALIASES[name] === '') {
        skip('このモードのマップは未対応です')
        continue
      }
      name = ALIASES[name]
    }
    if (!SUPPORTED.has(name)) {
      skip('未対応のコマンドです')
      continue
    }

    let args = (m[3] ?? '').trim()
    if (/^[nvio]?(?:nore)?map$/.test(name)) {
      // <buffer> / <silent> 等のマップ修飾子は動作に影響しないので取り除く
      args = args.replace(/^(?:<(?:buffer|silent|nowait|expr|unique|script)>\s*)+/i, '')
      if (!args.includes(' ')) {
        skip('{lhs} {rhs} の形式ではありません')
        continue
      }
      if (/<leader>/i.test(args)) {
        leaderUsed = true
        args = args.replace(/<leader>/gi, leaderKeyName(leader))
      }
    }
    commands.push(`${name} ${args}`.trim())
  }

  return { commands, skipped, leaderKey: leaderUsed ? leaderKeyName(leader) : null }
}
