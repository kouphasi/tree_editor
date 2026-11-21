import { describe, expect, it } from 'vitest'
import { isClipboardSyncEnabled, isUnnamed, pickExternalClipboard } from './clipboard'

describe('isClipboardSyncEnabled', () => {
  it('unnamed / unnamedplus を含むと有効', () => {
    expect(isClipboardSyncEnabled('unnamedplus')).toBe(true)
    expect(isClipboardSyncEnabled('unnamed')).toBe(true)
    expect(isClipboardSyncEnabled('autoselect, unnamed')).toBe(true)
  })

  it('空・その他の値は無効', () => {
    expect(isClipboardSyncEnabled('')).toBe(false)
    expect(isClipboardSyncEnabled('autoselect')).toBe(false)
    expect(isClipboardSyncEnabled(undefined)).toBe(false)
  })
})

describe('isUnnamed', () => {
  it('未指定と " は無名レジスタ', () => {
    expect(isUnnamed(undefined)).toBe(true)
    expect(isUnnamed('')).toBe(true)
    expect(isUnnamed('"')).toBe(true)
    expect(isUnnamed('a')).toBe(false)
  })
})

describe('pickExternalClipboard', () => {
  it('自分が書き込んだ内容と同じなら無名レジスタを使う', () => {
    expect(pickExternalClipboard('src/\n', 'src/\n')).toBeNull()
  })

  it('空のクリップボードは無視する', () => {
    expect(pickExternalClipboard('', null)).toBeNull()
    expect(pickExternalClipboard(null, null)).toBeNull()
  })

  it('外部コピーは採用し、末尾改行で行単位を判定する', () => {
    expect(pickExternalClipboard('foo', 'bar')).toEqual({ text: 'foo', linewise: false })
    expect(pickExternalClipboard('a\nb\n', null)).toEqual({ text: 'a\nb\n', linewise: true })
  })
})
