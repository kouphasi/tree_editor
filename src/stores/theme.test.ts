import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { THEME_KEY, createThemeSettings } from './theme'

function stubStorage(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial }
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => void (data[k] = v),
    removeItem: (k: string) => void delete data[k],
  })
  return data
}

function stubDocument() {
  const dataset: Record<string, string | undefined> = {}
  vi.stubGlobal('document', { documentElement: { dataset } })
  return dataset
}

const make = () => {
  const scope = effectScope()
  return { s: scope.run(() => createThemeSettings())!, dispose: () => scope.stop() }
}

describe('createThemeSettings', () => {
  let dataset: Record<string, string | undefined>
  beforeEach(() => {
    dataset = stubDocument()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('保存値がなければ OS 設定に従い、data-theme を付けない', () => {
    stubStorage()
    const { s, dispose } = make()
    expect(s.mode.value).toBe('system')
    expect(dataset.theme).toBeUndefined()
    dispose()
  })

  it('保存値を復元して data-theme に反映する', () => {
    stubStorage({ [THEME_KEY]: 'dark' })
    const { s, dispose } = make()
    expect(s.mode.value).toBe('dark')
    expect(dataset.theme).toBe('dark')
    dispose()
  })

  it('不正な保存値は system として扱う', () => {
    stubStorage({ [THEME_KEY]: 'sepia' })
    const { s, dispose } = make()
    expect(s.mode.value).toBe('system')
    dispose()
  })

  it('自動 → ライト → ダーク → 自動 の順に切り替わり、保存される', () => {
    const data = stubStorage()
    const { s, dispose } = make()
    s.cycle()
    expect([s.mode.value, dataset.theme, data[THEME_KEY]]).toEqual(['light', 'light', 'light'])
    s.cycle()
    expect([s.mode.value, dataset.theme, data[THEME_KEY]]).toEqual(['dark', 'dark', 'dark'])
    s.cycle()
    expect([s.mode.value, dataset.theme, data[THEME_KEY]]).toEqual(['system', undefined, undefined])
    dispose()
  })
})
