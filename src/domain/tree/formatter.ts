import type { Tree, TreeNode } from './types'

/** tree 図の1行。prefix は罫線部分、label はノード名（ディレクトリは末尾に "/"） */
export type TreeLine = { prefix: string; label: string; directory: boolean }

const toLine = (n: TreeNode, prefix: string): TreeLine => ({
  prefix,
  label: n.type === 'directory' ? `${n.name}/` : n.name,
  directory: n.type === 'directory',
})

function formatChildren(nodes: Tree, prefix: string): TreeLine[] {
  return nodes.flatMap((n, i) => {
    const last = i === nodes.length - 1
    const rest =
      n.type === 'directory' ? formatChildren(n.children, prefix + (last ? '    ' : '│   ')) : []
    return [toLine(n, prefix + (last ? '└── ' : '├── ')), ...rest]
  })
}

/** Tree を tree コマンド風の行へ変換する。ルート直下のノードは罫線なしで出力する。 */
export function formatTreeLines(nodes: Tree): TreeLine[] {
  return nodes.flatMap((n) => [
    toLine(n, ''),
    ...(n.type === 'directory' ? formatChildren(n.children, '') : []),
  ])
}

/** Tree を tree コマンド風テキストへ変換する。 */
export function generateTree(nodes: Tree): string {
  return formatTreeLines(nodes)
    .map((l) => l.prefix + l.label)
    .join('\n')
}
