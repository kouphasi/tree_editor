import { Index, Show, createMemo } from 'solid-js'
import type { TreeLine } from '../domain/tree/formatter'

export function TreePreview(props: { lines: TreeLine[] }) {
  const dirs = createMemo(() => props.lines.filter((l) => l.directory).length)
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
            <Index each={props.lines}>
              {(l) => (
                <div>
                  <span class="tree-prefix">{l().prefix}</span>
                  <span classList={{ 'tree-label': true, 'is-dir': l().directory }}>{l().label}</span>
                </div>
              )}
            </Index>
          </pre>
        </Show>
      </div>
    </section>
  )
}
