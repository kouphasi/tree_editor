const HINTS = [
  ['Tab', '字下げ'],
  ['⇧Tab', '戻す'],
  ['⏎', '自動インデント'],
  ['/', '末尾でフォルダ'],
] as const

export function KeyHints() {
  return (
    <footer class="hints">
      <ul class="glass hints-pill">
        {HINTS.map(([key, label]) => (
          <li>
            <kbd>{key}</kbd>
            {label}
          </li>
        ))}
      </ul>
    </footer>
  )
}
