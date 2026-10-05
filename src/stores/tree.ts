import { createEffect } from 'solid-js'
import { createStore, reconcile, unwrap } from 'solid-js/store'
import { addNode, createNode, removeNode, renameNode } from '../domain/tree/operations'
import type { Tree, TreeNode } from '../domain/tree/types'
import { treeFromHash } from '../lib/url-state/decode'
import { toHash } from '../lib/url-state/encode'

export function createTreeStore() {
  const [tree, setTree] = createStore<Tree>(treeFromHash(location.hash))

  const apply = (fn: (t: Tree) => Tree) => setTree(reconcile(fn(unwrap(tree)), { key: 'id' }))

  // ツリー変更のたびにURL hashを更新（履歴は増やさない）
  createEffect(() => {
    const hash = toHash(JSON.parse(JSON.stringify(tree)))
    history.replaceState(null, '', hash)
  })

  return {
    tree,
    add: (parentId: string | null, type: TreeNode['type']) =>
      apply((t) => addNode(t, parentId, createNode(type, type === 'file' ? 'new-file' : 'new-dir'))),
    remove: (id: string) => apply((t) => removeNode(t, id)),
    rename: (id: string, name: string) => apply((t) => renameNode(t, id, name)),
  }
}

export type TreeStore = ReturnType<typeof createTreeStore>
