<script setup lang="ts" vapor>
import { computed } from 'vue'
import type { TreeLine } from '../domain/tree/formatter'

const props = defineProps<{ lines: TreeLine[] }>()
const dirs = computed(() => props.lines.filter((l) => l.directory).length)
</script>

<template>
  <section class="glass pane preview-pane">
    <div class="pane-header">
      <h2>プレビュー</h2>
      <span class="pane-meta">{{ dirs }} フォルダ · {{ props.lines.length - dirs }} ファイル</span>
    </div>
    <div class="pane-body">
      <pre v-if="props.lines.length > 0" class="tree"><div v-for="(l, i) in props.lines" :key="i"><span class="tree-prefix">{{ l.prefix }}</span><span class="tree-label" :class="{ 'is-dir': l.directory }">{{ l.label }}</span></div></pre>
      <p v-else class="empty">左に入力するとここにツリー図が表示されます</p>
    </div>
  </section>
</template>
