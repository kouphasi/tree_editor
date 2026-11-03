import { createMemo } from 'solid-js'
import { KeyHints } from './components/KeyHints'
import { Toolbar } from './components/Toolbar'
import { TreeEditor } from './components/TreeEditor'
import { TreePreview } from './components/TreePreview'
import { formatTreeLines, linesToText } from './domain/tree/formatter'
import { createTreeStore } from './stores/tree'
import { createVimSettings } from './stores/vim'
import './style.css'

export default function App() {
  const store = createTreeStore()
  const vimSettings = createVimSettings()
  const lines = createMemo(() => formatTreeLines(store.tree()))
  const text = createMemo(() => linesToText(lines()))
  return (
    <div class="app">
      <div class="backdrop" aria-hidden="true" />
      <Toolbar text={text()} vimSettings={vimSettings} />
      <main>
        <TreeEditor store={store} vimSettings={vimSettings} />
        <TreePreview lines={lines()} />
      </main>
      <KeyHints />
    </div>
  )
}
