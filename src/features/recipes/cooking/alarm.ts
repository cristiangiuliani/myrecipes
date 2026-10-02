let audioContext: AudioContext | null = null

// Browsers only allow audio after a user gesture, so call this from the "start timer" click;
// the alarm itself fires later from an interval, outside any gesture.
export function primeAlarm() {
  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()
}

export function playAlarm() {
  navigator.vibrate?.([300, 150, 300, 150, 300])
  if (!audioContext) return

  const start = audioContext.currentTime
  for (let i = 0; i < 3; i++) {
    const beepStart = start + i * 0.45
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, beepStart)
    gain.gain.exponentialRampToValueAtTime(0.4, beepStart + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, beepStart + 0.3)
    oscillator.connect(gain).connect(audioContext.destination)
    oscillator.start(beepStart)
    oscillator.stop(beepStart + 0.3)
  }
}
