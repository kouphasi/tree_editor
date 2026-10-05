import { For, Show } from 'solid-js'
import type { TreeStore } from '../stores/tree'
import { TreeNodeView } from './TreeNode'

export function TreeEditor(props: { store: TreeStore }) {
  return (
    <section class="pane">
      <h2>Tree Editor</h2>
      <div class="row">
        <button onClick={() => props.store.add(null, 'file')}>+File</button>
        <button onClick={() => props.store.add(null, 'directory')}>+Dir</button>
      </div>
      <Show when={props.store.tree.length === 0}>
        <p class="muted">空のツリーです。+File / +Dir で追加してください。</p>
      </Show>
      <ul class="root">
        <For each={props.store.tree}>{(n) => <TreeNodeView node={n} store={props.store} />}</For>
      </ul>
    </section>
  )
}
