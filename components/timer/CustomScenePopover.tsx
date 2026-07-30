'use client'

import { useRef, useState } from 'react'
import { Modal, Popover } from 'reshaped'
import { parseYoutubeVideoId } from '@/lib/timer/youtube'

export const INVALID_URL_MESSAGE = "That doesn't look like a YouTube link."

interface Props {
  /** Video currently in the custom slot — prefilled so it's clear what's set. */
  videoId: string
  /** True when the slot still holds the shipped default. */
  isDefault: boolean
  /** Error carried in from the player (embedding blocked, video removed…). */
  initialError?: string | null
  /** Bottom-anchored popover, or a centered dialog where the keyboard would cover it. */
  variant: 'popover' | 'dialog'
  /** Element the popover is anchored to — unused for the dialog variant. */
  triggerRef?: React.RefObject<HTMLElement | null>
  onSubmit: (videoId: string) => void
  onResetToDefault: () => void
  onInvalid: () => void
  onClose: () => void
}

export default function CustomScenePopover({
  videoId,
  isDefault,
  initialError = null,
  variant,
  triggerRef,
  onSubmit,
  onResetToDefault,
  onInvalid,
  onClose,
}: Props) {
  const [value, setValue] = useState(`https://youtu.be/${videoId}`)
  const [error, setError] = useState<string | null>(initialError)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Not `autoFocus`: React's autoFocus calls the native focus() without
  // `preventScroll`, which hits the same smooth-scroll-to-bottom bug as the
  // resubmit focus below — the popover's floating position hasn't finished
  // recalculating for this render frame yet. Also not a mount `useEffect`:
  // Reshaped's Popover.Content defers rendering its children by a frame
  // while it settles the floating position, so the input doesn't exist yet
  // when this component's own effect would run — a ref callback fires
  // exactly when the input node itself is inserted, whenever that is.
  const setInputRef = (el: HTMLInputElement | null) => {
    inputRef.current = el
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseYoutubeVideoId(value)
    if (!parsed) {
      setError(INVALID_URL_MESSAGE)
      onInvalid()
      // Reshaped's theme sets `scroll-behavior: smooth` globally, and a
      // focus() on this already-visible input can otherwise trigger a
      // page-wide smooth-scroll if the popover's floating position hasn't
      // finished recalculating for this render frame yet.
      inputRef.current?.focus({ preventScroll: true })
      return
    }
    setError(null)
    onSubmit(parsed)
  }

  // Box styling (background/radius/shadow/padding) comes from the Popover or
  // Modal wrapper below — this is just the content.
  const card = (
    <form
      onSubmit={handleSubmit}
      // The Modal variant is already its own labeled dialog — a nested
      // role="dialog" here would be a redundant/confusing landmark for AT.
      role={variant === 'popover' ? 'dialog' : undefined}
      aria-label={variant === 'popover' ? 'Background video' : undefined}
    >
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="custom-scene-url"
          className="font-pretendard text-[13px] text-[#343434]"
        >
          YouTube link
        </label>
        <button
          type="button"
          aria-label="Close background video editor"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-[#343434]/5"
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="#343434" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="custom-scene-url"
          ref={setInputRef}
          // Deliberately not type="url": native constraint validation would
          // block submit (with its own bubble) before our parser runs, and it
          // rejects a bare video id, which we accept.
          type="text"
          inputMode="url"
          spellCheck={false}
          autoComplete="off"
          value={value}
          placeholder="https://youtu.be/…"
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-lg border border-[#343434]/15 bg-[#F6F6F3] px-3 py-2 font-pretendard text-[14px] text-[#343434] outline-none focus:border-[#343434]/40"
        />
        <button
          type="submit"
          aria-label="Apply background video"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#74856E] transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 font-pretendard text-[12px] text-[#b4483c]">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="font-pretendard text-[11px] text-[#343434]/45">
          Ads may appear on some videos.
        </p>
        {!isDefault && (
          <button
            type="button"
            onClick={onResetToDefault}
            className="shrink-0 font-pretendard text-[11px] text-[#343434]/55 underline underline-offset-2 transition-colors hover:text-[#343434]"
          >
            Use default
          </button>
        )}
      </div>
    </form>
  )

  if (variant === 'dialog') {
    return (
      <Modal active onClose={onClose} ariaLabel="Background video">
        {card}
      </Modal>
    )
  }

  return (
    <Popover
      active
      onClose={onClose}
      positionRef={triggerRef}
      position="top"
      width="min(320px, calc(100vw - 32px))"
    >
      <Popover.Content>{card}</Popover.Content>
    </Popover>
  )
}
