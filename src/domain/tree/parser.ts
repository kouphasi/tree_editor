import type { Tree, TreeNode } from './types'

/** タブ1つを何カラム分のインデントとして扱うか */
const TAB_WIDTH = 4

/**
 * 行頭のインデント幅と本文を取り出す。
 * tree コマンドの罫線（│ ├ └ ─）もインデントとして扱うため、出力をそのまま貼り付けても読み込める。
 */
function splitIndent(line: string): { indent: number; body: string } {
  const prefix = line.match(/^[ \t 　│├└─]*/)![0]
  let indent = 0
  for (const ch of prefix) indent += ch === '\t' ? TAB_WIDTH - (indent % TAB_WIDTH) : 1
  return { indent, body: line.slice(prefix.length).trim() }
}

type Draft = { name: string; explicitDir: boolean; children: Draft[] }

/**
 * インデントされたテキストを Tree に変換する。
 * - 空行は無視する
 * - 子を持つ行、または末尾が "/" の行はディレクトリになる（"/" は名前から除去）
 * - インデント幅は任意（2スペース・4スペース・タブなど）。直前の行より深ければ子、浅ければ同じ深さの祖先の兄弟になる
 */
export function parseTree(text: string): Tree {
  const root: Draft[] = []
  const stack: { indent: number; node: Draft }[] = []

  for (const line of text.split(/\r?\n/)) {
    const { indent, body } = splitIndent(line)
    if (!body) continue
    const name = body.replace(/\/+$/, '').trim()
    if (!name) continue
    const node: Draft = { name, explicitDir: body.endsWith('/'), children: [] }

    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop()
    const parent = stack[stack.length - 1]
    ;(parent ? parent.node.children : root).push(node)
    stack.push({ indent, node })
  }

  let seq = 0
  const toNode = (d: Draft): TreeNode => {
    const id = `n${seq++}`
    return d.explicitDir || d.children.length
      ? { id, type: 'directory', name: d.name, children: d.children.map(toNode) }
      : { id, type: 'file', name: d.name }
  }
  return root.map(toNode)
}

/** Tree をインデントテキストへ変換する（parseTree の逆変換）。ディレクトリには末尾 "/" を付ける。 */
export function stringifyTree(tree: Tree, indentUnit = '  '): string {
  const lines = (nodes: Tree, depth: number): string[] =>
    nodes.flatMap((n) => [
      `${indentUnit.repeat(depth)}${n.type === 'directory' ? `${n.name}/` : n.name}`,
      ...(n.type === 'directory' ? lines(n.children, depth + 1) : []),
    ])
  return lines(tree, 0).join('\n')
}
