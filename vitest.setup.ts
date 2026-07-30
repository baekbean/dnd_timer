import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

/** jsdom has no matchMedia, and hooks like useLandscape call it on mount. */
function createMatchMedia() {
  return (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

/** jsdom has no ResizeObserver, and Reshaped's Popover/ScrollArea observe size on mount. */
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: createStorage() })
  Object.defineProperty(window, 'sessionStorage', { configurable: true, value: createStorage() })
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: createMatchMedia() })
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: MockResizeObserver })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
