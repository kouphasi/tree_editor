import { compressToEncodedURIComponent } from 'lz-string'
import { describe, expect, it } from 'vitest'
import { decodeText, decodeTree, textFromHash } from './decode'
import { encodeText, encodeTree, toHash } from './encode'

describe('decodeTree', () => {
  it('不正なノード構造は null', () => {
    const enc = (v: unknown) => compressToEncodedURIComponent(JSON.stringify(v))
    expect(decodeTree(enc({}))).toBeNull()
    expect(decodeTree(enc([{ id: 1, type: 'file', name: 'a' }]))).toBeNull()
    expect(decodeTree(enc([{ id: '1', type: 'file' }]))).toBeNull()
    expect(decodeTree(enc([{ id: '1', type: 'directory', name: 'd' }]))).toBeNull()
    expect(decodeTree(enc([{ id: '1', type: 'other', name: 'd' }]))).toBeNull()
    expect(decodeTree(enc([null]))).toBeNull()
  })

  it('壊れた JSON や空文字は null', () => {
    expect(decodeTree('')).toBeNull()
    expect(decodeTree(compressToEncodedURIComponent('{not json'))).toBeNull()
  })

  it('入れ子のノードを検証し、空配列は有効', () => {
    expect(decodeTree(encodeTree([]))).toEqual([])
    const bad = [{ id: '1', type: 'directory', name: 'd', children: [{ id: 2 }] }]
    expect(decodeTree(compressToEncodedURIComponent(JSON.stringify(bad)))).toBeNull()
  })
})

describe('decodeText / encodeText', () => {
  it('日本語・改行を往復できる', () => {
    const t = 'ソース/\n  あ.ts\n'
    expect(decodeText(encodeText(t))).toBe(t)
  })

  it('空文字や解釈不能な入力は null', () => {
    expect(decodeText('')).toBeNull()
  })
})

describe('textFromHash', () => {
  it('"#" 無しでも解釈でき、未知のパラメータは空文字', () => {
    const text = 'a\n  b'
    expect(textFromHash(toHash(text).slice(1))).toBe(text)
    expect(textFromHash('#foo=bar')).toBe('')
  })

  it('text と data が両方あれば text を優先する', () => {
    const hash = `#text=${encodeText('new')}&data=${encodeTree([{ id: '1', type: 'file', name: 'old' }])}`
    expect(textFromHash(hash)).toBe('new')
  })

  it('壊れた data は空文字', () => {
    expect(textFromHash('#data=%%%')).toBe('')
  })
})

describe('toHash', () => {
  it('空文字なら空、あれば #text= を付ける', () => {
    expect(toHash('')).toBe('')
    expect(toHash('a')).toBe(`#text=${encodeText('a')}`)
  })
})
