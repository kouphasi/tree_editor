<script setup lang="ts" vapor>
const HINTS = [
  ['Tab', '字下げ'],
  ['⇧Tab', '戻す'],
  ['⏎', '自動インデント'],
  ['/', '末尾でフォルダ'],
] as const
</script>

<template>
  <footer class="hints">
    <ul class="glass hints-pill">
      <li v-for="[key, label] in HINTS" :key="key">
        <kbd>{{ key }}</kbd>{{ label }}
      </li>
    </ul>
  </footer>
</template>
