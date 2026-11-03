<script setup lang="ts" vapor>
import { computed, shallowRef } from 'vue'
import { parseVimrc } from '../lib/vim/vimrc'
import type { VimSettings } from '../stores/vim'

const props = defineProps<{ settings: VimSettings }>()
const emit = defineEmits<{ close: [] }>()

const SAMPLE = `" 例
let mapleader = " "
inoremap jk <Esc>
nnoremap <leader>w :w<CR>
nnoremap H ^
nnoremap L $
set ignorecase smartcase`

const enabled = shallowRef(props.settings.enabled.value)
const draft = shallowRef(props.settings.vimrc.value)
const parsed = computed(() => parseVimrc(draft.value))

const save = () => {
  props.settings.setVimrc(draft.value)
  props.settings.setEnabled(enabled.value)
  emit('close')
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div
      class="glass modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vim-title"
      @keydown.esc="emit('close')"
    >
      <h2 id="vim-title">Vim 設定</h2>
      <label class="check">
        <input v-model="enabled" type="checkbox" />
        Vim モードを有効にする
      </label>
      <label class="field">
        <span>vimrc</span>
        <textarea
          v-model="draft"
          class="vimrc-input"
          :placeholder="SAMPLE"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
        ></textarea>
      </label>
      <p class="modal-note">
        対応: <code>map</code> 系 / <code>set</code> / <code>let mapleader</code>。ブラウザに保存され、保存時に即時反映されます。
      </p>
      <details v-if="parsed.skipped.length > 0" class="skipped">
        <summary>未対応のため無視される行: {{ parsed.skipped.length }} 件</summary>
        <ul>
          <li v-for="s in parsed.skipped" :key="s.line">
            <code>{{ s.line }}: {{ s.text }}</code> — {{ s.reason }}
          </li>
        </ul>
      </details>
      <div class="modal-actions">
        <button class="btn" @click="emit('close')">キャンセル</button>
        <button class="btn btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>
