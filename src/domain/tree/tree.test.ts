import { describe, expect, it } from 'vitest'
import { generateTree } from './formatter'
import { parseTree, stringifyTree } from './parser'
import type { Tree } from './types'
import { decodeTree, textFromHash } from '../../lib/url-state/decode'
import { encodeTree, toHash } from '../../lib/url-state/encode'

const sample: Tree = [
  {
    id: '1', type: 'directory', name: 'src', children: [
      { id: '2', type: 'directory', name: 'components', children: [
        { id: '3', type: 'file', name: 'Button.tsx' },
        { id: '4', type: 'file', name: 'Modal.tsx' },
      ] },
      { id: '5', type: 'directory', name: 'lib', children: [{ id: '6', type: 'file', name: 'tree.ts' }] },
      { id: '7', type: 'file', name: 'App.tsx' },
    ],
  },
]

const sampleOutput = ['src/', '├── components/', '│   ├── Button.tsx', '│   └── Modal.tsx', '├── lib/', '│   └── tree.ts', '└── App.tsx'].join('\n')

describe('formatter', () => {
  it('formats like the tree command', () => {
    expect(generateTree(sample)).toBe(sampleOutput)
  })
})

describe('parseTree', () => {
  it('builds a tree from indentation', () => {
    const text = ['src', '  components', '    Button.tsx', '    Modal.tsx', '  lib', '    tree.ts', '  App.tsx'].join('\n')
    expect(generateTree(parseTree(text))).toBe(sampleOutput)
  })

  it('treats lines with children or a trailing slash as directories', () => {
    const tree = parseTree('a\n  b\nempty/\nfile')
    expect(tree.map((n) => [n.name, n.type])).toEqual([
      ['a', 'directory'],
      ['empty', 'directory'],
      ['file', 'file'],
    ])
  })

  it('accepts tabs, 4-space indents and blank lines', () => {
    expect(generateTree(parseTree('src\n\tlib\n\t\ttree.ts\n\n\tApp.tsx'))).toBe(
      ['src/', '├── lib/', '│   └── tree.ts', '└── App.tsx'].join('\n'),
    )
    expect(generateTree(parseTree('src\n    lib\n        tree.ts\n    App.tsx'))).toBe(
      ['src/', '├── lib/', '│   └── tree.ts', '└── App.tsx'].join('\n'),
    )
  })

  it('dedents to the nearest shallower ancestor', () => {
    // "c" は "b"(4) より浅く "a"(0) より深いので "a" の子になる
    const tree = parseTree('a\n    b\n        x\n  c')
    expect(generateTree(tree)).toBe(['a/', '├── b/', '│   └── x', '└── c'].join('\n'))
  })

  it('reads tree command output pasted as-is', () => {
    expect(generateTree(parseTree(sampleOutput))).toBe(sampleOutput)
  })

  it('returns an empty tree for empty input', () => {
    expect(parseTree('')).toEqual([])
    expect(parseTree('  \n\n')).toEqual([])
  })

  it('roundtrips through stringifyTree', () => {
    expect(generateTree(parseTree(stringifyTree(sample)))).toBe(sampleOutput)
  })
})

describe('url state', () => {
  it('roundtrips text through the hash', () => {
    const text = 'src/\n  App.tsx'
    expect(textFromHash(toHash(text))).toBe(text)
    expect(toHash('')).toBe('')
    expect(textFromHash('')).toBe('')
  })

  it('migrates legacy #data= (Tree JSON) links to text', () => {
    expect(decodeTree(encodeTree(sample))).toEqual(sample)
    expect(decodeTree('garbage')).toBeNull()
    const text = textFromHash(`#data=${encodeTree(sample)}`)
    expect(generateTree(parseTree(text))).toBe(sampleOutput)
  })
})
