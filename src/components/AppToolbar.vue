<script setup lang="ts" vapor>
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import type { VimSettings } from '../stores/vim'
import KeyHelp from './KeyHelp.vue'
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
const helpOpen = shallowRef(false)

/** 文字入力中の `?` はそのまま入力させる（vim の後方検索 `?` も奪わない） */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return
  if (vimOpen.value || isTyping(e.target)) return
  e.preventDefault()
  helpOpen.value = true
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
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
      <button class="btn btn-help" aria-keyshortcuts="?" @click="helpOpen = true"><kbd>?</kbd>ヘルプ</button>
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
    <KeyHelp v-if="helpOpen" @close="helpOpen = false" />
  </header>
</template>
