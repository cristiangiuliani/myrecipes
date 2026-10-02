import { useCallback, useEffect, useRef, useState } from 'react'
import type { RecipeStep } from '../types'
import { adjustTimer, createTimer, pauseTimer, resetTimer, startTimer, tickTimer, type TimerState } from './timer'

const TICK_MS = 250

type TimersByStepId = Record<string, TimerState>

function createTimers(steps: RecipeStep[]): TimersByStepId {
  const timers: TimersByStepId = {}
  for (const step of steps) {
    if (step.timerSeconds) timers[step.id] = createTimer(step.timerSeconds * 1000)
  }
  return timers
}

// Keeps timers of steps still listed, drops the rest (stopping them, so no alarm fires for a
// hidden step) and adds fresh timers for newly listed steps
function syncTimers(prev: TimersByStepId, steps: RecipeStep[]): TimersByStepId {
  const fresh = createTimers(steps)
  for (const id of Object.keys(fresh)) {
    if (prev[id]) fresh[id] = prev[id]
  }
  return fresh
}

// One independent timer per timed step, so a long rest can keep running while the cook moves on.
// `steps` may change (e.g. switching cooking method): timers follow the steps currently listed.
export function useStepTimers(steps: RecipeStep[], onFinish: (stepId: string) => void) {
  const [timers, setTimers] = useState(() => createTimers(steps))
  const stepsKey = steps.map((step) => step.id).join('|')
  const [syncedStepsKey, setSyncedStepsKey] = useState(stepsKey)
  if (syncedStepsKey !== stepsKey) {
    setSyncedStepsKey(stepsKey)
    setTimers((prev) => syncTimers(prev, steps))
  }
  const [now, setNow] = useState(() => Date.now())
  const onFinishRef = useRef(onFinish)
  const previousTimers = useRef(timers)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  const anyRunning = Object.values(timers).some((timer) => timer.status === 'running')

  useEffect(() => {
    if (!anyRunning) return
    const interval = setInterval(() => {
      const current = Date.now()
      setNow(current)
      setTimers((prev) => {
        let changed = false
        const next: TimersByStepId = {}
        for (const [id, timer] of Object.entries(prev)) {
          next[id] = tickTimer(timer, current)
          if (next[id] !== timer) changed = true
        }
        return changed ? next : prev
      })
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [anyRunning])

  useEffect(() => {
    for (const [id, timer] of Object.entries(timers)) {
      if (timer.status === 'done' && previousTimers.current[id]?.status !== 'done') onFinishRef.current(id)
    }
    previousTimers.current = timers
  }, [timers])

  const update = useCallback((stepId: string, fn: (timer: TimerState, now: number) => TimerState) => {
    const current = Date.now()
    setNow(current)
    setTimers((prev) => (prev[stepId] ? { ...prev, [stepId]: fn(prev[stepId], current) } : prev))
  }, [])

  const start = useCallback((stepId: string) => update(stepId, startTimer), [update])
  const pause = useCallback((stepId: string) => update(stepId, pauseTimer), [update])
  const reset = useCallback((stepId: string) => update(stepId, resetTimer), [update])
  const adjust = useCallback(
    (stepId: string, deltaMs: number) => update(stepId, (timer, now) => adjustTimer(timer, deltaMs, now)),
    [update],
  )
  const setDuration = useCallback(
    (stepId: string, durationMs: number) => update(stepId, () => createTimer(durationMs)),
    [update],
  )

  return { timers, now, start, pause, reset, adjust, setDuration }
}
