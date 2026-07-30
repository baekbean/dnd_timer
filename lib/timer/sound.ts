export type AmbientPresetId = 'white' | 'brown' | 'rain' | 'birds' | 'gardenCrickets' | 'nightBugs'
// Brown leads the list — it's the default preset (see store.ts), so it
// should be the first thing people see in the Sound panel.
export const AMBIENT_PRESET_IDS: readonly AmbientPresetId[] = [
  'brown',
  'white',
  'rain',
  'birds',
  'gardenCrickets',
  'nightBugs',
]

const NOISE_BUFFER_SECONDS = 4
const LOOP_SEAM_FADE_SECONDS = 0.15

/**
 * Real field recordings for 4 of the 6 presets — same CC0 (public domain)
 * assets as the macOS app's SoundEngine, see NookTimerMac/CREDITS.md for
 * provenance. 'white' and 'brown' stay synthesized (no recording fits them).
 */
const AMBIENT_FILE_SRC: Partial<Record<AmbientPresetId, string>> = {
  rain: '/audio/ambient-rain.m4a',
  birds: '/audio/ambient-birds.m4a',
  gardenCrickets: '/audio/ambient-dusk.m4a',
  nightBugs: '/audio/ambient-night.m4a',
}

/**
 * Blends the final `fadeFrames` samples into the opening and returns the
 * trimmed result, so looping the buffer doesn't click at the seam — same
 * technique as NookTimerMac's SoundEngine.crossfadeSeam. Operates on a plain
 * array (not an AudioBuffer) so it's testable without a real AudioContext.
 */
export function crossfadeLoopSeam(channel: Float32Array, fadeFrames: number): Float32Array<ArrayBuffer> {
  const n = channel.length
  const fade = Math.max(0, Math.min(Math.floor(n / 8), fadeFrames))
  const outLength = n - fade
  // Built via `new Float32Array` (not `.slice()`) so the result is always
  // plain-ArrayBuffer-backed, matching what AudioBuffer.copyToChannel expects.
  const out = new Float32Array(outLength)
  out.set(channel.subarray(0, outLength))
  for (let i = 0; i < fade; i++) {
    const t = i / fade
    out[i] = channel[i] * t + channel[n - fade + i] * (1 - t)
  }
  return out
}

/**
 * Client-only sound engine. Everything runs through one AudioContext so the
 * whole soundscape unlocks with the first user gesture (iPad Safari requires it).
 *
 * 'white'/'brown' are synthesized (no recording fits a generic noise bed).
 * The other 4 presets are real recordings, fetched and decoded lazily on
 * first selection, then cached — picking the built-in presets never pays
 * that cost.
 */
class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambientGain: GainNode | null = null
  private ambientSource: AudioBufferSourceNode | null = null
  private volume = 0.6
  private fileBufferCache = new Map<string, AudioBuffer>()
  /** Bumped on every startAmbient/stopAmbient so a slow-resolving fetch from
   * an earlier request can't clobber whatever is playing now. */
  private ambientRequestId = 0

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

  /** Call from a user-gesture handler to unlock audio that started while suspended. */
  resume() {
    this.ensureContext()
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume))
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05)
    }
  }

  private createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * NOISE_BUFFER_SECONDS, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  /** The original placeholder texture — a soft, filtered brown noise. */
  private createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * NOISE_BUFFER_SECONDS, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    return buffer
  }

  private startSynthesizedAmbient(ctx: AudioContext, presetId: AmbientPresetId) {
    if (!this.masterGain) return
    const source = ctx.createBufferSource()
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'

    if (presetId === 'brown') {
      source.buffer = this.createBrownNoiseBuffer(ctx)
      lowpass.frequency.value = 400
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5)
    } else {
      // 'white' — only shaves the harshest digital top end, stays broadband
      // unlike brown. Reads louder than brown at equal amplitude, so the
      // target gain is lower.
      source.buffer = this.createWhiteNoiseBuffer(ctx)
      lowpass.frequency.value = 8000
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.5)
    }

    source.connect(lowpass)
    lowpass.connect(gain)
    gain.connect(this.masterGain)
    source.start()
    this.ambientSource = source
    this.ambientGain = gain
  }

  /** Fetched/decoded once per src, then reused for every later selection. */
  private async loadFileBuffer(ctx: AudioContext, src: string): Promise<AudioBuffer | null> {
    const cached = this.fileBufferCache.get(src)
    if (cached) return cached
    try {
      // A rejected fetch already falls back to synthesized brown noise below
      // — but a *stalled* request (flaky network, captive portal) never
      // rejects on its own, so nothing would ever trigger that fallback and
      // the person would get silence instead of the preset they picked.
      const res = await fetch(src, { signal: AbortSignal.timeout(8000) })
      const arrayBuffer = await res.arrayBuffer()
      const decoded = await ctx.decodeAudioData(arrayBuffer)
      const fadeFrames = Math.round(decoded.sampleRate * LOOP_SEAM_FADE_SECONDS)
      const channels: Float32Array<ArrayBuffer>[] = []
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        channels.push(crossfadeLoopSeam(decoded.getChannelData(ch), fadeFrames))
      }
      const trimmed = ctx.createBuffer(decoded.numberOfChannels, channels[0].length, decoded.sampleRate)
      for (let ch = 0; ch < channels.length; ch++) {
        trimmed.copyToChannel(channels[ch], ch)
      }
      this.fileBufferCache.set(src, trimmed)
      return trimmed
    } catch {
      return null
    }
  }

  /** Beds are loudness-normalized offline to ≈ −23 dBFS RMS (see
   * NookTimerMac/CREDITS.md), so they play at unity into the master gain. */
  private playFileBuffer(ctx: AudioContext, buffer: AudioBuffer) {
    if (!this.masterGain) return
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5)
    source.connect(gain)
    gain.connect(this.masterGain)
    source.start()
    this.ambientSource = source
    this.ambientGain = gain
  }

  startAmbient(presetId: AmbientPresetId) {
    const ctx = this.ensureContext()
    if (!ctx || !this.masterGain) return
    this.stopAmbient()
    const requestId = ++this.ambientRequestId

    const fileSrc = AMBIENT_FILE_SRC[presetId]
    if (fileSrc) {
      this.loadFileBuffer(ctx, fileSrc).then((buffer) => {
        // Superseded by a newer call (preset changed again, or stopped)
        // while the fetch/decode was in flight.
        if (requestId !== this.ambientRequestId) return
        if (buffer) {
          this.playFileBuffer(ctx, buffer)
        } else {
          // Missing/corrupt resource — fall back to the synthesized bed
          // rather than leaving the person with silence.
          this.startSynthesizedAmbient(ctx, 'brown')
        }
      })
      return
    }

    this.startSynthesizedAmbient(ctx, presetId)
  }

  stopAmbient() {
    this.ambientRequestId++
    if (this.ambientSource && this.ctx && this.ambientGain) {
      const src = this.ambientSource
      const gain = this.ambientGain
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15)
      setTimeout(() => {
        try {
          src.stop()
        } catch {}
        // Otherwise the (stopped, but still wired into masterGain) node
        // chain from every preset switch stays connected indefinitely.
        src.disconnect()
        gain.disconnect()
      }, 600)
    }
    this.ambientSource = null
    this.ambientGain = null
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
