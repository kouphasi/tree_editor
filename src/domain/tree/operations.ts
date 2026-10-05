import type { Tree, TreeNode } from './types'

let counter = 0
export const newId = (): string =>
  `${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const createNode = (type: TreeNode['type'], name: string): TreeNode =>
  type === 'file'
    ? { id: newId(), type, name }
    : { id: newId(), type, name, children: [] }

/** parentId が null の場合はルートへ追加する。 */
export function addNode(tree: Tree, parentId: string | null, node: TreeNode): Tree {
  if (parentId === null) return [...tree, node]
  return tree.map((n) => {
    if (n.type !== 'directory') return n
    if (n.id === parentId) return { ...n, children: [...n.children, node] }
    return { ...n, children: addNode(n.children, parentId, node) }
  })
}

export function removeNode(tree: Tree, id: string): Tree {
  return tree
    .filter((n) => n.id !== id)
    .map((n) => (n.type === 'directory' ? { ...n, children: removeNode(n.children, id) } : n))
}

export function renameNode(tree: Tree, id: string, name: string): Tree {
  return tree.map((n) => {
    const renamed = n.id === id ? { ...n, name } : n
    return renamed.type === 'directory'
      ? { ...renamed, children: renameNode(renamed.children, id, name) }
      : renamed
  })
}
