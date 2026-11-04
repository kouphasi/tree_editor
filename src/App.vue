<script setup lang="ts" vapor>
import { computed } from 'vue'
import KeyHints from './components/KeyHints.vue'
import AppToolbar from './components/AppToolbar.vue'
import TreeEditor from './components/TreeEditor.vue'
import TreePreview from './components/TreePreview.vue'
import { formatTreeLines, linesToText } from './domain/tree/formatter'
import { createTreeStore } from './stores/tree'
import { createVimSettings } from './stores/vim'

const store = createTreeStore()
const vimSettings = createVimSettings()
const lines = computed(() => formatTreeLines(store.tree.value))
const text = computed(() => linesToText(lines.value))
</script>

<template>
  <div class="app">
    <div class="backdrop" aria-hidden="true"></div>
    <AppToolbar :text="text" :vim-settings="vimSettings" />
    <main>
      <TreeEditor :store="store" :vim-settings="vimSettings" />
      <TreePreview :lines="lines" />
    </main>
    <KeyHints />
  </div>
</template>
