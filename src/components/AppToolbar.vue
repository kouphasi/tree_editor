<script setup lang="ts" vapor>
import { shallowRef } from 'vue'
import type { VimSettings } from '../stores/vim'
import VimSettingsDialog from './VimSettings.vue'

const props = defineProps<{ text: string; vimSettings: VimSettings }>()

/** クリップボードにコピーし、一定時間だけ完了表示を返す */
function useCopy() {
  const copied = shallowRef(false)
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
  return [copied, copy] as const
}

const vimOpen = shallowRef(false)
const [copied, copy] = useCopy()
const [linkCopied, copyLink] = useCopy()
// テンプレートからは location を直接参照できないため関数経由で渡す
const currentUrl = () => location.href
</script>

<template>
  <header class="toolbar">
    <div class="glass toolbar-pill">
      <span class="logo" aria-hidden="true">└──</span>
      <h1>Directory Tree Editor</h1>
      <button class="btn" :class="{ 'is-on': props.vimSettings.enabled.value }" @click="vimOpen = true">
        Vim{{ props.vimSettings.enabled.value ? ' ON' : '' }}
      </button>
      <button class="btn" @click="copyLink(currentUrl())">
        {{ linkCopied ? 'コピーしました' : 'リンクをコピー' }}
      </button>
      <button class="btn btn-primary" @click="copy(props.text)">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <VimSettingsDialog v-if="vimOpen" :settings="props.vimSettings" @close="vimOpen = false" />
  </header>
</template>
