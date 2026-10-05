import { decompressFromEncodedURIComponent } from 'lz-string'
import type { Tree, TreeNode } from '../../domain/tree/types'

function isNode(v: unknown): v is TreeNode {
  if (typeof v !== 'object' || v === null) return false
  const n = v as Record<string, unknown>
  if (typeof n.id !== 'string' || typeof n.name !== 'string') return false
  if (n.type === 'file') return true
  return n.type === 'directory' && Array.isArray(n.children) && n.children.every(isNode)
}

export function decodeTree(encoded: string): Tree | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const parsed: unknown = JSON.parse(json)
    return Array.isArray(parsed) && parsed.every(isNode) ? parsed : null
  } catch {
    return null
  }
}

/** location.hash（例: "#data=xxxx"）から Tree を復元する。無効なら空のツリー。 */
export function treeFromHash(hash: string): Tree {
  const encoded = new URLSearchParams(hash.replace(/^#/, '')).get('data')
  return (encoded && decodeTree(encoded)) || []
}
