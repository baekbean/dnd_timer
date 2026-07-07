import type { Scene } from '@/lib/timer/scenes'

/**
 * Client-only sound engine. Everything runs through one AudioContext so the
 * whole soundscape unlocks with the first user gesture (iPad Safari requires it).
 *
 * Ambient 'noise' is a synthesized placeholder until real per-scene loops are
 * produced; 'file' ambients play a looping <audio> element routed to the same graph.
 */
class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambientGain: GainNode | null = null
  private ambientSource: AudioBufferSourceNode | null = null
  private ambientAudioEl: HTMLAudioElement | null = null
  private volume = 0.6

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? window.webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume))
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05)
    }
    if (this.ambientAudioEl) this.ambientAudioEl.volume = this.volume
  }

  startAmbient(scene: Scene) {
    const ctx = this.ensureContext()
    if (!ctx || !this.masterGain) return
    this.stopAmbient()

    if (scene.ambient.kind === 'file') {
      const el = new Audio(scene.ambient.src)
      el.loop = true
      el.volume = this.volume
      el.play().catch(() => {})
      this.ambientAudioEl = el
      return
    }

    // Placeholder: soft filtered brown noise, gently faded in
    const seconds = 4
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 400

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5)

    source.connect(lowpass)
    lowpass.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.ambientSource = source
    this.ambientGain = gain
  }

  stopAmbient() {
    if (this.ambientSource && this.ctx && this.ambientGain) {
      const src = this.ambientSource
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15)
      setTimeout(() => {
        try {
          src.stop()
        } catch {}
      }, 600)
    }
    this.ambientSource = null
    this.ambientGain = null
    if (this.ambientAudioEl) {
      this.ambientAudioEl.pause()
      this.ambientAudioEl = null
    }
  }

  /** Soft two-tone bell for session transitions. */
  playChime() {
    const ctx = this.ensureContext()
    if (!ctx || !this.masterGain) return
    const now = ctx.currentTime
    const notes = [
      { freq: 830.6, at: 0 }, // G#5
      { freq: 622.3, at: 0.18 }, // D#5
    ]
    for (const { freq, at } of notes) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now + at)
      gain.gain.linearRampToValueAtTime(0.25, now + at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 1.4)
      osc.connect(gain)
      gain.connect(this.masterGain)
      osc.start(now + at)
      osc.stop(now + at + 1.5)
    }
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export const soundEngine = new SoundEngine()
