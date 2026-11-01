import { describe, expect, it } from 'vitest'
import { parseVimrc } from './vimrc'

describe('parseVimrc', () => {
  it('コメント・空行を無視し、マップと set を抽出する', () => {
    const r = parseVimrc(`" comment\n\ninoremap jk <Esc>\nnnoremap H ^\nset ignorecase\n`)
    expect(r.commands).toEqual(['inoremap jk <Esc>', 'nnoremap H ^', 'set ignorecase'])
    expect(r.skipped).toEqual([])
  })

  it('mapleader を <leader> に展開する', () => {
    const r = parseVimrc(`let mapleader = " "\nnnoremap <leader>w :w<CR>`)
    expect(r.commands).toEqual(['nnoremap <Space>w :w<CR>'])
  })

  it('mapleader 未指定なら "\\" を使う', () => {
    expect(parseVimrc('nmap <Leader>x dd').commands).toEqual(['nmap \\x dd'])
  })

  it('"\\<Space>" 形式と , を解釈する', () => {
    expect(parseVimrc('let mapleader = "\\<Space>"\nnmap <leader>a x').commands).toEqual(['nmap <Space>a x'])
    expect(parseVimrc("let g:mapleader = ','\nnmap <leader>a x").commands).toEqual(['nmap ,a x'])
  })

  it('省略形・xmap・<silent> を正規化する', () => {
    const r = parseVimrc('nn <silent> j gj\nxnoremap < <gv\nse nu')
    expect(r.commands).toEqual(['nnoremap j gj', 'vnoremap < <gv', 'set nu'])
  })

  it('継続行を連結する', () => {
    expect(parseVimrc('set ignorecase\n  \\ smartcase').commands).toEqual(['set ignorecase smartcase'])
  })

  it('未対応の行は skipped に行番号付きで入る', () => {
    const r = parseVimrc('syntax on\nPlug "a/b"\ncnoremap a b\nnmap onlylhs\nnmap a b')
    expect(r.commands).toEqual(['nmap a b'])
    expect(r.skipped.map((s) => s.line)).toEqual([1, 2, 3, 4])
  })

  it('unmap / mapclear はそのまま通す', () => {
    expect(parseVimrc('unmap x\nmapclear').commands).toEqual(['unmap x', 'mapclear'])
  })
})

describe('leaderKey', () => {
  it('<leader> を使うマップがあれば leader キーを返す', () => {
    expect(parseVimrc('let mapleader = " "\nnmap <leader>a x').leaderKey).toBe('<Space>')
    expect(parseVimrc('nmap <leader>a x').leaderKey).toBe('\\')
  })
  it('<leader> を使わなければ null', () => {
    expect(parseVimrc('let mapleader = " "\nnmap a x').leaderKey).toBeNull()
  })
})
