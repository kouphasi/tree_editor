import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { createVimSettings } from './vim'

function stubStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => void (data[k] = v),
  })
  return data
}

const make = () => createRoot((dispose) => ({ s: createVimSettings(), dispose }))

describe('createVimSettings', () => {
  beforeEach(() => void stubStorage())
  afterEach(() => vi.unstubAllGlobals())

  it('初期値は無効・空の vimrc', () => {
    const { s, dispose } = make()
    expect(s.enabled()).toBe(false)
    expect(s.vimrc()).toBe('')
    dispose()
  })

  it('localStorage から復元する', () => {
    stubStorage({ 'tree-editor:vim': '1', 'tree-editor:vimrc': 'set nu' })
    const { s, dispose } = make()
    expect(s.enabled()).toBe(true)
    expect(s.vimrc()).toBe('set nu')
    dispose()
  })

  it('設定変更を保存する', () => {
    const data = stubStorage()
    const { s, dispose } = make()
    s.setEnabled(true)
    s.setVimrc('nmap a b')
    expect(s.enabled()).toBe(true)
    expect(s.vimrc()).toBe('nmap a b')
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
    expect(s.enabled()).toBe(false)
    expect(() => s.setEnabled(true)).not.toThrow()
    expect(s.enabled()).toBe(true)
    dispose()
  })
})
