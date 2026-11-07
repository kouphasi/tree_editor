import { describe, expect, it } from 'vitest'
import { isIdleNormalMode } from './escape'

const normal = { insertMode: false, visualMode: false }

describe('isIdleNormalMode', () => {
  it('vim 状態が無ければ false', () => {
    expect(isIdleNormalMode(undefined)).toBe(false)
  })

  it('入力途中のコマンドが無いノーマルモードなら true', () => {
    expect(isIdleNormalMode(normal)).toBe(true)
    expect(isIdleNormalMode({ ...normal, inputState: { operator: null, prefixRepeat: [], motionRepeat: [], keyBuffer: [] } })).toBe(true)
  })

  it('INSERT / VISUAL モードでは false', () => {
    expect(isIdleNormalMode({ insertMode: true, visualMode: false })).toBe(false)
    expect(isIdleNormalMode({ insertMode: false, visualMode: true })).toBe(false)
  })

  it('オペレータ・カウント・キー入力・レジスタ指定の途中では false', () => {
    expect(isIdleNormalMode({ ...normal, inputState: { operator: 'delete' } })).toBe(false)
    expect(isIdleNormalMode({ ...normal, inputState: { prefixRepeat: ['2'] } })).toBe(false)
    expect(isIdleNormalMode({ ...normal, inputState: { motionRepeat: ['3'] } })).toBe(false)
    expect(isIdleNormalMode({ ...normal, inputState: { keyBuffer: ['g'] } })).toBe(false)
    expect(isIdleNormalMode({ ...normal, inputState: { registerName: 'a' } })).toBe(false)
  })
})
