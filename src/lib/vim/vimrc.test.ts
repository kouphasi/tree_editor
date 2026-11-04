import { describe, expect, it } from 'vitest'
import { normalizeKeyNotation, parseVimrc } from './vimrc'

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

describe('parseVimrc 追加ケース', () => {
  it('空入力は何も返さない', () => {
    expect(parseVimrc('')).toEqual({ commands: [], skipped: [], leaderKey: null })
  })

  it('先頭の ":" を除去する', () => {
    expect(parseVimrc(':set nu\n: nnoremap a b').commands).toEqual(['set nu', 'nnoremap a b'])
  })

  it('CRLF を扱う', () => {
    expect(parseVimrc('set nu\r\nnmap a b\r\n').commands).toEqual(['set nu', 'nmap a b'])
  })

  it('mapleader の値が解釈できなければ skipped', () => {
    const r = parseVimrc('let mapleader = foo')
    expect(r.commands).toEqual([])
    expect(r.skipped).toHaveLength(1)
  })

  it('maplocalleader は leader を変えない', () => {
    expect(parseVimrc('let maplocalleader = ","\nnmap <leader>a x').commands).toEqual(['nmap \\a x'])
  })

  it('<Leader> は大文字小文字を区別せず、複数あれば全て置換する', () => {
    expect(parseVimrc('let mapleader = ","\nnmap <LEADER>a <leader>b').commands).toEqual(['nmap ,a ,b'])
  })

  it('cmap 系は未対応として skipped', () => {
    const r = parseVimrc('cmap a b\ncnoremap a b')
    expect(r.commands).toEqual([])
    expect(r.skipped.map((s) => s.line)).toEqual([1, 2])
  })

  it('継続行を含んでも行番号は先頭行のもの', () => {
    const r = parseVimrc('nmap a b\nsyntax\n  \\ on')
    expect(r.skipped.map((s) => s.line)).toEqual([2])
  })

  it('xmap / smap は vmap 系へ読み替える', () => {
    expect(parseVimrc('xmap a b\nsnoremap c d').commands).toEqual(['vmap a b', 'vnoremap c d'])
  })
})

describe('キー表記の正規化', () => {
  it('小文字の <esc> などをエミュレーション側の表記に揃える', () => {
    expect(parseVimrc('imap jj <esc>').commands).toEqual(['imap jj <Esc>'])
    expect(parseVimrc('inoremap jk <ESC>').commands).toEqual(['inoremap jk <Esc>'])
    expect(parseVimrc('nnoremap <leader>w :w<cr>').commands).toEqual(['nnoremap \\w :w<CR>'])
  })

  it('修飾子付きキーを正規化する', () => {
    expect(normalizeKeyNotation('<c-j>')).toBe('<C-j>')
    expect(normalizeKeyNotation('<C-J>')).toBe('<C-j>')
    expect(normalizeKeyNotation('<s-tab>')).toBe('<S-Tab>')
    expect(normalizeKeyNotation('<s-c-x>')).toBe('<C-S-x>')
    expect(normalizeKeyNotation('<f5>')).toBe('<F5>')
  })

  it('未知の表記や単独文字はそのまま残す', () => {
    expect(normalizeKeyNotation('<Plug>Foo')).toBe('<Plug>Foo')
    expect(normalizeKeyNotation('<gv')).toBe('<gv')
    expect(normalizeKeyNotation('<a>')).toBe('<a>')
  })

  it('set の値は変更しない', () => {
    expect(parseVimrc('set foo=<esc>').commands).toEqual(['set foo=<esc>'])
  })
})
