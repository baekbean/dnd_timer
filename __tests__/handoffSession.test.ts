import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  hasHandoffBeenViewed,
  isHandoffHiddenToday,
  markHandoffHiddenToday,
  markHandoffViewed,
} from '@/lib/timer/handoffSession'

describe('handoff session gating', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 17, 12))
  })

  it('hides the prompt for the rest of the local calendar day', () => {
    expect(isHandoffHiddenToday()).toBe(false)

    markHandoffHiddenToday()

    expect(localStorage.getItem('dnd-handoff-hide-date')).toBe('2026-07-17')
    expect(isHandoffHiddenToday()).toBe(true)
  })

  it('automatically allows the prompt again on the next local day', () => {
    markHandoffHiddenToday()
    vi.setSystemTime(new Date(2026, 6, 18, 0, 1))

    expect(isHandoffHiddenToday()).toBe(false)
  })

  it('tracks prompt views only in session storage', () => {
    expect(hasHandoffBeenViewed()).toBe(false)

    markHandoffViewed()

    expect(hasHandoffBeenViewed()).toBe(true)
    expect(sessionStorage.getItem('dnd-handoff-viewed')).toBe('1')
    expect(localStorage.getItem('dnd-handoff-viewed')).toBeNull()
  })
})
