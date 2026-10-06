import { compressToEncodedURIComponent } from 'lz-string'
import type { Tree } from '../../domain/tree/types'

export const encodeTree = (tree: Tree): string =>
  compressToEncodedURIComponent(JSON.stringify(tree))

export const encodeText = (text: string): string => compressToEncodedURIComponent(text)

export const toHash = (text: string): string => (text ? `#text=${encodeText(text)}` : '')
