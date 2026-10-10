import { createMemo } from 'solid-js'
import { KeyHints } from './components/KeyHints'
import { Toolbar } from './components/Toolbar'
import { TreeEditor } from './components/TreeEditor'
import { TreePreview } from './components/TreePreview'
import { formatTreeLines } from './domain/tree/formatter'
import { createTreeStore } from './stores/tree'
import './style.css'

export default function App() {
  const store = createTreeStore()
  const lines = createMemo(() => formatTreeLines(store.tree()))
  const text = createMemo(() => lines().map((l) => l.prefix + l.label).join('\n'))
  return (
    <div class="app">
      <div class="backdrop" aria-hidden="true" />
      <Toolbar text={text()} />
      <main>
        <TreeEditor store={store} />
        <TreePreview lines={lines()} />
      </main>
      <KeyHints />
    </div>
  )
}
