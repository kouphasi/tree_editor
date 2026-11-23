<script setup lang="ts" vapor>
import { computed } from 'vue'
import type { ThemeMode, ThemeSettings } from '../stores/theme'

const props = defineProps<{ theme: ThemeSettings }>()

const LABELS: Record<ThemeMode, string> = { system: '自動', light: 'ライト', dark: 'ダーク' }
const NEXT: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' }

const mode = computed(() => props.theme.mode.value)
const title = computed(() => `テーマ: ${LABELS[mode.value]}（クリックで${LABELS[NEXT[mode.value]]}に切り替え）`)
</script>

<template>
  <button class="btn btn-theme" :title="title" :aria-label="title" @click="props.theme.cycle()">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <template v-if="mode === 'light'">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </template>
      <path v-else-if="mode === 'dark'" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      <template v-else>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </template>
    </svg>
  </button>
</template>
