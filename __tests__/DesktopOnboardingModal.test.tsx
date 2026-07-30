import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Reshaped } from 'reshaped'
import DesktopOnboardingModal from '@/components/timer/DesktopOnboardingModal'

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

function renderModal(onClose = vi.fn()) {
  render(
    <Reshaped>
      <DesktopOnboardingModal onClose={onClose} />
    </Reshaped>
  )
  return onClose
}

describe('DesktopOnboardingModal', () => {
  it('renders as a labeled dialog with its instructions', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Keep DnD Timer one tap away')).toBeTruthy()
  })

  it('closes on the close button', () => {
    const onClose = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape', () => {
    const onClose = renderModal()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when a child of the card is clicked', () => {
    const onClose = renderModal()
    const text = screen.getByText('Keep DnD Timer one tap away')
    fireEvent.mouseDown(text)
    fireEvent.mouseUp(text)
    expect(onClose).not.toHaveBeenCalled()
  })
})
