import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFullscreen } from '@/lib/timer/useFullscreen'

describe('useFullscreen', () => {
  let fullscreenEl: Element | null
  let requestFullscreenMock: ReturnType<typeof vi.fn>
  let exitFullscreenMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fullscreenEl = null

    requestFullscreenMock = vi.fn(() => Promise.resolve())
    exitFullscreenMock = vi.fn(() => {
      fullscreenEl = null
      return Promise.resolve()
    })

    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      writable: true,
      value: requestFullscreenMock,
    })
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      writable: true,
      value: exitFullscreenMock,
    })
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenEl,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function makeRef() {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const ref = createRef<HTMLElement | null>()
    ref.current = el
    return { el, ref }
  }

  function dispatchFullscreenChange() {
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'))
    })
  }

  it('requests fullscreen on the target element, never on document.documentElement', () => {
    const { el, ref } = makeRef()
    const { result } = renderHook(() => useFullscreen(ref))

    act(() => {
      result.current.toggle()
    })

    expect(requestFullscreenMock).toHaveBeenCalledOnce()
    expect(requestFullscreenMock.mock.instances[0]).toBe(el)
    expect(requestFullscreenMock.mock.instances[0]).not.toBe(document.documentElement)
  })

  it('exits fullscreen instead of requesting again when already fullscreen', () => {
    const { el, ref } = makeRef()
    fullscreenEl = el

    const { result } = renderHook(() => useFullscreen(ref))

    act(() => {
      result.current.toggle()
    })

    expect(exitFullscreenMock).toHaveBeenCalledOnce()
    expect(requestFullscreenMock).not.toHaveBeenCalled()
  })

  it('is only true when this element is the fullscreen one, not any element', () => {
    const { el, ref } = makeRef()
    const otherEl = document.createElement('div')
    document.body.appendChild(otherEl)

    const { result } = renderHook(() => useFullscreen(ref))

    fullscreenEl = otherEl
    dispatchFullscreenChange()
    expect(result.current.isFullscreen).toBe(false)

    fullscreenEl = el
    dispatchFullscreenChange()
    expect(result.current.isFullscreen).toBe(true)

    fullscreenEl = null
    dispatchFullscreenChange()
    expect(result.current.isFullscreen).toBe(false)
  })

  it('swallows a rejected requestFullscreen() promise without throwing', async () => {
    const { ref } = makeRef()
    requestFullscreenMock.mockImplementationOnce(() => Promise.reject(new Error('denied')))

    const { result } = renderHook(() => useFullscreen(ref))

    expect(() => {
      act(() => {
        result.current.toggle()
      })
    }).not.toThrow()

    // Let the swallowed rejection's .catch() run so it doesn't surface as an
    // unhandled rejection in a later test.
    await act(async () => {
      await Promise.resolve().then(() => Promise.resolve())
    })
  })

  it('removes the fullscreenchange listener on unmount', () => {
    const { ref } = makeRef()
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useFullscreen(ref))

    const [, handler] = addSpy.mock.calls.find(([type]) => type === 'fullscreenchange')!

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('fullscreenchange', handler)
  })
})
