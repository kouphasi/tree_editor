import { compressToEncodedURIComponent } from 'lz-string'
import type { Tree } from '../../domain/tree/types'

export const encodeTree = (tree: Tree): string =>
  compressToEncodedURIComponent(JSON.stringify(tree))

export const toHash = (tree: Tree): string => `#data=${encodeTree(tree)}`
