export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

// Running timers store an absolute end time rather than counting down, so they stay
// accurate even when the browser throttles intervals in a background tab.
export interface TimerState {
  durationMs: number
  remainingMs: number
  endsAt: number | null
  status: TimerStatus
}

export function createTimer(durationMs: number): TimerState {
  return { durationMs, remainingMs: durationMs, endsAt: null, status: 'idle' }
}

export function startTimer(timer: TimerState, now: number): TimerState {
  if (timer.status === 'running' || timer.status === 'done') return timer
  return { ...timer, status: 'running', endsAt: now + timer.remainingMs }
}

export function pauseTimer(timer: TimerState, now: number): TimerState {
  if (timer.status !== 'running') return timer
  return { ...timer, status: 'paused', remainingMs: getRemainingMs(timer, now), endsAt: null }
}

export function resetTimer(timer: TimerState): TimerState {
  return createTimer(timer.durationMs)
}

export function getRemainingMs(timer: TimerState, now: number): number {
  if (timer.status !== 'running' || timer.endsAt === null) return timer.remainingMs
  return Math.max(0, timer.endsAt - now)
}

// Returns the same object when nothing changed, so callers can cheaply detect transitions
export function tickTimer(timer: TimerState, now: number): TimerState {
  if (timer.status !== 'running' || getRemainingMs(timer, now) > 0) return timer
  return { ...timer, status: 'done', remainingMs: 0, endsAt: null }
}

// A finished timer can only be extended; otherwise the adjustment must leave time on the clock
export function canAdjustTimer(timer: TimerState, deltaMs: number, now: number): boolean {
  if (timer.status === 'done') return deltaMs > 0
  return getRemainingMs(timer, now) + deltaMs > 0
}

// Adds or removes time without interrupting the countdown; extending a finished timer restarts it
export function adjustTimer(timer: TimerState, deltaMs: number, now: number): TimerState {
  if (!canAdjustTimer(timer, deltaMs, now)) return timer
  const durationMs = timer.durationMs + deltaMs
  if (timer.status === 'done') return { durationMs, remainingMs: deltaMs, endsAt: now + deltaMs, status: 'running' }
  if (timer.status === 'running' && timer.endsAt !== null) return { ...timer, durationMs, endsAt: timer.endsAt + deltaMs }
  return { ...timer, durationMs, remainingMs: timer.remainingMs + deltaMs }
}
