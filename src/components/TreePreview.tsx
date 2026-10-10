import { For, Show } from 'solid-js'
import type { TreeLine } from '../domain/tree/formatter'

export function TreePreview(props: { lines: TreeLine[] }) {
  const dirs = () => props.lines.filter((l) => l.directory).length
  return (
    <section class="glass pane preview-pane">
      <div class="pane-header">
        <h2>プレビュー</h2>
        <span class="pane-meta">
          {dirs()} フォルダ · {props.lines.length - dirs()} ファイル
        </span>
      </div>
      <div class="pane-body">
        <Show when={props.lines.length > 0} fallback={<p class="empty">左に入力するとここにツリー図が表示されます</p>}>
          <pre class="tree">
            <For each={props.lines}>
              {(l) => (
                <div>
                  <span class="tree-prefix">{l.prefix}</span>
                  <span classList={{ 'tree-label': true, 'is-dir': l.directory }}>{l.label}</span>
                </div>
              )}
            </For>
          </pre>
        </Show>
      </div>
    </section>
  )
}
