import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyboardInset } from '@/lib/timer/useKeyboardInset'

class FakeVisualViewport extends EventTarget {
  height: number
  offsetTop: number

  constructor(height: number, offsetTop = 0) {
    super()
    this.height = height
    this.offsetTop = offsetTop
  }
}

describe('useKeyboardInset', () => {
  let fakeViewport: FakeVisualViewport

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    fakeViewport = new FakeVisualViewport(800)
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: fakeViewport })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 0 initially when the keyboard is closed', () => {
    const { result } = renderHook(() => useKeyboardInset(true))
    expect(result.current).toBe(0)
  })

  it('updates after a simulated resize (keyboard opens, height shrinks)', () => {
    const { result } = renderHook(() => useKeyboardInset(true))

    act(() => {
      fakeViewport.height = 500
      fakeViewport.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(300)
  })

  it('updates after a scroll-only change (offsetTop moves, height unchanged)', () => {
    const { result } = renderHook(() => useKeyboardInset(true))

    act(() => {
      fakeViewport.height = 500
      fakeViewport.offsetTop = 50
      fakeViewport.dispatchEvent(new Event('scroll'))
    })

    expect(result.current).toBe(250)
  })

  it('returns 0 and never throws when window.visualViewport is absent', () => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })

    expect(() => {
      renderHook(() => useKeyboardInset(true))
    }).not.toThrow()
  })

  it('does not attach any visualViewport listener when disabled', () => {
    const addSpy = vi.spyOn(fakeViewport, 'addEventListener')

    renderHook(() => useKeyboardInset(false))

    expect(addSpy).not.toHaveBeenCalled()
  })

  it('removes its listeners on unmount', () => {
    const addSpy = vi.spyOn(fakeViewport, 'addEventListener')
    const removeSpy = vi.spyOn(fakeViewport, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyboardInset(true))
    const resizeCall = addSpy.mock.calls.find(([type]) => type === 'resize')
    const scrollCall = addSpy.mock.calls.find(([type]) => type === 'scroll')
    expect(resizeCall).toBeTruthy()
    expect(scrollCall).toBeTruthy()

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', resizeCall![1])
    expect(removeSpy).toHaveBeenCalledWith('scroll', scrollCall![1])
  })
})
