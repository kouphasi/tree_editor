import type { Tree, TreeNode } from './types'

/** tree 図の1行。prefix は罫線部分、label はノード名（ディレクトリは末尾に "/"） */
export type TreeLine = { prefix: string; label: string; directory: boolean }

const toLine = (n: TreeNode, prefix: string): TreeLine => {
  const directory = n.type === 'directory'
  return { prefix, label: directory ? `${n.name}/` : n.name, directory }
}

const childLines = (n: TreeNode, prefix: string): TreeLine[] =>
  n.type === 'directory' ? formatChildren(n.children, prefix) : []

function formatChildren(nodes: Tree, prefix: string): TreeLine[] {
  return nodes.flatMap((n, i) => {
    const last = i === nodes.length - 1
    return [toLine(n, prefix + (last ? '└── ' : '├── ')), ...childLines(n, prefix + (last ? '    ' : '│   '))]
  })
}

/** Tree を tree コマンド風の行へ変換する。ルート直下のノードは罫線なしで出力する。 */
export function formatTreeLines(nodes: Tree): TreeLine[] {
  return nodes.flatMap((n) => [toLine(n, ''), ...childLines(n, '')])
}

/** 行をテキストへ結合する */
export function linesToText(lines: TreeLine[]): string {
  return lines.map((l) => l.prefix + l.label).join('\n')
}

/** Tree を tree コマンド風テキストへ変換する。 */
export function generateTree(nodes: Tree): string {
  return linesToText(formatTreeLines(nodes))
}
