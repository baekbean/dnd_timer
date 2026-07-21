'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Chrome/Edge (desktop + Android) fire `beforeinstallprompt` and expose a
 * deferred prompt we can trigger from our own CTA instead of the browser's
 * native install icon. Safari (macOS + iPadOS) has no such API — there is no
 * programmatic way to trigger "Add to Home Screen" there, so the caller
 * falls back to on-screen instructions when `isAvailable` is false.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type AddToHomeScreenResult = 'accepted' | 'dismissed' | 'unavailable'

export function useAddToHomeScreen() {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      // Stop Chrome's default mini-infobar so our own CTA is the only entry point.
      e.preventDefault()
      deferredRef.current = e as BeforeInstallPromptEvent
      setIsAvailable(true)
    }
    const onInstalled = () => {
      deferredRef.current = null
      setIsAvailable(false)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<AddToHomeScreenResult> => {
    const deferred = deferredRef.current
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferredRef.current = null
    setIsAvailable(false)
    return outcome
  }

  return { isAvailable, promptInstall }
}
