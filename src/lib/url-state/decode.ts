import { decompressFromEncodedURIComponent } from 'lz-string'
import { stringifyTree } from '../../domain/tree/parser'
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

export function decodeText(encoded: string): string | null {
  try {
    return decompressFromEncodedURIComponent(encoded) || null
  } catch {
    return null
  }
}

/**
 * location.hash からエディタのテキストを復元する。
 * "#text=xxxx" が現行形式。旧形式 "#data=xxxx"（Tree JSON）はインデントテキストへ変換して読み込む。
 */
export function textFromHash(hash: string): string {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const text = params.get('text')
  if (text) return decodeText(text) ?? ''
  const data = params.get('data')
  const tree = data && decodeTree(data)
  return tree ? stringifyTree(tree) : ''
}
