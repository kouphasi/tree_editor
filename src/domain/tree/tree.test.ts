import { describe, expect, it } from 'vitest'
import { generateTree } from './formatter'
import { addNode, removeNode, renameNode } from './operations'
import type { Tree } from './types'
import { decodeTree } from '../../lib/url-state/decode'
import { encodeTree } from '../../lib/url-state/encode'

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

describe('tree', () => {
  it('formats like the tree command', () => {
    expect(generateTree(sample)).toBe(
      ['src/', '├── components/', '│   ├── Button.tsx', '│   └── Modal.tsx', '├── lib/', '│   └── tree.ts', '└── App.tsx'].join('\n'),
    )
  })
  it('add / rename / remove', () => {
    const added = addNode(sample, '5', { id: '8', type: 'file', name: 'x.ts' })
    expect(generateTree(added)).toContain('│   ├── tree.ts\n│   └── x.ts')
    expect(generateTree(renameNode(added, '8', 'y.ts'))).toContain('y.ts')
    expect(generateTree(removeNode(added, '2'))).not.toContain('components')
  })
  it('roundtrips through URL encoding', () => {
    expect(decodeTree(encodeTree(sample))).toEqual(sample)
    expect(decodeTree('garbage')).toBeNull()
  })
})
