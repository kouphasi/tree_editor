import { createMemo } from 'solid-js'
import { Toolbar } from './components/Toolbar'
import { TreeEditor } from './components/TreeEditor'
import { TreePreview } from './components/TreePreview'
import { generateTree } from './domain/tree/formatter'
import { createTreeStore } from './stores/tree'
import './style.css'

export default function App() {
  const store = createTreeStore()
  const text = createMemo(() => generateTree(store.tree()))
  return (
    <div class="app">
      <header>
        <h1>Directory Tree Editor</h1>
      </header>
      <main>
        <TreeEditor store={store} />
        <TreePreview text={text()} />
      </main>
      <Toolbar text={text()} />
    </div>
  )
}
