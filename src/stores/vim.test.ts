import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { createVimSettings } from './vim'

function stubStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => void (data[k] = v),
  })
  return data
}

const make = () => {
  const scope = effectScope()
  return { s: scope.run(() => createVimSettings())!, dispose: () => scope.stop() }
}

describe('createVimSettings', () => {
  beforeEach(() => void stubStorage())
  afterEach(() => vi.unstubAllGlobals())

  it('初期値は無効・空の vimrc', () => {
    const { s, dispose } = make()
    expect(s.enabled.value).toBe(false)
    expect(s.vimrc.value).toBe('')
    dispose()
  })

  it('localStorage から復元する', () => {
    stubStorage({ 'tree-editor:vim': '1', 'tree-editor:vimrc': 'set nu' })
    const { s, dispose } = make()
    expect(s.enabled.value).toBe(true)
    expect(s.vimrc.value).toBe('set nu')
    dispose()
  })

  it('設定変更を保存する', () => {
    const data = stubStorage()
    const { s, dispose } = make()
    s.setEnabled(true)
    s.setVimrc('nmap a b')
    expect(s.enabled.value).toBe(true)
    expect(s.vimrc.value).toBe('nmap a b')
    expect(data).toEqual({ 'tree-editor:vim': '1', 'tree-editor:vimrc': 'nmap a b' })
    s.setEnabled(false)
    expect(data['tree-editor:vim']).toBe('0')
    dispose()
  })

  it('localStorage が使えなくても動作する', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
    })
    const { s, dispose } = make()
    expect(s.enabled.value).toBe(false)
    expect(() => s.setEnabled(true)).not.toThrow()
    expect(s.enabled.value).toBe(true)
    dispose()
  })
})
