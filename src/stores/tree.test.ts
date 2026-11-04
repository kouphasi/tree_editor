import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { createTreeStore } from './tree'
import { encodeText } from '../lib/url-state/encode'

const make = () => {
  const scope = effectScope()
  return { s: scope.run(() => createTreeStore())!, dispose: () => scope.stop() }
}

describe('createTreeStore', () => {
  const replaceState = vi.fn()
  const loc = { hash: '', pathname: '/p', search: '?q=1' }

  beforeEach(() => {
    vi.useFakeTimers()
    replaceState.mockClear()
    loc.hash = ''
    vi.stubGlobal('location', loc)
    vi.stubGlobal('history', { replaceState })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('URL hash から初期テキストを復元し、tree を導出する', () => {
    loc.hash = `#text=${encodeText('a\n  b')}`
    const { s, dispose } = make()
    expect(s.text.value).toBe('a\n  b')
    expect(s.tree.value).toHaveLength(1)
    dispose()
  })

  it('テキスト変更で tree が更新される', () => {
    const { s, dispose } = make()
    expect(s.tree.value).toEqual([])
    s.setText('x/')
    expect(s.tree.value.map((n) => n.name)).toEqual(['x'])
    dispose()
  })

  it('連続変更は間引かれ、最後の値だけが hash に反映される', () => {
    const { s, dispose } = make()
    vi.advanceTimersByTime(300)
    replaceState.mockClear()
    s.setText('a')
    vi.advanceTimersByTime(100)
    s.setText('ab')
    vi.advanceTimersByTime(299)
    expect(replaceState).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(replaceState).toHaveBeenCalledTimes(1)
    expect(replaceState).toHaveBeenCalledWith(null, '', `#text=${encodeText('ab')}`)
    dispose()
  })

  it('テキストが空なら hash を消して pathname+search にする', () => {
    const { dispose } = make()
    vi.advanceTimersByTime(300)
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '/p?q=1')
    dispose()
  })
})
