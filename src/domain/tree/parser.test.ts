import { describe, expect, it } from 'vitest'
import { parseTree, stringifyTree } from './parser'

const shape = (t: ReturnType<typeof parseTree>): unknown =>
  t.map((n) => (n.type === 'directory' ? { [n.name]: shape(n.children) } : n.name))

describe('parseTree 境界値', () => {
  it('CRLF 改行を扱える', () => {
    expect(shape(parseTree('a\r\n  b\r\n'))).toEqual([{ a: ['b'] }])
  })

  it('全角スペースもインデントとして扱う', () => {
    expect(shape(parseTree('a\n　b'))).toEqual([{ a: ['b'] }])
  })

  it('"/" だけの行は無視し、連続する末尾 "/" は除去する', () => {
    expect(shape(parseTree('/\ndir//'))).toEqual([{ dir: [] }])
  })

  it('名前の前後の空白は trim される', () => {
    expect(shape(parseTree('  a  \n'))).toEqual(['a'])
  })

  it('id は全ノードで一意', () => {
    const ids: string[] = []
    const walk = (t: ReturnType<typeof parseTree>) =>
      t.forEach((n) => {
        ids.push(n.id)
        if (n.type === 'directory') walk(n.children)
      })
    walk(parseTree('a\n  b\n  c\nd'))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBe(4)
  })

  it('最初の行がインデントされていてもルートになる', () => {
    expect(shape(parseTree('    a\n  b'))).toEqual(['a', 'b'])
  })

  it('タブはタブストップ(4)に揃う', () => {
    // "  " + タブ → 4 カラム。タブ1つ (4) と同じ深さ
    expect(shape(parseTree('a\n\tb\n  \tc'))).toEqual([{ a: ['b', 'c'] }])
  })
})

describe('stringifyTree', () => {
  it('indentUnit を変更できる', () => {
    const t = parseTree('a\n  b')
    expect(stringifyTree(t, '\t')).toBe('a/\n\tb')
    expect(stringifyTree(t, '    ')).toBe('a/\n    b')
  })

  it('空の Tree は空文字', () => {
    expect(stringifyTree([])).toBe('')
  })
})
