<script setup lang="ts" vapor>
import { onMounted, useTemplateRef } from 'vue'

const emit = defineEmits<{ close: [] }>()

const HINTS = [
  ['Tab', '字下げ'],
  ['⇧Tab', '字下げを戻す'],
  ['⏎', '改行して自動インデント'],
  ['/', '行末に付けるとフォルダ'],
  ['?', 'このヘルプを表示（入力欄の外で）'],
  ['Esc', 'ヘルプを閉じる'],
] as const

const closeBtn = useTemplateRef<HTMLButtonElement>('closeBtn')
// 開いた直後からキーボードだけで閉じられるよう、フォーカスをダイアログ内へ移す
onMounted(() => closeBtn.value?.focus())
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div
      class="glass modal help-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      @keydown.esc="emit('close')"
    >
      <h2 id="help-title">キー操作</h2>
      <dl class="help-list">
        <template v-for="[key, label] in HINTS" :key="key">
          <dt><kbd>{{ key }}</kbd></dt>
          <dd>{{ label }}</dd>
        </template>
      </dl>
      <div class="modal-actions">
        <button ref="closeBtn" class="btn btn-primary" @click="emit('close')">閉じる</button>
      </div>
    </div>
  </div>
</template>
