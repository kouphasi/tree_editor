import { Vim } from '@replit/codemirror-vim'

/**
 * vim のヤンク/ペーストをシステムクリップボードと連動させる（Vim の `set clipboard=unnamedplus` 相当）。
 *
 * - レジスタ未指定（または `""`）のヤンクは無名レジスタに加えてクリップボードにも書き込む
 * - レジスタ未指定の p / P は、外部でコピーされたテキストがクリップボードにあればそれを貼り付ける。
 *   自分が書き込んだままの内容なら無名レジスタを使う（`dd` → `p` で削除した行が貼られるように、
 *   また行単位/矩形の情報を保つため）
 *
 * vimrc の `set clipboard=` で無効化できる。既定は有効（unnamedplus）。
 */

export const CLIPBOARD_OPTION = 'clipboard'
export const CLIPBOARD_DEFAULT = 'unnamedplus'

/** `clipboard` オプションの値（カンマ区切り）が無名レジスタの連動を意味するか */
export function isClipboardSyncEnabled(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return value.split(',').some((v) => v.trim() === 'unnamed' || v.trim() === 'unnamedplus')
}

/** レジスタ未指定とみなす名前 */
export function isUnnamed(registerName: string | null | undefined): boolean {
  return !registerName || registerName === '"'
}

/**
 * 貼り付け時に使うテキストを決める。クリップボードの内容が自分の最後に書き込んだもの（または
 * 前回取り込んだもの）と違えば外部コピーとみなして採用し、そうでなければ null（＝無名レジスタを使う）。
 * 外部テキストは Vim と同様に末尾改行があれば行単位として扱う。
 */
export function pickExternalClipboard(
  clipboardText: string | null | undefined,
  lastSynced: string | null,
): { text: string; linewise: boolean } | null {
  if (!clipboardText || clipboardText === lastSynced) return null
  return { text: clipboardText, linewise: clipboardText.endsWith('\n') }
}

type Register = ReturnType<ReturnType<typeof Vim.getRegisterController>['getRegister']>
type ActionFn = Parameters<typeof Vim.defineAction>[1]
interface PasteArgs {
  registerName?: string
}
interface PasteActions {
  continuePaste(cm: unknown, args: unknown, vim: unknown, text: string, register: Register): void
}

let installed = false
/** 最後にクリップボードへ書き込んだ／クリップボードから取り込んだテキスト */
let lastSynced: string | null = null

function enabled(): boolean {
  try {
    return isClipboardSyncEnabled(Vim.getOption(CLIPBOARD_OPTION))
  } catch {
    return false
  }
}

function writeClipboard(text: string) {
  lastSynced = text
  // 権限がない・フォーカスがない等で失敗してもヤンク自体は無名レジスタに残っているので無視する
  navigator.clipboard?.writeText(text).catch(() => {})
}

async function readClipboard(): Promise<string | null> {
  try {
    return (await navigator.clipboard?.readText()) ?? null
  } catch {
    return null
  }
}

/** Vim のグローバル状態にフックを仕掛ける。何度呼んでも1回だけ適用される */
export function installClipboardSync() {
  if (installed) return
  installed = true

  Vim.defineOption(CLIPBOARD_OPTION, CLIPBOARD_DEFAULT, 'string')

  // ヤンクを横取りしてクリップボードにも書き込む
  const controller = Vim.getRegisterController()
  const pushText = controller.pushText.bind(controller)
  controller.pushText = (registerName, operator, text, linewise, blockwise) => {
    pushText(registerName, operator, text, linewise, blockwise)
    if (operator === 'yank' && isUnnamed(registerName) && enabled()) {
      writeClipboard(controller.unnamedRegister.toString())
    }
  }

  // ペースト（p / P / gp / gP / ]p など）を置き換える。元の実装と同じく continuePaste に処理を渡す
  const paste: ActionFn = function (this: PasteActions, cm, actionArgs, vim) {
    const args = actionArgs as PasteArgs
    const register = Vim.getRegisterController().getRegister(args.registerName)
    const run = () => this.continuePaste(cm, actionArgs, vim, register.toString(), register)

    if (args.registerName === '+') {
      void readClipboard().then((text) => {
        if (text) this.continuePaste(cm, actionArgs, vim, text, register)
      })
      return
    }
    // マクロ再生中は非同期にすると後続キーと順序が崩れるので、レジスタだけを使う
    const replaying = Vim.getVimGlobalState_().macroModeState.isPlaying
    if (!isUnnamed(args.registerName) || !enabled() || replaying) {
      run()
      return
    }
    void readClipboard().then((text) => {
      const external = pickExternalClipboard(text, lastSynced)
      if (external) {
        lastSynced = external.text
        register.setText(external.text, external.linewise)
      }
      run()
    })
  }
  Vim.defineAction('paste', paste)
}

/** vimrc 再適用前にオプションを既定値へ戻す（vimrc から行を消したときに元へ戻るように） */
export function resetClipboardOption() {
  try {
    Vim.setOption(CLIPBOARD_OPTION, CLIPBOARD_DEFAULT)
  } catch {
    // 未定義なら何もしない
  }
}
