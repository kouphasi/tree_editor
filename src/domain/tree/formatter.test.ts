import { describe, expect, it } from 'vitest'
import { formatTreeLines, generateTree, linesToText } from './formatter'
import type { Tree } from './types'

const tree: Tree = [
  { id: '1', type: 'directory', name: 'a', children: [{ id: '2', type: 'file', name: 'x' }] },
  { id: '3', type: 'file', name: 'b' },
]

describe('formatTreeLines', () => {
  it('ルート直下は罫線なし、ディレクトリ名に "/" を付ける', () => {
    expect(formatTreeLines(tree)).toEqual([
      { prefix: '', label: 'a/', directory: true },
      { prefix: '└── ', label: 'x', directory: false },
      { prefix: '', label: 'b', directory: false },
    ])
  })

  it('空の Tree は空配列・空文字', () => {
    expect(formatTreeLines([])).toEqual([])
    expect(generateTree([])).toBe('')
  })

  it('空ディレクトリは子を持たない', () => {
    expect(generateTree([{ id: '1', type: 'directory', name: 'd', children: [] }])).toBe('d/')
  })

  it('最後の兄弟でない祖先の下では "│   " を引き継ぐ', () => {
    const t: Tree = [
      { id: '1', type: 'directory', name: 'r', children: [
        { id: '2', type: 'directory', name: 'a', children: [{ id: '3', type: 'file', name: 'x' }] },
        { id: '4', type: 'directory', name: 'b', children: [{ id: '5', type: 'file', name: 'y' }] },
      ] },
    ]
    expect(generateTree(t)).toBe(['r/', '├── a/', '│   └── x', '└── b/', '    └── y'].join('\n'))
  })

  it('linesToText は prefix と label を改行で結合する', () => {
    expect(linesToText([{ prefix: '├── ', label: 'a', directory: false }, { prefix: '', label: 'b/', directory: true }])).toBe('├── a\nb/')
  })
})
