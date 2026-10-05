import type { Tree, TreeNode } from './types'

const label = (n: TreeNode) => (n.type === 'directory' ? `${n.name}/` : n.name)

function formatChildren(nodes: Tree, prefix: string): string[] {
  return nodes.flatMap((n, i) => {
    const last = i === nodes.length - 1
    const line = `${prefix}${last ? '└── ' : '├── '}${label(n)}`
    const rest =
      n.type === 'directory' ? formatChildren(n.children, prefix + (last ? '    ' : '│   ')) : []
    return [line, ...rest]
  })
}

/** Tree を tree コマンド風テキストへ変換する。ルート直下のノードは罫線なしで出力する。 */
export function generateTree(nodes: Tree): string {
  return nodes
    .flatMap((n) => [label(n), ...(n.type === 'directory' ? formatChildren(n.children, '') : [])])
    .join('\n')
}
