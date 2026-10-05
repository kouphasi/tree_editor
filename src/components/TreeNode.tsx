import { For, Show } from 'solid-js'
import type { TreeNode as Node } from '../domain/tree/types'
import type { TreeStore } from '../stores/tree'

export function TreeNodeView(props: { node: Node; store: TreeStore }) {
  const commit = (el: HTMLInputElement) => {
    const name = el.value.trim()
    if (name) props.store.rename(props.node.id, name)
    else el.value = props.node.name
  }
  return (
    <li>
      <div class="row">
        <span class="icon">{props.node.type === 'directory' ? '📁' : '📄'}</span>
        <input
          value={props.node.name}
          onChange={(e) => commit(e.currentTarget)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <Show when={props.node.type === 'directory'}>
          <button onClick={() => props.store.add(props.node.id, 'file')}>+File</button>
          <button onClick={() => props.store.add(props.node.id, 'directory')}>+Dir</button>
        </Show>
        <button class="danger" onClick={() => props.store.remove(props.node.id)}>
          Delete
        </button>
      </div>
      <Show when={props.node.type === 'directory' && (props.node as any).children.length}>
        <ul>
          <For each={(props.node as Extract<Node, { type: 'directory' }>).children}>
            {(child) => <TreeNodeView node={child} store={props.store} />}
          </For>
        </ul>
      </Show>
    </li>
  )
}
