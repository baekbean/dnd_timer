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

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: createStorage() })
  Object.defineProperty(window, 'sessionStorage', { configurable: true, value: createStorage() })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
