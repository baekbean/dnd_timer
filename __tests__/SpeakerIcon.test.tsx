import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SpeakerIcon from '@/components/timer/SpeakerIcon'
import { CONE_PATH, WAVE_ARC_PATH, X_MARK_PATH } from './helpers/speakerIconPaths'

// Shared glyph: cone path always renders, plus either the volume-2 wave-arc
// paths (unmuted) or the volume-x X-mark paths (muted). Consumers
// (TimerApp's pill, SoundPanel's mute button) only assert the branch swap
// indirectly through their own rendered output — this covers the component
// itself in isolation, including the cone-always-present claim neither
// consumer test checks.

describe('SpeakerIcon', () => {
  it('renders the cone plus wave-arc paths when unmuted, no X-mark paths', () => {
    const { container } = render(<SpeakerIcon muted={false} color="#343434" />)

    expect(container.querySelector(`path[d*="${CONE_PATH}"]`)).toBeTruthy()
    expect(container.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeTruthy()
    expect(container.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeNull()
  })

  it('renders the cone plus X-mark paths when muted, no wave-arc paths', () => {
    const { container } = render(<SpeakerIcon muted={true} color="#343434" />)

    expect(container.querySelector(`path[d*="${CONE_PATH}"]`)).toBeTruthy()
    expect(container.querySelector(`path[d*="${X_MARK_PATH}"]`)).toBeTruthy()
    expect(container.querySelector(`path[d*="${WAVE_ARC_PATH}"]`)).toBeNull()
  })

  it('applies the color prop as the fill on every path and forwards className to the svg, when unmuted', () => {
    const { container } = render(
      <SpeakerIcon muted={false} color="#EBEBF5" className="opacity-60" />
    )

    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('opacity-60')

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
    paths.forEach((path) => {
      expect(path.getAttribute('fill')).toBe('#EBEBF5')
    })
  })

  it('applies the color prop as the fill on every path when muted too', () => {
    const { container } = render(<SpeakerIcon muted={true} color="#EBEBF5" />)

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
    paths.forEach((path) => {
      expect(path.getAttribute('fill')).toBe('#EBEBF5')
    })
  })
})
