export type TreeNode =
  | { id: string; type: 'file'; name: string }
  | { id: string; type: 'directory'; name: string; children: TreeNode[] }

export type Tree = TreeNode[]
