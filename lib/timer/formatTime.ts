function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

// Digit displays are sized for the common "MM:SS" case (4 digits, 1 colon).
// Long focus durations can push the hour segment to 2-3 digits (e.g. "166:39:00"),
// which would overflow at that same size, so scale font size down to compensate.
export function getDigitScale(timeText: string) {
  const digitCount = (timeText.match(/\d/g) ?? []).length
  const colonCount = (timeText.match(/:/g) ?? []).length
  const weight = digitCount * 0.74 + colonCount * 0.36
  const baselineWeight = 4 * 0.74 + 1 * 0.36
  return Math.min(1, baselineWeight / weight)
}
